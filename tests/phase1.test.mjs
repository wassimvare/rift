import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, itemById } from '../dist-test/data/catalog.js';
import { MODES } from '../dist-test/data/modes.js';
import { Store } from '../dist-test/state/Store.js';
import { MarketService } from '../dist-test/economy/MarketService.js';
import { ProgressionService } from '../dist-test/progression/ProgressionService.js';
import { LocalNetworkGateway } from '../dist-test/network/NetworkGateway.js';
import { AISystem } from '../dist-test/game/ai/AISystem.js';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, value) { this.map.set(key, value); }
}

test('catalog isolated from gameplay', () => {
  assert.ok(CATALOG.length >= 9);
  assert.equal(itemById('volt').type, 'Frame');
});

test('mode data isolated', () => {
  assert.equal(MODES.ranked.goal, 5);
  assert.equal(MODES.blitz.time, 90);
});

test('Store persists and notifies', () => {
  const store = new Store(new MemoryStorage());
  let notifications = 0;
  store.subscribe(() => notifications++);
  store.update((state) => { state.credits = 1111; });
  assert.equal(store.get().credits, 1111);
  assert.equal(notifications, 1);
});

test('Store preserves legacy save compatibility', () => {
  const storage = new MemoryStorage();
  const first = new Store(storage);
  first.update((state) => {
    state.credits = 5432;
    state.settings.touchLayout = 'left';
  });
  const second = new Store(storage);
  assert.equal(second.get().credits, 5432);
  assert.equal(second.get().settings.touchLayout, 'left');
});

test('MarketService owns purchase mutations', () => {
  const store = new Store(new MemoryStorage());
  const market = new MarketService(store);
  const result = market.buy('ion');
  assert.equal(result.ok, true);
  assert.equal(store.get().credits, 3960);
  assert.equal(store.get().inventory.length, 4);
});

test('ProgressionService owns abandonment history', () => {
  const store = new Store(new MemoryStorage());
  const progression = new ProgressionService(store);
  progression.abandon({ mode: 'ranked', scoreA: 1, scoreB: 2, overtime: false });
  assert.equal(store.get().stats.abandoned, 1);
  assert.equal(store.get().matchHistory[0].outcome, 'abandoned');
});

test('NetworkGateway exposes a replaceable local transport boundary', () => {
  const gateway = new LocalNetworkGateway();
  const session = gateway.openMatch('quick');
  assert.equal(session.mode, 'quick');
  assert.equal(session.transport, 'local');
  gateway.closeMatch(session.id);
});

test('AI is exposed as a dedicated system', () => {
  assert.equal(typeof new AISystem().update, 'function');
});
