import test from 'node:test';
import assert from 'node:assert/strict';
import { MODES, MODE_ORDER } from '../dist-test/data/modes.js';
import { defaultSettings, defaultState, SAVE_VERSION } from '../dist-test/state/defaults.js';
import { migrateState } from '../dist-test/state/storage.js';
import { AI_DIFFICULTIES, aiDifficultyScore, profileTarget } from '../dist-test/game/ai/AISystem.js';
import { ModeSystem, chaosEventForIndex, resolveMode, tournamentDifficulty } from '../dist-test/game/modes/ModeSystem.js';
import { createBall, createPlayer } from '../dist-test/game/entities/factories.js';
import { TUTORIAL_STEPS, TutorialSystem } from '../dist-test/tutorial/TutorialSystem.js';

function game(mode='duel'){
  const config={...MODES[mode]};
  return{
    mode,m:config,a:createPlayer(240,360,'#0ff'),b:createPlayer(1040,360,'#f08',true),extraPlayers:[],ball:createBall(),scoreA:0,scoreB:0,time:config.time,phase:'play',ended:false,overtime:false,lastScorer:null,particles:[],rings:[],shake:0,flash:0,freeze:0,hitSfxCd:0,elapsed:0,controlA:0,controlB:0,chaosTimer:12,chaosEvent:null,tournamentRound:1,tutorial:false,
  };
}

test('Phase 3 exposes nine distinct playable modes',()=>{
  assert.equal(MODE_ORDER.length,9);
  assert.deepEqual(new Set(MODE_ORDER).size,9);
  for(const id of MODE_ORDER)assert.ok(MODES[id].description.length>10);
});

test('Doubles is a real 2v2 rule config',()=>{
  assert.equal(MODES.doubles.teamSize,2);
  assert.equal(MODES.doubles.rule,'doubles');
});

test('Blitz is materially faster than Duel',()=>{
  assert.ok(MODES.blitz.coreSpeed>MODES.duel.coreSpeed);
  assert.ok(MODES.blitz.time<MODES.duel.time);
});

test('Custom mode resolves saved player rules',()=>{
  const settings=defaultSettings();settings.customTime=240;settings.customGoal=7;settings.customCoreSpeed=1.35;settings.customTeamSize=2;
  const mode=resolveMode('custom',settings);
  assert.equal(mode.time,240);assert.equal(mode.goal,7);assert.equal(mode.coreSpeed,1.35);assert.equal(mode.teamSize,2);
});

test('Overcharge accelerates the Core cap over time',()=>{
  const modes=new ModeSystem(),match=game('overcharge');modes.start(match);const before=match.m.coreSpeed;modes.tick(match,30);assert.ok(match.m.coreSpeed>before);
});

test('Flux Control awards control points in opponent territory',()=>{
  const modes=new ModeSystem(),match=game('flux');modes.start(match);match.ball.x=1000;match.ball.y=360;match.a.x=900;match.a.y=360;modes.tick(match,1.05);assert.equal(match.scoreA,1);
});

test('Flux Control goals are worth two points',()=>{assert.equal(new ModeSystem().goalPoints(game('flux')),2);});

test('Chaos event selection is deterministic by index',()=>{
  assert.equal(chaosEventForIndex(0),'CORE SURGE');assert.equal(chaosEventForIndex(1),'FULL FLUX');assert.equal(chaosEventForIndex(4),'CORE SURGE');
});

test('Tournament difficulty rises every round',()=>{
  assert.equal(tournamentDifficulty(1),'challenger');assert.equal(tournamentDifficulty(2),'elite');assert.equal(tournamentDifficulty(3),'riftborn');
});

test('AI difficulties have increasing capability',()=>{
  assert.ok(aiDifficultyScore('recruit')<aiDifficultyScore('challenger'));assert.ok(aiDifficultyScore('challenger')<aiDifficultyScore('elite'));assert.ok(aiDifficultyScore('elite')<aiDifficultyScore('riftborn'));
  assert.ok(AI_DIFFICULTIES.riftborn.reaction<AI_DIFFICULTIES.recruit.reaction);
  assert.ok(AI_DIFFICULTIES.riftborn.speed>AI_DIFFICULTIES.recruit.speed);
});

test('AI profiles choose meaningfully different targets',()=>{
  const match=game('duel');match.ball.x=900;match.ball.y=220;match.ball.vx=4;match.ball.vy=1;
  const aggressive=profileTarget(match,match.b,'rival','aggressive',1);const defensive=profileTarget(match,match.b,'rival','defensive',1);
  assert.notDeepEqual(aggressive,defensive);assert.ok(defensive.x>aggressive.x);
});

test('Tutorial contains movement plus all signature mechanics and duel',()=>{
  assert.deepEqual(TUTORIAL_STEPS.map(step=>step.id),['movement','dash','push','pull','pulse','burst','duel']);
});

test('Tutorial movement requires sustained input',()=>{
  const tutorial=new TutorialSystem();tutorial.start();assert.equal(tutorial.tickMovement(.5,1).advanced,false);assert.equal(tutorial.tickMovement(1,1).advanced,true);assert.equal(tutorial.current.id,'dash');
});

test('Tutorial action chain reaches guided duel',()=>{
  const tutorial=new TutorialSystem();tutorial.start();tutorial.tickMovement(1.5,1);tutorial.action('dash');tutorial.action('push');tutorial.action('pull');tutorial.action('pulse');const update=tutorial.action('burst');assert.equal(update.advanced,true);assert.equal(tutorial.current.id,'duel');
});

test('Guided duel completes after two player goals',()=>{
  const tutorial=new TutorialSystem();tutorial.start();tutorial.tickMovement(1.5,1);tutorial.action('dash');tutorial.action('push');tutorial.action('pull');tutorial.action('pulse');tutorial.action('burst');assert.equal(tutorial.goal(true).completed,false);assert.equal(tutorial.goal(true).completed,true);
});

test('Phase 2 saves migrate to Phase 3 defaults without losing data',()=>{
  const old=defaultState();old.saveVersion=2;old.credits=9999;delete old.tutorial;delete old.settings.aiDifficulty;delete old.settings.aiProfile;const migrated=migrateState(old);assert.equal(migrated.saveVersion,SAVE_VERSION);assert.equal(migrated.credits,9999);assert.equal(migrated.settings.aiDifficulty,'challenger');assert.equal(migrated.tutorial.completed,false);
});
