import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, SAVE_VERSION, MAX_HISTORY } from '../dist-test/state/defaults.js';
import { addMatchHistory, applyMatchResult, loadState, saveState } from '../dist-test/state/storage.js';
import { isBallInsideGoal, shouldEnterOvertime } from '../dist-test/game/rules/goals.js';
class MemoryStorage{constructor(seed={}){this.map=new Map(Object.entries(seed))}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,String(v))}}
test('default save contains every Phase 0 field',()=>{const s=defaultState();assert.equal(s.saveVersion,SAVE_VERSION);assert.equal(s.inventory.length,3);assert.ok(s.equippedItems&&s.stats&&s.settings);});
test('fresh install starts with 4200 credits',()=>{const s=loadState(new MemoryStorage());assert.equal(s.credits,4200);assert.equal(s.inventory.length,3);});
test('legacy credits migrate',()=>{const s=loadState(new MemoryStorage({rxCredits:'7337'}));assert.equal(s.credits,7337);assert.equal(s.inventory.length,3);});
test('full state survives save/reload',()=>{const storage=new MemoryStorage(),s=defaultState();s.credits=1234;s.shards=99;s.selectedMode='blitz';s.inventory.push({uid:'x1',id:'nova',acquiredAt:42});s.equippedItems.Frame='volt';s.xp=350;s.stats.wins=8;s.settings.haptics=false;saveState(storage,s);const l=loadState(storage);assert.equal(l.credits,1234);assert.equal(l.shards,99);assert.equal(l.selectedMode,'blitz');assert.equal(l.inventory.at(-1).id,'nova');assert.equal(l.equippedItems.Frame,'volt');assert.equal(l.stats.wins,8);assert.equal(l.settings.haptics,false);});
test('goals match visible opening',()=>{assert.equal(isBallInsideGoal({x:1255,y:360,r:25},1280,720),'right');assert.equal(isBallInsideGoal({x:25,y:360,r:25},1280,720),'left');assert.equal(isBallInsideGoal({x:1255,y:120,r:25},1280,720),null);});
test('overtime only starts on tie',()=>{assert.equal(shouldEnterOvertime(0,2,2),true);assert.equal(shouldEnterOvertime(0,3,2),false);});
test('match result updates stats/history',()=>{const s=defaultState();const outcome=applyMatchResult(s,{mode:'ranked',scoreA:5,scoreB:3,credits:620,xp:100,overtime:false,at:1});assert.equal(outcome,'win');assert.equal(s.stats.matches,1);assert.equal(s.stats.wins,1);assert.equal(s.credits,4820);assert.equal(s.matchHistory[0].outcome,'win');});
test('history capped',()=>{const s=defaultState();for(let i=0;i<70;i++)addMatchHistory(s,{id:`m${i}`,at:i,mode:'ranked',scoreA:1,scoreB:0,outcome:'win',overtime:false,credits:0,xp:0});assert.equal(s.matchHistory.length,MAX_HISTORY);assert.equal(s.matchHistory[0].id,'m69');});
