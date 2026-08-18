import type { MatchState, NormalizedInput, PlayerEntity } from '../../types/game.js';
import { ARENA, GAMEPLAY } from '../config.js';
import { goalBounds, isBallInsideGoal } from '../rules/goals.js';
import { physicsSubsteps, stepMovement } from './vector.js';
import type { AbilitySystem } from '../abilities/AbilitySystem.js';

export interface PhysicsPorts {
  onGoal(side: 'left' | 'right'): void;
}

export class PhysicsSystem {
  constructor(
    private readonly abilities: AbilitySystem,
    private readonly ports: PhysicsPorts,
  ) {}

  step(game: MatchState, playerInput: NormalizedInput, aiInput: NormalizedInput, dt: number): void {
    this.updatePlayerMotion(game.a, playerInput, dt);
    this.updatePlayerMotion(game.b, aiInput, dt);
    if (aiInput.magnitude > 0.05) game.b.face = Math.atan2(aiInput.y, aiInput.x);

    const ballFriction = Math.pow(GAMEPLAY.coreFriction, dt * 60);
    game.ball.vx *= ballFriction;
    game.ball.vy *= ballFriction;
    const maxBall = GAMEPLAY.coreMaxSpeed * game.m.coreSpeed;
    const ballSpeed = Math.hypot(game.ball.vx, game.ball.vy);
    if (ballSpeed > maxBall) {
      game.ball.vx = (game.ball.vx / ballSpeed) * maxBall;
      game.ball.vy = (game.ball.vy / ballSpeed) * maxBall;
    }

    const steps = physicsSubsteps(game.ball.vx, game.ball.vy, dt);
    const sub = dt / steps;
    for (let i = 0; i < steps; i += 1) {
      this.integratePlayer(game.a, sub);
      this.integratePlayer(game.b, sub);
      game.ball.x += game.ball.vx * sub * 60;
      game.ball.y += game.ball.vy * sub * 60;
      this.abilities.collision(game.a, 1.28);
      this.abilities.collision(game.b, 1.13);
      this.playerPlayerCollision(game.a, game.b);
      if (this.wallAndGoalStep(game)) return;
    }
    this.guardCore(game, dt);
  }

  updateEffects(game: MatchState, dt: number): void {
    game.shake = Math.max(0, game.shake - dt * 28);
    game.flash = Math.max(0, game.flash - dt * 2.7);
    game.hitSfxCd = Math.max(0, game.hitSfxCd - dt);
    for (const particle of game.particles) {
      particle.x += particle.vx * dt * 60;
      particle.y += particle.vy * dt * 60;
      particle.vx *= Math.pow(0.94, dt * 60);
      particle.vy *= Math.pow(0.94, dt * 60);
      particle.life -= dt;
    }
    game.particles = game.particles.filter((particle) => particle.life > 0);
    for (const ring of game.rings) ring.life -= dt;
    game.rings = game.rings.filter((ring) => ring.life > 0);
  }

  private updatePlayerMotion(player: PlayerEntity, input: NormalizedInput, dt: number): void {
    const velocity = stepMovement(player.vx, player.vy, input.x, input.y, dt);
    player.vx = velocity.vx;
    player.vy = velocity.vy;
    if (input.magnitude > 0.05) player.face = Math.atan2(input.y, input.x);
    player.dashCd = Math.max(0, player.dashCd - dt);
    player.dashActive = Math.max(0, player.dashActive - dt);
    player.pulseCd = Math.max(0, player.pulseCd - dt);
  }

  private integratePlayer(player: PlayerEntity, dt: number): void {
    player.x = Math.max(54, Math.min(ARENA.width - 54, player.x + player.vx * dt * 60));
    player.y = Math.max(54, Math.min(ARENA.height - 54, player.y + player.vy * dt * 60));
    player.trail.push({ x: player.x, y: player.y, boost: player.dashActive > 0 });
    if (player.trail.length > 16) player.trail.shift();
  }

  private playerPlayerCollision(a: PlayerEntity, b: PlayerEntity): void {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    const minimum = a.r + b.r;
    if (!(distance < minimum && distance > 0)) return;
    const nx = dx / distance;
    const ny = dy / distance;
    const overlap = minimum - distance;
    a.x -= (nx * overlap) / 2;
    b.x += (nx * overlap) / 2;
    a.y -= (ny * overlap) / 2;
    b.y += (ny * overlap) / 2;
    const relative = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (relative > 0) {
      const impulse = relative * 0.58;
      a.vx -= nx * impulse;
      b.vx += nx * impulse;
      a.vy -= ny * impulse;
      b.vy += ny * impulse;
    }
  }

  private wallAndGoalStep(game: MatchState): boolean {
    const ball = game.ball;
    const goal = isBallInsideGoal(ball, ARENA.width, ARENA.height);
    if (goal) {
      this.ports.onGoal(goal);
      return true;
    }
    const bounds = goalBounds(ARENA.height);
    const inOpening = ball.y > bounds.top && ball.y < bounds.bottom;
    if (ball.y - ball.r < ARENA.wall) {
      ball.y = ARENA.wall + ball.r;
      ball.vy = Math.abs(ball.vy) * GAMEPLAY.wallRestitution;
    }
    if (ball.y + ball.r > ARENA.height - ARENA.wall) {
      ball.y = ARENA.height - ARENA.wall - ball.r;
      ball.vy = -Math.abs(ball.vy) * GAMEPLAY.wallRestitution;
    }
    if (!inOpening && ball.x - ball.r < bounds.leftLine) {
      ball.x = bounds.leftLine + ball.r;
      ball.vx = Math.abs(ball.vx) * GAMEPLAY.wallRestitution;
    }
    if (!inOpening && ball.x + ball.r > ARENA.width - bounds.leftLine) {
      ball.x = ARENA.width - bounds.leftLine - ball.r;
      ball.vx = -Math.abs(ball.vx) * GAMEPLAY.wallRestitution;
    }
    return false;
  }

  private guardCore(game: MatchState, dt: number): void {
    const ball = game.ball;
    if (![ball.x, ball.y, ball.vx, ball.vy].every(Number.isFinite)) {
      ball.x = ARENA.width / 2;
      ball.y = ARENA.height / 2;
      ball.vx = 0;
      ball.vy = 0;
      ball.wallStuck = 0;
      return;
    }
    const nearWall =
      ball.x < 82 || ball.x > ARENA.width - 82 || ball.y < 92 || ball.y > ARENA.height - 92;
    if (nearWall && Math.hypot(ball.vx, ball.vy) < 0.22) ball.wallStuck += dt;
    else ball.wallStuck = 0;
    if (ball.wallStuck > 1.2) {
      const dx = ARENA.width / 2 - ball.x;
      const dy = ARENA.height / 2 - ball.y;
      const distance = Math.hypot(dx, dy) || 1;
      ball.vx = (dx / distance) * 3.2;
      ball.vy = (dy / distance) * 3.2;
      ball.wallStuck = 0;
    }
    ball.x = Math.max(-60, Math.min(ARENA.width + 60, ball.x));
    ball.y = Math.max(ARENA.wall + ball.r, Math.min(ARENA.height - ARENA.wall - ball.r, ball.y));
  }
}
