import type { MatchState, NormalizedInput } from '../../types/game.js';
import type { AbilitySystem } from '../abilities/AbilitySystem.js';
import { normalizeInput } from '../physics/vector.js';

export class AISystem {
  update(game: MatchState, dt: number, abilities: AbilitySystem): NormalizedInput {
    const predict = 9 + Math.min(18, Math.hypot(game.ball.vx, game.ball.vy) * 1.2);
    const input = normalizeInput(
      game.ball.x + game.ball.vx * predict + 75 - game.b.x,
      game.ball.y + game.ball.vy * predict * 0.7 - game.b.y,
      1,
    );
    const distance = Math.hypot(game.ball.x - game.b.x, game.ball.y - game.b.y);
    if (game.b.dashCd <= 0 && distance > 285 && Math.random() < 0.009 * game.m.ai * dt * 60) {
      abilities.dash(game.b, input);
    }
    if (game.b.pulseCd <= 0 && distance < 245 && Math.random() < 0.045 * game.m.ai * dt * 60) {
      abilities.pulse(game.b);
    }
    return input;
  }
}
