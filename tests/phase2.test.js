const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../core.js');

class MemoryStorage {
  constructor(seed = {}) { this.map = new Map(Object.entries(seed)); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
}

test('Phase 2 settings migrate with safe defaults', () => {
  const old = Core.defaultState();
  old.settings = { audio: false, haptics: true, cameraShake: true };
  const migrated = Core.migrateState(old);
  assert.equal(migrated.settings.audio, false);
  assert.equal(migrated.settings.joystickSensitivity, 1);
  assert.equal(migrated.settings.touchScale, 1);
  assert.equal(migrated.settings.touchLayout, 'right');
  assert.equal(migrated.settings.keymap.dash, 'Space');
});

test('custom controls and mobile tuning persist through save/reload', () => {
  const storage = new MemoryStorage();
  const s = Core.defaultState();
  s.settings.joystickSensitivity = 1.35;
  s.settings.touchScale = 1.2;
  s.settings.touchInset = 28;
  s.settings.touchLayout = 'left';
  s.settings.keymap.dash = 'ShiftLeft';
  Core.saveState(storage, s);
  const loaded = Core.loadState(storage);
  assert.equal(loaded.settings.joystickSensitivity, 1.35);
  assert.equal(loaded.settings.touchScale, 1.2);
  assert.equal(loaded.settings.touchInset, 28);
  assert.equal(loaded.settings.touchLayout, 'left');
  assert.equal(loaded.settings.keymap.dash, 'ShiftLeft');
});

test('movement acceleration builds speed but respects max speed', () => {
  let v = { vx: 0, vy: 0 };
  for (let i = 0; i < 120; i++) v = Core.stepMovement(v.vx, v.vy, 1, 0, 1/60);
  assert.ok(v.vx > 5);
  assert.ok(v.vx <= Core.GAMEPLAY.playerMaxSpeed + 1e-9);
  assert.ok(Math.abs(v.vy) < 1e-9);
});

test('idle friction stops faster than moving friction', () => {
  const idle = Core.stepMovement(8, 0, 0, 0, 1/60);
  const moving = Core.stepMovement(8, 0, 1, 0, 1/60);
  assert.ok(idle.vx < moving.vx);
  assert.ok(idle.vx < 8);
});

test('joystick sensitivity is normalized and clamped', () => {
  const low = Core.normalizeInput(.3, 0, .6);
  const high = Core.normalizeInput(.3, 0, 1.5);
  assert.ok(high.magnitude > low.magnitude);
  const capped = Core.normalizeInput(10, 0, 1.5);
  assert.equal(capped.magnitude, 1);
});

test('controller deadzone removes stick drift', () => {
  assert.equal(Core.applyDeadzone(.05), 0);
  assert.equal(Core.applyDeadzone(-.1), 0);
  assert.ok(Core.applyDeadzone(.7) > .6);
  assert.ok(Core.applyDeadzone(-.7) < -.6);
});

test('Pulse has distance falloff, polarity and dash combo bonus', () => {
  const near = Core.pulseForce(40, 1, false);
  const far = Core.pulseForce(240, 1, false);
  const pull = Core.pulseForce(40, -1, false);
  const combo = Core.pulseForce(40, 1, true);
  assert.ok(near > far && far > 0);
  assert.equal(Math.sign(pull), -1);
  assert.ok(combo > near);
  assert.equal(Core.pulseForce(Core.GAMEPLAY.pulseRange + 1, 1), 0);
});

test('Rift Burst is strongest close to the Core and zero outside range', () => {
  const near = Core.burstForce(20);
  const far = Core.burstForce(400);
  assert.ok(near > far && far > 0);
  assert.equal(Core.burstForce(Core.GAMEPLAY.burstRange + 10), 0);
});

test('Perfect Dash only triggers during the active window and once', () => {
  const contact = 57;
  assert.equal(Core.isPerfectDash(.1, false, 56, contact), true);
  assert.equal(Core.isPerfectDash(0, false, 56, contact), false);
  assert.equal(Core.isPerfectDash(.1, true, 56, contact), false);
  assert.equal(Core.isPerfectDash(.1, false, 80, contact), false);
});

test('high-speed Core uses substeps to reduce tunneling', () => {
  const slow = Core.physicsSubsteps(2, 0, 1/60);
  const fast = Core.physicsSubsteps(Core.GAMEPLAY.coreMaxSpeed, 0, 1/30);
  assert.equal(slow, 1);
  assert.ok(fast > 1);
  assert.ok(fast <= Core.GAMEPLAY.maxSubsteps);
});

test('wall bounce preserves direction reversal with controlled restitution', () => {
  const bounced = Core.bounceVelocity(10);
  assert.ok(bounced < 0);
  assert.ok(Math.abs(bounced) < 10);
  assert.equal(Core.bounceVelocity(0), 0);
});

test('Phase 0 save fields survive Phase 2 migration unchanged', () => {
  const s = Core.defaultState();
  s.credits = 9876; s.shards = 44; s.stats.wins = 9; s.inventory.push({ uid:'phase2', id:'nova', acquiredAt:1 });
  const migrated = Core.migrateState(s);
  assert.equal(migrated.credits, 9876);
  assert.equal(migrated.shards, 44);
  assert.equal(migrated.stats.wins, 9);
  assert.equal(migrated.inventory.at(-1).id, 'nova');
});
