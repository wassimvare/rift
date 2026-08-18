import test from 'node:test';import assert from 'node:assert/strict';
import {defaultState} from '../dist-test/state/defaults.js';import {loadState,migrateState,saveState} from '../dist-test/state/storage.js';import {GAMEPLAY} from '../dist-test/game/config.js';import {applyDeadzone,bounceVelocity,normalizeInput,physicsSubsteps,stepMovement} from '../dist-test/game/physics/vector.js';import {burstForce,isPerfectDash,pulseForce} from '../dist-test/game/abilities/AbilityMath.js';
class MemoryStorage{constructor(){this.map=new Map()}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,v)}}
test('Phase 2 settings migrate',()=>{const s=defaultState(),m=migrateState({...s,settings:{audio:false,haptics:true,cameraShake:true}});assert.equal(m.settings.audio,false);assert.equal(m.settings.joystickSensitivity,1);assert.equal(m.settings.keymap.dash,'Space');});
test('custom controls persist',()=>{const st=new MemoryStorage(),s=defaultState();s.settings.joystickSensitivity=1.35;s.settings.touchLayout='left';s.settings.keymap.dash='ShiftLeft';saveState(st,s);const l=loadState(st);assert.equal(l.settings.joystickSensitivity,1.35);assert.equal(l.settings.touchLayout,'left');assert.equal(l.settings.keymap.dash,'ShiftLeft');});
test('movement acceleration respects max',()=>{let v={vx:0,vy:0};for(let i=0;i<120;i++)v=stepMovement(v.vx,v.vy,1,0,1/60);assert.ok(v.vx>5&&v.vx<=GAMEPLAY.playerMaxSpeed+1e-9);});
test('idle friction stops faster',()=>assert.ok(stepMovement(8,0,0,0,1/60).vx<stepMovement(8,0,1,0,1/60).vx));
test('joystick normalized',()=>{assert.ok(normalizeInput(.3,0,1.5).magnitude>normalizeInput(.3,0,.6).magnitude);assert.equal(normalizeInput(10,0,1.5).magnitude,1);});
test('deadzone removes drift',()=>{assert.equal(applyDeadzone(.05),0);assert.ok(applyDeadzone(.7)>.6);});
test('Pulse falloff/polarity/combo',()=>{const n=pulseForce(40,1,false),f=pulseForce(240,1,false);assert.ok(n>f&&f>0);assert.equal(Math.sign(pulseForce(40,-1,false)),-1);assert.ok(pulseForce(40,1,true)>n);});
test('Burst falloff',()=>{assert.ok(burstForce(20)>burstForce(400));assert.equal(burstForce(GAMEPLAY.burstRange+10),0);});
test('Perfect Dash single window',()=>{assert.equal(isPerfectDash(.1,false,56,57),true);assert.equal(isPerfectDash(0,false,56,57),false);assert.equal(isPerfectDash(.1,true,56,57),false);});
test('substeps reduce tunneling',()=>{assert.equal(physicsSubsteps(2,0,1/60),1);assert.ok(physicsSubsteps(GAMEPLAY.coreMaxSpeed,0,1/30)>1);});
test('wall bounce restitution',()=>{const b=bounceVelocity(10);assert.ok(b<0&&Math.abs(b)<10);});
test('Phase 0 fields survive migration',()=>{const s=defaultState();s.credits=9876;s.inventory.push({uid:'phase2',id:'nova',acquiredAt:1});const m=migrateState(s);assert.equal(m.credits,9876);assert.equal(m.inventory.at(-1).id,'nova');});
