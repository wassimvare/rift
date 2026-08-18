(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RiftCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SAVE_VERSION = 1;
  const SAVE_KEY = 'rift.phase0.save';
  const LEGACY_CREDITS_KEY = 'rxCredits';
  const STARTER_IDS = ['ion', 'ghost', 'volt'];
  const MAX_HISTORY = 50;

  function uid(prefix = 'itm') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function starterInventory() {
    return STARTER_IDS.map((id, index) => ({ uid: `starter_${index + 1}`, id, acquiredAt: 0 }));
  }

  function defaultState() {
    return {
      saveVersion: SAVE_VERSION,
      credits: 4200,
      shards: 12,
      selectedMode: 'ranked',
      inventory: starterInventory(),
      equippedItems: { Frame: null, Trail: null, 'Core Skin': null, 'Goal FX': null, Banner: null },
      xp: 0,
      level: 1,
      stats: { matches: 0, wins: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, streak: 0, bestStreak: 0, abandoned: 0 },
      settings: { audio: true, haptics: true, cameraShake: true },
      missions: [],
      matchHistory: [],
    };
  }

  function normalizeInventory(list) {
    if (!Array.isArray(list)) return starterInventory();
    return list.map((entry, index) => {
      if (typeof entry === 'string') return { uid: `legacy_${index}_${entry}`, id: entry, acquiredAt: 0 };
      if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string') return null;
      return { uid: typeof entry.uid === 'string' && entry.uid ? entry.uid : uid('itm'), id: entry.id, acquiredAt: Number.isFinite(entry.acquiredAt) ? entry.acquiredAt : 0 };
    }).filter(Boolean);
  }

  function migrateState(raw, legacyCredits) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object') {
      if (Number.isFinite(legacyCredits) && legacyCredits >= 0) base.credits = legacyCredits;
      return base;
    }
    return {
      ...base, ...raw, saveVersion: SAVE_VERSION,
      credits: Number.isFinite(raw.credits) && raw.credits >= 0 ? raw.credits : base.credits,
      shards: Number.isFinite(raw.shards) && raw.shards >= 0 ? raw.shards : base.shards,
      selectedMode: ['ranked','quick','blitz'].includes(raw.selectedMode || raw.mode) ? (raw.selectedMode || raw.mode) : base.selectedMode,
      inventory: normalizeInventory(raw.inventory || raw.inv),
      equippedItems: { ...base.equippedItems, ...(raw.equippedItems || raw.equipped || {}) },
      stats: { ...base.stats, ...(raw.stats || {}) },
      settings: { ...base.settings, ...(raw.settings || {}) },
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

  function goalBounds(height) { return { top: height / 2 - 115, bottom: height / 2 + 115, leftLine: 52 }; }

  function isBallInsideGoal(ball, width, height) {
    if (!ball || !Number.isFinite(ball.x) || !Number.isFinite(ball.y) || !Number.isFinite(ball.r)) return null;
    const { top, bottom, leftLine } = goalBounds(height);
    if (!(ball.y > top && ball.y < bottom)) return null;
    if (ball.x - ball.r <= leftLine) return 'left';
    if (ball.x + ball.r >= width - leftLine) return 'right';
    return null;
  }

  function shouldEnterOvertime(timeRemaining, scoreA, scoreB) { return timeRemaining <= 0 && scoreA === scoreB; }
  function matchOutcome(scoreA, scoreB) { return scoreA > scoreB ? 'win' : scoreA < scoreB ? 'loss' : 'draw'; }

  function applyMatchResult(state, result) {
    const outcome = matchOutcome(result.scoreA, result.scoreB);
    state.stats.matches += 1;
    state.stats.goalsFor += result.scoreA;
    state.stats.goalsAgainst += result.scoreB;
    if (outcome === 'win') {
      state.stats.wins += 1; state.stats.streak += 1; state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.streak);
    } else if (outcome === 'loss') {
      state.stats.losses += 1; state.stats.streak = 0;
    }
    state.credits += result.credits || 0; state.shards += result.shards || 0; state.xp += result.xp || 0;
    addMatchHistory(state, { id: result.id || uid('match'), at: result.at || Date.now(), mode: result.mode, scoreA: result.scoreA, scoreB: result.scoreB, outcome, overtime: !!result.overtime, credits: result.credits || 0, xp: result.xp || 0 });
    return outcome;
  }

  return { SAVE_VERSION, SAVE_KEY, LEGACY_CREDITS_KEY, MAX_HISTORY, defaultState, migrateState, loadState, saveState, addInventoryItem, addMatchHistory, goalBounds, isBallInsideGoal, shouldEnterOvertime, matchOutcome, applyMatchResult };
});
