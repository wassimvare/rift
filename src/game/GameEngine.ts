import { MODES } from '../data/modes.js';
import type { ModeId, MatchState } from '../types/game.js';
import type { PlayerState } from '../types/state.js';
import type { Store } from '../state/Store.js';
import { createBall, createPlayer } from './entities/factories.js';
import { ARENA, GAMEPLAY } from './config.js';
import { shouldEnterOvertime } from './rules/goals.js';
import type { InputManager, InputAction } from '../input/InputManager.js';
import type { UiController } from '../ui/UiController.js';
import type { Renderer } from '../ui/Renderer.js';
import type { Sfx } from '../audio/Sfx.js';
import { AbilitySystem } from './abilities/AbilitySystem.js';
import { PhysicsSystem } from './physics/PhysicsSystem.js';
import type { MarketService } from '../economy/MarketService.js';
import type { ProgressionService } from '../progression/ProgressionService.js';
import type { NetworkGateway } from '../network/NetworkGateway.js';
import type { AISystem } from './ai/AISystem.js';

export class GameEngine {
  private game: MatchState | null = null;
  private raf = 0;
  private last = 0;
  private timers = new Set<number>();
  private readonly abilities: AbilitySystem;
  private readonly physics: PhysicsSystem;
  private pointerId: number | null = null;
  private sessionId: string | null = null;

  constructor(
    private readonly store: Store,
    private readonly input: InputManager,
    private readonly ui: UiController,
    private readonly renderer: Renderer,
    private readonly sfx: Sfx,
    private readonly market: MarketService,
    private readonly progression: ProgressionService,
    private readonly network: NetworkGateway,
    private readonly ai: AISystem,
  ) {
    this.abilities = new AbilitySystem(() => this.game, sfx, ui);
    this.physics = new PhysicsSystem(this.abilities, { onGoal: (side) => this.registerGoal(side) });
    this.input.onAction = (action) => this.inputAction(action);
    this.input.onBindingCaptured = (action, code) =>
      this.store.update((state) => {
        state.settings.keymap[action] = code;
      });
    this.store.subscribe((state) => this.ui.render(state, this.input.captureAction));
    addEventListener('gamepadconnected', () => this.ui.render(this.store.get(), this.input.captureAction));
    addEventListener('gamepaddisconnected', () => this.ui.render(this.store.get(), this.input.captureAction));
    this.bindJoystick();
    this.ui.render(this.store.get());
  }

  get state(): PlayerState {
    return this.store.get();
  }

  get hasActiveMatch(): boolean {
    return !!this.game && !this.game.ended;
  }

  startMatch(): void {
    this.clearTimers();
    cancelAnimationFrame(this.raf);
    this.closeNetworkSession();
    this.ui.closeModal();
    const modeId = this.state.selectedMode;
    const mode = MODES[modeId];
    this.sessionId = this.network.openMatch(modeId).id;
    this.game = {
      mode: modeId,
      m: mode,
      a: createPlayer(240, ARENA.height / 2, '#59f5ff'),
      b: createPlayer(ARENA.width - 240, ARENA.height / 2, '#ff5f8f', true),
      ball: createBall(),
      scoreA: 0,
      scoreB: 0,
      time: mode.time,
      phase: 'countdown',
      ended: false,
      overtime: false,
      lastScorer: null,
      particles: [],
      rings: [],
      shake: 0,
      flash: 0,
      freeze: 0,
      hitSfxCd: 0,
    };
    this.ui.setScore(0, 0);
    this.ui.setModeAndClock(mode.name, this.formatTime(mode.time));
    this.ui.setPauseLabel('PAUSE');
    this.ui.setPolarity(false);
    this.ui.gameView();
    this.countdown(3, () => this.beginPlay());
  }

  pause(): void {
    const game = this.game;
    if (!game || game.ended || !['play', 'paused'].includes(game.phase)) return;
    if (game.phase === 'play') {
      game.phase = 'paused';
      this.ui.overlay('PAUSE<small>P / ÉCHAP / Start pour reprendre</small>');
      this.ui.setPauseLabel('REPRENDRE');
    } else {
      game.phase = 'play';
      this.ui.overlay('', false);
      this.ui.setPauseLabel('PAUSE');
      this.last = performance.now();
    }
  }

  restart(): void {
    if (!this.game) return;
    const resume = this.game.phase === 'play';
    if (resume) this.pause();
    this.ui.showModal(
      '<p class="eyebrow">RESTART</p><h2>Recommencer le match ?</h2><p>Le score et le chrono seront remis à zéro.</p><div class="modalActions"><button id="confirmRestart" class="primary">RECOMMENCER</button><button id="cancelRestart" class="secondary">ANNULER</button></div>',
    );
    this.ui.bindConfirm(
      'confirmRestart',
      () => this.startMatch(),
      'cancelRestart',
      () => {
        this.ui.closeModal();
        if (resume && this.game?.phase === 'paused') this.pause();
      },
    );
  }

  quit(): void {
    if (!this.game) return;
    const resume = this.game.phase === 'play';
    if (resume) this.pause();
    this.ui.showModal(
      '<p class="eyebrow">ABANDON</p><h2>Quitter ce match ?</h2><p>Le match sera marqué abandonné.</p><div class="modalActions"><button id="confirmQuit" class="danger">QUITTER LE MATCH</button><button id="cancelQuit" class="secondary">ANNULER</button></div>',
    );
    this.ui.bindConfirm(
      'confirmQuit',
      () => this.abandon(),
      'cancelQuit',
      () => {
        this.ui.closeModal();
        if (resume && this.game?.phase === 'paused') this.pause();
      },
    );
  }

  dash(): void {
    const game = this.game;
    if (game) this.abilities.dash(game.a, this.input.movement());
  }

  pulse(): void {
    if (this.game) this.abilities.pulse(this.game.a);
  }

  polarity(): void {
    const game = this.game;
    if (!game) return;
    game.a.polarity = game.a.polarity === 1 ? -1 : 1;
    this.ui.setPolarity(game.a.polarity === -1);
    this.abilities.spawnRing(game.a.x, game.a.y, game.a.polarity === 1 ? '#59f5ff' : '#ff71c6', 35, 95, 0.28);
    this.sfx.play('toggle');
    this.sfx.vibrate(10);
  }

  burst(): void {
    if (this.game) this.abilities.burst(this.game.a);
  }

  buy(id: string): void {
    const result = this.market.buy(id);
    this.ui.toast(result.message);
  }

  selectMode(mode: ModeId): void {
    this.store.update((state) => {
      state.selectedMode = mode;
    });
  }

  setting<K extends keyof PlayerState['settings']>(key: K, value: PlayerState['settings'][K]): void {
    this.store.update((state) => {
      state.settings[key] = value;
    });
  }

  captureBinding(action: InputAction): void {
    this.input.startCapture(action);
    this.ui.render(this.state, action);
    this.ui.toast('Appuie sur la nouvelle touche');
  }

  navigate(view: string): boolean {
    if (this.hasActiveMatch && view !== 'game') {
      this.quit();
      return false;
    }
    this.ui.navigate(view);
    return true;
  }

  private beginPlay(): void {
    if (!this.game || this.game.ended) return;
    this.game.phase = 'play';
    this.ui.overlay('', false);
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame((now) => this.loop(now));
  }

  private countdown(n: number, done: () => void): void {
    if (!this.game || this.game.ended) return;
    this.game.phase = 'countdown';
    this.ui.overlay(n > 0 ? String(n) : 'GO');
    if (n > 0) this.later(() => this.countdown(n - 1, done), 430);
    else this.later(done, 300);
  }

  private resetKickoff(): void {
    const game = this.game;
    if (!game) return;
    Object.assign(game.a, { x: 240, y: ARENA.height / 2, vx: 0, vy: 0, dashActive: 0, perfectConsumed: false, trail: [] });
    Object.assign(game.b, { x: ARENA.width - 240, y: ARENA.height / 2, vx: 0, vy: 0, dashActive: 0, perfectConsumed: false, trail: [] });
    game.ball = createBall();
    game.rings = [];
    game.particles = [];
    this.countdown(2, () => this.beginPlay());
  }

  private registerGoal(side: 'left' | 'right'): void {
    const game = this.game;
    if (!game || game.phase !== 'play') return;
    game.phase = 'goal';
    const playerScored = side === 'right';
    if (playerScored) {
      game.scoreA += 1;
      game.lastScorer = 'player';
    } else {
      game.scoreB += 1;
      game.lastScorer = 'rival';
    }
    this.ui.setScore(game.scoreA, game.scoreB);
    this.ui.overlay(playerScored ? 'RIFT BREAK!<small>+1 YOU</small>' : 'RIVAL SCORES<small>+1 RIVAL</small>');
    game.shake = Math.max(game.shake, 14);
    game.flash = Math.max(game.flash, 0.42);
    this.abilities.spawnBurst(game.ball.x, game.ball.y, playerScored ? '#59f5ff' : '#ff5f8f', 50, 10);
    this.sfx.play('goal');
    this.sfx.vibrate(playerScored ? 55 : 30);
    if (game.scoreA >= game.m.goal || game.scoreB >= game.m.goal || game.overtime) {
      this.later(() => this.finishMatch(), 760);
    } else {
      this.later(() => this.resetKickoff(), 720);
    }
  }

  private abandon(): void {
    const game = this.game;
    if (!game) return;
    this.clearTimers();
    cancelAnimationFrame(this.raf);
    this.progression.abandon(game);
    this.closeNetworkSession();
    game.ended = true;
    this.game = null;
    this.ui.closeModal();
    this.ui.menuView();
    this.ui.toast('Match abandonné');
  }

  private finishMatch(): void {
    const game = this.game;
    if (!game || game.ended) return;
    this.clearTimers();
    game.ended = true;
    game.phase = 'result';
    const reward = this.progression.complete(game);
    this.closeNetworkSession();
    this.ui.showModal(
      `<p class="eyebrow">MATCH COMPLETE</p><h2>${reward.won ? 'VICTOIRE' : 'DÉFAITE'}</h2><div class="resultScore">${game.scoreA} — ${game.scoreB}</div><div class="resultMeta"><span class="tag">${game.m.name}</span>${game.overtime ? '<span class="tag">OVERTIME</span>' : ''}<span class="tag">+${reward.credits} NC</span><span class="tag">+${reward.xp} XP</span><span class="tag">+${reward.shards} ◆</span></div><div class="modalActions"><button id="rematch" class="primary">REVANCHE</button><button id="resultMenu" class="secondary">RETOUR AU MENU</button></div>`,
    );
    this.ui.bindResult(
      () => this.startMatch(),
      () => {
        this.game = null;
        this.ui.closeModal();
        this.ui.menuView();
      },
    );
  }

  private inputAction(action: InputAction): void {
    if (action === 'pause') this.pause();
    else if (!this.game || this.game.phase !== 'play') return;
    else if (action === 'dash') this.dash();
    else if (action === 'pulse') this.pulse();
    else if (action === 'polarity') this.polarity();
    else if (action === 'burst') this.burst();
  }

  private loop(now: number): void {
    const game = this.game;
    if (!game || game.ended) return;
    const dt = Math.min(0.03, (now - this.last) / 1000 || 0.016);
    this.last = now;
    this.input.pollGamepad();
    this.physics.updateEffects(game, dt);
    if (game.phase === 'play') {
      if (this.input.isDown('dash')) this.dash();
      const aiInput = this.ai.update(game, dt, this.abilities);
      if (game.freeze > 0) game.freeze = Math.max(0, game.freeze - dt);
      else {
        this.physics.step(game, this.input.movement(), aiInput, dt);
        this.matchClock(game, dt);
      }
    }
    this.renderer.draw(game);
    this.updateHud(game);
    this.raf = requestAnimationFrame((time) => this.loop(time));
  }

  private matchClock(game: MatchState, dt: number): void {
    if (!Number.isFinite(game.time)) return;
    game.time -= dt;
    if (shouldEnterOvertime(game.time, game.scoreA, game.scoreB)) {
      game.time = Infinity;
      game.overtime = true;
      this.ui.overlay('OVERTIME<small>Prochain but = victoire</small>');
      this.later(() => {
        if (this.game?.phase === 'play') this.ui.overlay('', false);
      }, 900);
    } else if (game.time <= 0) this.finishMatch();
  }

  private updateHud(game: MatchState): void {
    this.ui.setClock(this.formatTime(game.time));
    const player = game.a;
    const dashPct = 100 - Math.min(100, (player.dashCd / GAMEPLAY.dashCooldown) * 100);
    const pulsePct = 100 - Math.min(100, (player.pulseCd / GAMEPLAY.pulseCooldown) * 100);
    this.ui.abilityHud(dashPct, pulsePct, player.pulseCd <= 0 ? 'OK' : player.pulseCd.toFixed(1), player.flux);
  }

  private formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return 'OT';
    const value = Math.max(0, Math.ceil(seconds));
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }

  private later(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, ms);
    this.timers.add(id);
    return id;
  }

  private clearTimers(): void {
    for (const id of this.timers) clearTimeout(id);
    this.timers.clear();
  }

  private closeNetworkSession(): void {
    if (!this.sessionId) return;
    this.network.closeMatch(this.sessionId);
    this.sessionId = null;
  }

  private bindJoystick(): void {
    const joy = document.querySelector<HTMLElement>('#joy');
    const stick = document.querySelector<HTMLElement>('#stick');
    if (!joy || !stick) return;
    const move = (event: PointerEvent) => {
      const rect = joy.getBoundingClientRect();
      let x = event.clientX - rect.left - rect.width / 2;
      let y = event.clientY - rect.top - rect.height / 2;
      const magnitude = Math.hypot(x, y);
      const max = rect.width * 0.38;
      if (magnitude > max) {
        x = (x / magnitude) * max;
        y = (y / magnitude) * max;
      }
      this.input.setTouch(x / max, y / max);
      stick.style.transform = `translate(${x}px,${y}px)`;
    };
    joy.addEventListener(
      'pointerdown',
      (event) => {
        this.pointerId = event.pointerId;
        joy.setPointerCapture(event.pointerId);
        move(event);
        event.preventDefault();
      },
      { passive: false },
    );
    joy.addEventListener('pointermove', (event) => {
      if (event.pointerId === this.pointerId) move(event);
    });
    const end = (event: PointerEvent) => {
      if (event.pointerId !== this.pointerId) return;
      this.pointerId = null;
      this.input.clearTouch();
      stick.style.transform = 'translate(0,0)';
    };
    joy.addEventListener('pointerup', end);
    joy.addEventListener('pointercancel', end);
  }
}
