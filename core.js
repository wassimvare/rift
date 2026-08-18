(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RiftCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SAVE_VERSION = 2;
  const SAVE_KEY = 'rift.phase0.save';
  const LEGACY_CREDITS_KEY = 'rxCredits';
  const STARTER_IDS = ['ion', 'ghost', 'volt'];
  const MAX_HISTORY = 50;

  const DEFAULT_KEYMAP = Object.freeze({
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    dash: 'Space',
    pulse: 'KeyE',
    polarity: 'KeyQ',
    burst: 'KeyF',
    pause: 'KeyP',
  });

  const GAMEPLAY = Object.freeze({
    playerAcceleration: 0.86,
    playerMovingFriction: 0.918,
    playerIdleFriction: 0.82,
    playerMaxSpeed: 9.8,
    dashImpulse: 12.4,
    dashCooldown: 1.45,
    dashActive: 0.18,
    perfectDashMultiplier: 1.52,
    perfectDashFlux: 18,
    pulseRange: 285,
    pulseCooldown: 0.68,
    pulseMinForce: 4.4,
    pulseMaxForce: 16.8,
    pulseComboMultiplier: 1.16,
    burstRange: 445,
    burstForce: 25.5,
    coreFriction: 0.996,
    coreMaxSpeed: 20.5,
    wallRestitution: 0.92,
    maxSubsteps: 5,
    substepTravel: 12,
    controllerDeadzone: 0.16,
  });

  function uid(prefix = 'itm') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
  }

  function starterInventory() {
    return STARTER_IDS.map((id, index) => ({ uid: `starter_${index + 1}`, id, acquiredAt: 0 }));
  }

  function defaultSettings() {
    return {
      audio: true,
      haptics: true,
      cameraShake: true,
      joystickSensitivity: 1,
      touchScale: 1,
      touchInset: 12,
      touchLayout: 'right',
      controller: true,
      keymap: { ...DEFAULT_KEYMAP },
    };
  }

  function defaultState() {
    return {
      saveVersion: SAVE_VERSION,
      credits: 4200,
      shards: 12,
      selectedMode: 'ranked',
      inventory: starterInventory(),
      equippedItems: {
        Frame: null,
        Trail: null,
        'Core Skin': null,
        'Goal FX': null,
        Banner: null,
      },
      xp: 0,
      level: 1,
      stats: {
        matches: 0,
        wins: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        streak: 0,
        bestStreak: 0,
        abandoned: 0,
      },
      settings: defaultSettings(),
      missions: [],
      matchHistory: [],
    };
  }

  function normalizeInventory(list) {
    if (!Array.isArray(list)) return starterInventory();
    return list.map((entry, index) => {
      if (typeof entry === 'string') return { uid: `legacy_${index}_${entry}`, id: entry, acquiredAt: 0 };
      if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string') return null;
      return {
        uid: typeof entry.uid === 'string' && entry.uid ? entry.uid : uid('itm'),
        id: entry.id,
        acquiredAt: Number.isFinite(entry.acquiredAt) ? entry.acquiredAt : 0,
      };
    }).filter(Boolean);
  }

  function normalizeSettings(raw) {
    const base = defaultSettings();
    const input = raw && typeof raw === 'object' ? raw : {};
    return {
      ...base,
      ...input,
      audio: input.audio !== false,
      haptics: input.haptics !== false,
      cameraShake: input.cameraShake !== false,
      joystickSensitivity: clamp(Number(input.joystickSensitivity ?? base.joystickSensitivity), 0.6, 1.5),
      touchScale: clamp(Number(input.touchScale ?? base.touchScale), 0.8, 1.3),
      touchInset: clamp(Number(input.touchInset ?? base.touchInset), 6, 36),
      touchLayout: input.touchLayout === 'left' ? 'left' : 'right',
      controller: input.controller !== false,
      keymap: { ...DEFAULT_KEYMAP, ...(input.keymap || {}) },
    };
  }

  function migrateState(raw, legacyCredits) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object') {
      if (Number.isFinite(legacyCredits) && legacyCredits >= 0) base.credits = legacyCredits;
      return base;
    }

    return {
      ...base,
      ...raw,
      saveVersion: SAVE_VERSION,
      credits: Number.isFinite(raw.credits) && raw.credits >= 0 ? raw.credits : base.credits,
      shards: Number.isFinite(raw.shards) && raw.shards >= 0 ? raw.shards : base.shards,
      selectedMode: ['ranked', 'quick', 'blitz'].includes(raw.selectedMode || raw.mode) ? (raw.selectedMode || raw.mode) : base.selectedMode,
      inventory: normalizeInventory(raw.inventory || raw.inv),
      equippedItems: { ...base.equippedItems, ...(raw.equippedItems || raw.equipped || {}) },
      stats: { ...base.stats, ...(raw.stats || {}) },
      settings: normalizeSettings(raw.settings),
      missions: Array.isArray(raw.missions) ? raw.missions : [],
      matchHistory: Array.isArray(raw.matchHistory) ? raw.matchHistory.slice(0, MAX_HISTORY) : [],
    };
  }

  function loadState(storage) {
    const legacyRaw = storage?.getItem?.(LEGACY_CREDITS_KEY);
    const legacyParsed = legacyRaw === null || legacyRaw === undefined || legacyRaw === '' ? undefined : Number(legacyRaw);
    const legacyValue = Number.isFinite(legacyParsed) && legacyParsed >= 0 ? legacyParsed : undefined;
    try {
      const raw = storage?.getItem?.(SAVE_KEY);
      if (!raw) return migrateState(null, legacyValue);
      return migrateState(JSON.parse(raw), legacyValue);
    } catch (_) {
      return migrateState(null, legacyValue);
    }
  }

  function saveState(storage, state) {
    const normalized = migrateState(state);
    storage?.setItem?.(SAVE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function addInventoryItem(state, id, acquiredAt = Date.now()) {
    state.inventory.push({ uid: uid('itm'), id, acquiredAt });
    return state.inventory[state.inventory.length - 1];
  }

  function addMatchHistory(state, entry) {
    state.matchHistory.unshift(entry);
    if (state.matchHistory.length > MAX_HISTORY) state.matchHistory.length = MAX_HISTORY;
  }

  function goalBounds(height) {
    return { top: height / 2 - 115, bottom: height / 2 + 115, leftLine: 52 };
  }

  function isBallInsideGoal(ball, width, height) {
    if (!ball || !Number.isFinite(ball.x) || !Number.isFinite(ball.y) || !Number.isFinite(ball.r)) return null;
    const { top, bottom, leftLine } = goalBounds(height);
    const inOpening = ball.y > top && ball.y < bottom;
    if (!inOpening) return null;
    if (ball.x - ball.r <= leftLine) return 'left';
    if (ball.x + ball.r >= width - leftLine) return 'right';
    return null;
  }

  function shouldEnterOvertime(timeRemaining, scoreA, scoreB) {
    return timeRemaining <= 0 && scoreA === scoreB;
  }

  function matchOutcome(scoreA, scoreB) {
    if (scoreA > scoreB) return 'win';
    if (scoreA < scoreB) return 'loss';
    return 'draw';
  }

  function applyMatchResult(state, result) {
    const outcome = matchOutcome(result.scoreA, result.scoreB);
    state.stats.matches += 1;
    state.stats.goalsFor += result.scoreA;
    state.stats.goalsAgainst += result.scoreB;
    if (outcome === 'win') {
      state.stats.wins += 1;
      state.stats.streak += 1;
      state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.streak);
    } else if (outcome === 'loss') {
      state.stats.losses += 1;
      state.stats.streak = 0;
    }
    state.credits += result.credits || 0;
    state.shards += result.shards || 0;
    state.xp += result.xp || 0;
    addMatchHistory(state, {
      id: result.id || uid('match'),
      at: result.at || Date.now(),
      mode: result.mode,
      scoreA: result.scoreA,
      scoreB: result.scoreB,
      outcome,
      overtime: !!result.overtime,
      credits: result.credits || 0,
      xp: result.xp || 0,
    });
    return outcome;
  }

  function normalizeInput(x, y, sensitivity = 1) {
    const sx = Number.isFinite(x) ? x : 0;
    const sy = Number.isFinite(y) ? y : 0;
    const magnitude = Math.hypot(sx, sy);
    if (magnitude <= 0.0001) return { x: 0, y: 0, magnitude: 0 };
    const scaledMagnitude = clamp(magnitude * clamp(sensitivity, 0.6, 1.5), 0, 1);
    return { x: sx / magnitude * scaledMagnitude, y: sy / magnitude * scaledMagnitude, magnitude: scaledMagnitude };
  }

  function applyDeadzone(value, deadzone = GAMEPLAY.controllerDeadzone) {
    const v = clamp(Number(value) || 0, -1, 1);
    const a = Math.abs(v);
    if (a <= deadzone) return 0;
    return Math.sign(v) * (a - deadzone) / (1 - deadzone);
  }

  function stepMovement(vx, vy, inputX, inputY, dt, config = GAMEPLAY) {
    const frame = clamp(dt * 60, 0, 2);
    const input = normalizeInput(inputX, inputY, 1);
    let outX = Number.isFinite(vx) ? vx : 0;
    let outY = Number.isFinite(vy) ? vy : 0;
    if (input.magnitude > 0.001) {
      outX += input.x * config.playerAcceleration * frame;
      outY += input.y * config.playerAcceleration * frame;
      const friction = Math.pow(config.playerMovingFriction, frame);
      outX *= friction; outY *= friction;
    } else {
      const friction = Math.pow(config.playerIdleFriction, frame);
      outX *= friction; outY *= friction;
    }
    const speed = Math.hypot(outX, outY);
    if (speed > config.playerMaxSpeed) {
      outX = outX / speed * config.playerMaxSpeed;
      outY = outY / speed * config.playerMaxSpeed;
    }
    if (Math.abs(outX) < 0.003) outX = 0;
    if (Math.abs(outY) < 0.003) outY = 0;
    return { vx: outX, vy: outY };
  }

  function pulseForce(distance, polarity = 1, combo = false, config = GAMEPLAY) {
    if (!Number.isFinite(distance) || distance <= 0 || distance >= config.pulseRange) return 0;
    const t = 1 - distance / config.pulseRange;
    const curve = t * t * (3 - 2 * t);
    const force = config.pulseMinForce + (config.pulseMaxForce - config.pulseMinForce) * curve;
    return force * (combo ? config.pulseComboMultiplier : 1) * (polarity < 0 ? -1 : 1);
  }

  function burstForce(distance, config = GAMEPLAY) {
    if (!Number.isFinite(distance) || distance < 0 || distance >= config.burstRange) return 0;
    return config.burstForce * Math.max(0.25, 1 - distance / (config.burstRange * 1.15));
  }

  function isPerfectDash(dashActive, alreadyConsumed, distance, contactDistance) {
    return dashActive > 0 && !alreadyConsumed && Number.isFinite(distance) && distance <= contactDistance + 3;
  }

  function physicsSubsteps(vx, vy, dt, config = GAMEPLAY) {
    const travel = Math.hypot(Number(vx) || 0, Number(vy) || 0) * clamp(dt * 60, 0, 2);
    return clamp(Math.ceil(travel / config.substepTravel), 1, config.maxSubsteps);
  }

  function bounceVelocity(velocity, restitution = GAMEPLAY.wallRestitution) {
    const v = Number.isFinite(velocity) ? velocity : 0;
    if (v === 0) return 0;
    return -v * clamp(restitution, 0, 1);
  }

  return {
    SAVE_VERSION,
    SAVE_KEY,
    LEGACY_CREDITS_KEY,
    MAX_HISTORY,
    DEFAULT_KEYMAP,
    GAMEPLAY,
    defaultSettings,
    defaultState,
    migrateState,
    loadState,
    saveState,
    addInventoryItem,
    addMatchHistory,
    goalBounds,
    isBallInsideGoal,
    shouldEnterOvertime,
    matchOutcome,
    applyMatchResult,
    normalizeInput,
    applyDeadzone,
    stepMovement,
    pulseForce,
    burstForce,
    isPerfectDash,
    physicsSubsteps,
    bounceVelocity,
  };
});
