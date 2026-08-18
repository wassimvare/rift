'use strict';
function makePlayer(x,y,color,ai=false){return{x,y,vx:0,vy:0,r:32,color,ai,face:ai?Math.PI:0,dashCd:0,dashActive:0,perfectConsumed:false,pulseCd:0,polarity:1,flux:0,trail:[]};}
function makeBall(){return{x:W/2,y:H/2,vx:0,vy:0,r:25,wallStuck:0};}
function formatTime(s){if(!Number.isFinite(s))return'OT';s=Math.max(0,Math.ceil(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}

function startMatch(){
  clearTimers();cancelAnimationFrame(raf);closeModal();ensureAudio();
  const m=MODES[state.selectedMode];
  game={mode:state.selectedMode,m,a:makePlayer(240,H/2,'#59f5ff'),b:makePlayer(W-240,H/2,'#ff5f8f',true),ball:makeBall(),scoreA:0,scoreB:0,time:m.time,phase:'countdown',ended:false,overtime:false,lastScorer:null,particles:[],rings:[],shake:0,flash:0,freeze:0,hitSfxCd:0,combatText:null};
  $('#modeTitle').textContent=m.name;$('#sa').textContent='0';$('#sb').textContent='0';$('#clock').textContent=formatTime(m.time);$('#pauseBtn').textContent='PAUSE';setPolarityLabel();updateAbilityHud();
  forceNavGame();countdown(3,()=>beginPlay());
}
function forceNavGame(){ $$('.view').forEach(v=>v.classList.remove('active'));$('#game').classList.add('active');$$('[data-v]').forEach(b=>b.classList.remove('active'));document.body.classList.add('game');applyTouchSettings();window.scrollTo(0,0); }
function beginPlay(){ if(!game||game.ended)return;game.phase='play';$('#ov').classList.add('hidden');last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop); }
function countdown(n,done){ if(!game||game.ended)return;game.phase='countdown';$('#ov').classList.remove('hidden');$('#ov').innerHTML=n>0?String(n):'GO';if(n>0)later(()=>countdown(n-1,done),430);else later(done,300); }
$('#play').onclick=startMatch;

function resetKickoff(){
  if(!game)return;
  game.a.x=240;game.a.y=H/2;game.a.vx=game.a.vy=0;game.a.dashActive=0;game.a.perfectConsumed=false;game.a.trail=[];
  game.b.x=W-240;game.b.y=H/2;game.b.vx=game.b.vy=0;game.b.dashActive=0;game.b.perfectConsumed=false;game.b.trail=[];
  game.ball=makeBall();game.rings=[];game.particles=[];countdown(2,beginPlay);
}

function registerGoal(side){
  if(!game||game.phase!=='play')return;
  game.phase='goal';const playerScored=side==='right';
  if(playerScored){game.scoreA++;game.lastScorer='player';}else{game.scoreB++;game.lastScorer='rival';}
  $('#sa').textContent=game.scoreA;$('#sb').textContent=game.scoreB;
  $('#ov').classList.remove('hidden');$('#ov').innerHTML=playerScored?'RIFT BREAK!<small>+1 YOU</small>':'RIVAL SCORES<small>+1 RIVAL</small>';
  game.shake=Math.max(game.shake,14);game.flash=Math.max(game.flash,.42);spawnBurst(game.ball.x,game.ball.y,playerScored?'#59f5ff':'#ff5f8f',50,10);spawnRing(game.ball.x,game.ball.y,playerScored?'#59f5ff':'#ff5f8f',22,360,.55);sfx('goal');vibrate(playerScored?55:30);
  const reachedLimit=game.scoreA>=game.m.goal||game.scoreB>=game.m.goal;
  if(reachedLimit||game.overtime){ later(()=>finishMatch(),760);return; }
  later(resetKickoff,720);
}

function togglePause(){
  if(!game||game.ended||!['play','paused'].includes(game.phase))return;
  if(game.phase==='play'){
    game.phase='paused';$('#ov').classList.remove('hidden');$('#ov').innerHTML='PAUSE<small>P / ÉCHAP / Start pour reprendre</small>';$('#pauseBtn').textContent='REPRENDRE';
  }else{
    game.phase='play';$('#ov').classList.add('hidden');$('#pauseBtn').textContent='PAUSE';last=performance.now();
  }
}
$('#pauseBtn').onclick=togglePause;

function askQuit(){
  if(!game)return;
  const wasPlaying=game.phase==='play';if(wasPlaying)togglePause();
  showModal(`<p class="eyebrow">ABANDON</p><h2>Quitter ce match ?</h2><p>Le match en cours sera abandonné. Ta sauvegarde et ton inventaire restent intacts.</p><div class="modalActions"><button id="confirmQuit" class="danger">QUITTER LE MATCH</button><button id="cancelQuit" class="secondary">ANNULER</button></div>`);
  $('#confirmQuit').onclick=()=>abandonMatch();
  $('#cancelQuit').onclick=()=>{closeModal();if(game&&game.phase==='paused'&&wasPlaying)togglePause();};
}
$('#exitBtn').onclick=askQuit;
function abandonMatch(){
  if(!game)return;clearTimers();cancelAnimationFrame(raf);state.stats.abandoned+=1;Core.addMatchHistory(state,{id:`ab_${Date.now()}`,at:Date.now(),mode:game.mode,scoreA:game.scoreA,scoreB:game.scoreB,outcome:'abandoned',overtime:game.overtime,credits:0,xp:0});state=Core.saveState(localStorage,state);game.ended=true;game=null;closeModal();renderAll();forceMenu();toast('Match abandonné');
}
function forceMenu(){document.body.classList.remove('game');$$('.view').forEach(v=>v.classList.remove('active'));$('#home').classList.add('active');$$('[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v==='home'));}

function askRestart(){
  if(!game)return;const resume=game.phase==='play';if(resume)togglePause();
  showModal(`<p class="eyebrow">RESTART</p><h2>Recommencer le match ?</h2><p>Le score et le chrono seront remis à zéro. Ce restart n'ajoute ni victoire ni défaite.</p><div class="modalActions"><button id="confirmRestart" class="primary">RECOMMENCER</button><button id="cancelRestart" class="secondary">ANNULER</button></div>`);
  $('#confirmRestart').onclick=()=>startMatch();$('#cancelRestart').onclick=()=>{closeModal();if(game&&game.phase==='paused'&&resume)togglePause();};
}
$('#restartBtn').onclick=askRestart;

function finishMatch(){
  if(!game||game.ended)return;clearTimers();game.ended=true;game.phase='result';
  const outcome=Core.matchOutcome(game.scoreA,game.scoreB);const won=outcome==='win';
  const credits=won?game.m.rewardWin:game.m.rewardLoss;const xp=won?game.m.xpWin:game.m.xpLoss;const shards=won?2:1;
  Core.applyMatchResult(state,{mode:game.mode,scoreA:game.scoreA,scoreB:game.scoreB,credits,shards,xp,overtime:game.overtime,at:Date.now()});
  state=Core.saveState(localStorage,state);renderAll();
  showModal(`<p class="eyebrow">MATCH COMPLETE</p><h2>${won?'VICTOIRE':'DÉFAITE'}</h2><div class="resultScore">${game.scoreA} — ${game.scoreB}</div><div class="resultMeta"><span class="tag">${game.m.name}</span>${game.overtime?'<span class="tag">OVERTIME</span>':''}<span class="tag">+${credits} NC</span><span class="tag">+${xp} XP</span><span class="tag">+${shards} ◆</span></div><div class="modalActions"><button id="rematch" class="primary">REVANCHE</button><button id="resultMenu" class="secondary">RETOUR AU MENU</button></div>`);
  $('#rematch').onclick=()=>startMatch();$('#resultMenu').onclick=()=>{game=null;closeModal();forceMenu();};
}

function keyDown(action){const code=state.settings.keymap[action];if(keys[code])return true;if(action==='up'&&keys.ArrowUp)return true;if(action==='down'&&keys.ArrowDown)return true;if(action==='left'&&keys.ArrowLeft)return true;if(action==='right'&&keys.ArrowRight)return true;return false;}
addEventListener('keydown',e=>{
  if(captureAction){e.preventDefault();if(!['Escape'].includes(e.code)){state.settings.keymap[captureAction]=e.code;captureAction=null;persist();toast('Touche enregistrée');}else{captureAction=null;renderSettings();}return;}
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys[e.code]=true;if(!game)return;
  if((e.code===state.settings.keymap.pause||e.code==='Escape')&&!e.repeat){togglePause();return;}
  if(e.code===state.settings.keymap.pulse&&!e.repeat)pulse(game.a);if(e.code===state.settings.keymap.polarity&&!e.repeat)togglePolarity();if(e.code===state.settings.keymap.burst&&!e.repeat)burst(game.a);
},{passive:false});
addEventListener('keyup',e=>keys[e.code]=false);

function togglePolarity(){if(!game)return;game.a.polarity*=-1;setPolarityLabel();spawnRing(game.a.x,game.a.y,game.a.polarity===1?'#59f5ff':'#ff71c6',35,95,.28);sfx('toggle');vibrate(10);}
function setPolarityLabel(){const pull=game?.a?.polarity===-1;$('#polarityText').textContent=pull?'PULL':'PUSH';$('#polarityText').style.color=pull?'#ff71c6':'#59f5ff';$('#pol').style.color=pull?'#ff71c6':'#59f5ff';}
$('#pol').onclick=togglePolarity;$('#polarityText').onclick=togglePolarity;

