import type { MatchState } from '../types/game.js';
import type { Store } from '../state/Store.js';
import { addMatchHistory, applyMatchResult, matchOutcome } from '../state/storage.js';

export interface MatchReward {
  won: boolean;
  credits: number;
  xp: number;
  shards: number;
}

export class ProgressionService {
  constructor(private readonly store: Store) {}

  complete(game: MatchState): MatchReward {
    const won = matchOutcome(game.scoreA, game.scoreB) === 'win';
    const credits = won ? game.m.rewardWin : game.m.rewardLoss;
    const xp = won ? game.m.xpWin : game.m.xpLoss;
    const shards = won ? 2 : 1;
    this.store.update((state) => {
      applyMatchResult(state, {
        mode: game.mode,
        scoreA: game.scoreA,
        scoreB: game.scoreB,
        credits,
        xp,
        overtime: game.overtime,
        at: Date.now(),
      });
    });
    return { won, credits, xp, shards };
  }

  abandon(game: MatchState): void {
    this.store.update((state) => {
      state.stats.abandoned += 1;
      addMatchHistory(state, {
        id: `ab_${Date.now()}`,
        at: Date.now(),
        mode: game.mode,
        scoreA: game.scoreA,
        scoreB: game.scoreB,
        outcome: 'abandoned',
        overtime: game.overtime,
        credits: 0,
        xp: 0,
      });
    });
  }
}
