import test from 'node:test';import assert from 'node:assert/strict';
import {CATALOG,itemById} from '../dist-test/data/catalog.js';import {MODES} from '../dist-test/data/modes.js';import {Store} from '../dist-test/state/Store.js';
class MemoryStorage{constructor(){this.map=new Map()}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,v)}}
test('catalog isolated from gameplay',()=>{assert.ok(CATALOG.length>=9);assert.equal(itemById('volt').type,'Frame');});
test('mode data isolated',()=>{assert.equal(MODES.ranked.goal,5);assert.equal(MODES.blitz.time,90);});
test('Store persists and notifies',()=>{const s=new Store(new MemoryStorage());let n=0;s.subscribe(()=>n++);s.update(x=>x.credits=1111);assert.equal(s.get().credits,1111);assert.equal(n,1);});
test('Store preserves legacy save compatibility',()=>{const storage=new MemoryStorage(),a=new Store(storage);a.update(s=>{s.credits=5432;s.settings.touchLayout='left'});const b=new Store(storage);assert.equal(b.get().credits,5432);assert.equal(b.get().settings.touchLayout,'left');});
