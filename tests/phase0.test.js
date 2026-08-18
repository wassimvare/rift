const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../core.js');

class MemoryStorage {
  constructor(seed = {}) { this.map = new Map(Object.entries(seed)); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
}

test('default save contains every Phase 0 persistent field', () => {
  const s = Core.defaultState();
  assert.equal(s.saveVersion, Core.SAVE_VERSION);
  assert.ok(Array.isArray(s.inventory));
  assert.ok(s.equippedItems);
  assert.ok(s.stats);
  assert.ok(s.settings);
  assert.ok(Array.isArray(s.missions));
  assert.ok(Array.isArray(s.matchHistory));
});

test('fresh install starts with 4200 credits when no legacy key exists', () => {
  const storage = new MemoryStorage();
  const s = Core.loadState(storage);
  assert.equal(s.credits, 4200);
  assert.equal(s.inventory.length, 3);
});

test('legacy credits migrate without losing starter inventory', () => {
  const storage = new MemoryStorage({ rxCredits: '7337' });
  const s = Core.loadState(storage);
  assert.equal(s.credits, 7337);
  assert.equal(s.inventory.length, 3);
});

test('full state survives save/reload', () => {
  const storage = new MemoryStorage();
  const s = Core.defaultState();
  s.credits = 1234; s.shards = 99; s.selectedMode = 'blitz';
  s.inventory.push({ uid: 'x1', id: 'nova', acquiredAt: 42 });
  s.equippedItems.Frame = 'volt'; s.xp = 350; s.level = 4; s.stats.wins = 8;
  s.settings.haptics = false; s.missions = [{ id: 'm1', progress: 2 }]; s.matchHistory = [{ id: 'h1', scoreA: 2, scoreB: 1 }];
  Core.saveState(storage, s);
  const loaded = Core.loadState(storage);
  assert.equal(loaded.credits, 1234); assert.equal(loaded.shards, 99); assert.equal(loaded.selectedMode, 'blitz');
  assert.equal(loaded.inventory.at(-1).id, 'nova'); assert.equal(loaded.equippedItems.Frame, 'volt'); assert.equal(loaded.xp, 350);
  assert.equal(loaded.stats.wins, 8); assert.equal(loaded.settings.haptics, false); assert.equal(loaded.missions[0].id, 'm1'); assert.equal(loaded.matchHistory[0].id, 'h1');
});

test('right goal scores only inside visible opening', () => {
  const W = 1280, H = 720;
  assert.equal(Core.isBallInsideGoal({ x: 1255, y: 360, r: 25 }, W, H), 'right');
  assert.equal(Core.isBallInsideGoal({ x: 1255, y: 120, r: 25 }, W, H), null);
});

test('left goal scores only inside visible opening', () => {
  const W = 1280, H = 720;
  assert.equal(Core.isBallInsideGoal({ x: 25, y: 360, r: 25 }, W, H), 'left');
  assert.equal(Core.isBallInsideGoal({ x: 25, y: 600, r: 25 }, W, H), null);
});

test('overtime starts only when regulation expires tied', () => {
  assert.equal(Core.shouldEnterOvertime(0, 2, 2), true);
  assert.equal(Core.shouldEnterOvertime(-0.1, 4, 4), true);
  assert.equal(Core.shouldEnterOvertime(0, 3, 2), false);
  assert.equal(Core.shouldEnterOvertime(5, 2, 2), false);
});

test('match result updates statistics and history', () => {
  const s = Core.defaultState();
  const outcome = Core.applyMatchResult(s, { mode: 'ranked', scoreA: 5, scoreB: 3, credits: 620, shards: 2, xp: 100, overtime: false, at: 1 });
  assert.equal(outcome, 'win'); assert.equal(s.stats.matches, 1); assert.equal(s.stats.wins, 1); assert.equal(s.stats.goalsFor, 5); assert.equal(s.stats.goalsAgainst, 3); assert.equal(s.credits, 4820); assert.equal(s.matchHistory[0].outcome, 'win');
});

test('match history is capped', () => {
  const s = Core.defaultState();
  for (let i = 0; i < 70; i++) Core.addMatchHistory(s, { id: `m${i}` });
  assert.equal(s.matchHistory.length, Core.MAX_HISTORY);
  assert.equal(s.matchHistory[0].id, 'm69');
});
