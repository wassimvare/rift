'use strict';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const Core = window.RiftCore;

const CATALOG = [
  {id:'ion',name:'ION DUST',type:'Trail',price:240,a:'#7d8ca9',b:'#4a5167'},
  {id:'ghost',name:'GHOSTLINE',type:'Trail',price:980,a:'#b0c8ff',b:'#6672a7'},
  {id:'volt',name:'VOLT HEX',type:'Frame',price:1150,a:'#55f6ff',b:'#3f6bff'},
  {id:'fang',name:'NEON FANG',type:'Frame',price:2450,a:'#61e9ff',b:'#ff5f9f'},
  {id:'prism',name:'PRISM NODE',type:'Core Skin',price:2750,a:'#7effe5',b:'#ff73d7'},
  {id:'phase',name:'PHASE BLOOM',type:'Goal FX',price:3100,a:'#ff68db',b:'#7e5dff'},
  {id:'sun',name:'SUNFORGE CORE',type:'Core Skin',price:5900,a:'#ffe05d',b:'#ff6e38'},
  {id:'aurora',name:'AURORA DRIFT',type:'Trail',price:6800,a:'#72fbff',b:'#705cff'},
  {id:'nova',name:'NOVA PULSE',type:'Goal FX',price:7900,a:'#ffdc76',b:'#ff5a9f'}
];
const MODES = {
  ranked:{name:'RIFT RANKED',time:180,goal:5,rewardWin:620,rewardLoss:260,xpWin:120,xpLoss:55},
  quick:{name:'QUICK DUEL',time:150,goal:4,rewardWin:430,rewardLoss:190,xpWin:90,xpLoss:45},
  blitz:{name:'RIFT BLITZ',time:90,goal:3,rewardWin:300,rewardLoss:130,xpWin:62,xpLoss:32}
};

let state = Core.loadState(localStorage);
let game = null, raf = 0, last = 0, keys = {}, touchVec = {x:0,y:0}, timers = new Set();
const canvas = $('#cv'), ctx = canvas.getContext('2d'), W = 1280, H = 720;

function item(id){ return CATALOG.find(i=>i.id===id); }
function persist(){ state = Core.saveState(localStorage, state); renderAll(); }
function toast(text){ const e=$('#toast');e.textContent=text;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1600); }
function vibrate(ms=20){ if(state.settings.haptics && navigator.vibrate) navigator.vibrate(ms); }
function later(fn,ms){ const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);return id; }
function clearTimers(){ for(const id of timers) clearTimeout(id); timers.clear(); }
function nav(view){ if(game && view!=='game' && !game.ended) return askQuit(); $$('.view').forEach(v=>v.classList.remove('active'));$('#'+view).classList.add('active');$$('[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v===view));document.body.classList.toggle('game',view==='game');window.scrollTo(0,0); }
$$('[data-v]').forEach(b=>b.onclick=()=>nav(b.dataset.v));

function card(i,button=''){return `<article class="panel card"><div class="art" style="--a:${i.a};--b:${i.b}"></div><h3>${i.name}</h3><small>${i.type}</small><div class="price">${i.price.toLocaleString('fr-FR')} NC</div>${button}</article>`;}
function renderAll(){
  $('#credits').textContent=state.credits.toLocaleString('fr-FR');$('#shards').textContent=state.shards;
  $('#statMatches').textContent=state.stats.matches;$('#statWins').textContent=state.stats.wins;$('#statGoals').textContent=state.stats.goalsFor;$('#statCollection').textContent=state.inventory.length;
  $$('.mode').forEach(b=>b.classList.toggle('sel',b.dataset.mode===state.selectedMode));
  $('#vaultGrid').innerHTML=state.inventory.map(o=>{const i=item(o.id);return i?card(i):''}).join('')||'<p>Vault vide.</p>';
  $('#marketGrid').innerHTML=CATALOG.map(i=>card(i,`<button class="ghost buy" data-id="${i.id}">ACHETER</button>`)).join('');
  $$('.buy').forEach(b=>b.onclick=()=>buy(b.dataset.id));
  $('#historyList').innerHTML=state.matchHistory.length?state.matchHistory.map(h=>`<article class="panel historyRow"><div><b>${h.outcome==='win'?'VICTOIRE':h.outcome==='loss'?'DÉFAITE':h.outcome==='abandoned'?'ABANDON':'NUL'} ${h.scoreA}-${h.scoreB}</b><br><small>${MODES[h.mode]?.name||h.mode}${h.overtime?' · OVERTIME':''}</small></div><small>+${h.credits||0} NC</small></article>`).join(''):'<p>Aucun match terminé.</p>';
}
function buy(id){ const i=item(id);if(!i)return;if(state.credits<i.price)return toast('Pas assez de Nova Credits');state.credits-=i.price;Core.addInventoryItem(state,id);persist();toast(`${i.name} acheté`); }
$$('.mode').forEach(b=>b.onclick=()=>{state.selectedMode=b.dataset.mode;persist();});

function showModal(html){ $('#modalContent').innerHTML=html;$('#modal').classList.remove('hidden'); }
function closeModal(){ $('#modal').classList.add('hidden'); }
$('#modal').onclick=e=>{ if(e.target.id==='modal' && (!game || game.phase!=='result')) closeModal(); };

function makePlayer(x,y,color,ai=false){return{x,y,vx:0,vy:0,r:32,color,ai,face:ai?Math.PI:0,dashCd:0,pulseCd:0,polarity:1,flux:0,trail:[]};}
function makeBall(){return{x:W/2,y:H/2,vx:0,vy:0,r:25,wallStuck:0};}
function formatTime(s){if(!Number.isFinite(s))return'OT';s=Math.max(0,Math.ceil(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}

function startMatch(){
  clearTimers();cancelAnimationFrame(raf);closeModal();
  const m=MODES[state.selectedMode];
  game={mode:state.selectedMode,m,a:makePlayer(240,H/2,'#59f5ff'),b:makePlayer(W-240,H/2,'#ff5f8f',true),ball:makeBall(),scoreA:0,scoreB:0,time:m.time,phase:'countdown',ended:false,overtime:false,lastScorer:null};
  $('#modeTitle').textContent=m.name;$('#sa').textContent='0';$('#sb').textContent='0';$('#clock').textContent=formatTime(m.time);$('#pauseBtn').textContent='PAUSE';setPolarityLabel();
  forceNavGame();countdown(3,()=>beginPlay());
}
function forceNavGame(){ $$('.view').forEach(v=>v.classList.remove('active'));$('#game').classList.add('active');$$('[data-v]').forEach(b=>b.classList.remove('active'));document.body.classList.add('game');window.scrollTo(0,0); }
function beginPlay(){ if(!game||game.ended)return;game.phase='play';$('#ov').classList.add('hidden');last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop); }
function countdown(n,done){ if(!game||game.ended)return;game.phase='countdown';$('#ov').classList.remove('hidden');$('#ov').innerHTML=n>0?String(n):'GO';if(n>0)later(()=>countdown(n-1,done),430);else later(done,300); }
$('#play').onclick=startMatch;

function resetKickoff(){
  if(!game)return;
  game.a.x=240;game.a.y=H/2;game.a.vx=game.a.vy=0;game.a.flux=Math.min(game.a.flux,100);game.a.trail=[];
  game.b.x=W-240;game.b.y=H/2;game.b.vx=game.b.vy=0;game.b.trail=[];
  game.ball=makeBall();countdown(2,beginPlay);
}

function registerGoal(side){
  if(!game||game.phase!=='play')return;
  game.phase='goal';cancelAnimationFrame(raf);
  const playerScored=side==='right';
  if(playerScored){game.scoreA++;game.lastScorer='player';}else{game.scoreB++;game.lastScorer='rival';}
  $('#sa').textContent=game.scoreA;$('#sb').textContent=game.scoreB;
  $('#ov').classList.remove('hidden');$('#ov').innerHTML=playerScored?'RIFT BREAK!<small>+1 YOU</small>':'RIVAL SCORES<small>+1 RIVAL</small>';
  vibrate(playerScored?45:25);
  const reachedLimit=game.scoreA>=game.m.goal||game.scoreB>=game.m.goal;
  if(reachedLimit||game.overtime){ later(()=>finishMatch(),720);return; }
  later(resetKickoff,700);
}

function togglePause(){
  if(!game||game.ended||!['play','paused'].includes(game.phase))return;
  if(game.phase==='play'){
    game.phase='paused';cancelAnimationFrame(raf);$('#ov').classList.remove('hidden');$('#ov').innerHTML='PAUSE<small>P / ÉCHAP ou bouton PAUSE pour reprendre</small>';$('#pauseBtn').textContent='REPRENDRE';
  }else{
    game.phase='play';$('#ov').classList.add('hidden');$('#pauseBtn').textContent='PAUSE';last=performance.now();raf=requestAnimationFrame(loop);
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
  if(!game||game.ended)return;clearTimers();cancelAnimationFrame(raf);game.ended=true;game.phase='result';
  const outcome=Core.matchOutcome(game.scoreA,game.scoreB);const won=outcome==='win';
  const credits=won?game.m.rewardWin:game.m.rewardLoss;const xp=won?game.m.xpWin:game.m.xpLoss;const shards=won?2:1;
  Core.applyMatchResult(state,{mode:game.mode,scoreA:game.scoreA,scoreB:game.scoreB,credits,shards,xp,overtime:game.overtime,at:Date.now()});
  state=Core.saveState(localStorage,state);renderAll();
  showModal(`<p class="eyebrow">MATCH COMPLETE</p><h2>${won?'VICTOIRE':'DÉFAITE'}</h2><div class="resultScore">${game.scoreA} — ${game.scoreB}</div><div class="resultMeta"><span class="tag">${game.m.name}</span>${game.overtime?'<span class="tag">OVERTIME</span>':''}<span class="tag">+${credits} NC</span><span class="tag">+${xp} XP</span><span class="tag">+${shards} ◆</span></div><div class="modalActions"><button id="rematch" class="primary">REVANCHE</button><button id="resultMenu" class="secondary">RETOUR AU MENU</button></div>`);
  $('#rematch').onclick=()=>startMatch();$('#resultMenu').onclick=()=>{game=null;closeModal();forceMenu();};
}

addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys[e.code]=true;if(!game)return;
  if((e.code==='KeyP'||e.code==='Escape')&&!e.repeat){togglePause();return;}
  if(e.code==='KeyE'&&!e.repeat)pulse(game.a);if(e.code==='KeyQ'&&!e.repeat)togglePolarity();if(e.code==='KeyF'&&!e.repeat)burst(game.a);
},{passive:false});
addEventListener('keyup',e=>keys[e.code]=false);

function togglePolarity(){if(!game)return;game.a.polarity*=-1;setPolarityLabel();vibrate(10);}
function setPolarityLabel(){const pull=game?.a?.polarity===-1;$('#polarityText').textContent=pull?'PULL':'PUSH';$('#polarityText').style.color=pull?'#ff71c6':'#59f5ff';}
$('#pol').onclick=togglePolarity;$('#polarityText').onclick=togglePolarity;
function dash(p){if(!game||game.phase!=='play'||!p||p.dashCd>0)return;let dx,dy;if(p.ai){dx=Math.cos(p.face);dy=Math.sin(p.face);}else{dx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+touchVec.x;dy=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+touchVec.y;}let d=Math.hypot(dx,dy);if(d<.1){dx=Math.cos(p.face);dy=Math.sin(p.face);d=1;}p.vx+=dx/d*11;p.vy+=dy/d*11;p.dashCd=1.6;vibrate(16);}
function pulse(p){if(!game||game.phase!=='play'||!p||p.pulseCd>0)return;p.pulseCd=.55;const b=game.ball,dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d<260&&d>1){const fall=1-d/260,f=(8+7*fall)*fall*p.polarity;b.vx+=dx/d*f;b.vy+=dy/d*f;p.flux=Math.min(100,p.flux+12+10*fall);vibrate(12);}}
function burst(p){if(!game||game.phase!=='play'||!p||p.flux<100)return;p.flux=0;const b=game.ball,dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||1;if(d<430){const f=22*(1-d/520);b.vx+=dx/d*f;b.vy+=dy/d*f;}vibrate(40);}
$('#dash').onclick=()=>dash(game?.a);$('#pulse').onclick=()=>pulse(game?.a);$('#burst').onclick=()=>burst(game?.a);

function playerBallCollision(p,b,power){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),min=p.r+b.r;if(d<min&&d>0){const nx=dx/d,ny=dy/d;b.x+=nx*(min-d);const rel=(p.vx-b.vx)*nx+(p.vy-b.vy)*ny;b.vx+=nx*(4+Math.max(0,rel))*power;b.vy+=ny*(4+Math.max(0,rel))*power;p.flux=Math.min(100,p.flux+4);}}
function playerPlayerCollision(a,b){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;if(d<min&&d>0){const nx=dx/d,ny=dy/d,o=min-d;a.x-=nx*o/2;b.x+=nx*o/2;a.y-=ny*o/2;b.y+=ny*o/2;a.vx-=nx*.8;b.vx+=nx*.8;a.vy-=ny*.8;b.vy+=ny*.8;}}
function guardCore(dt){
  const b=game.ball;if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(b.vx)||!Number.isFinite(b.vy)){game.ball=makeBall();toast('Core réinitialisé');return;}
  const speed=Math.hypot(b.vx,b.vy),nearWall=b.x<82||b.x>W-82||b.y<92||b.y>H-92;
  if(nearWall&&speed<.22)b.wallStuck+=dt;else b.wallStuck=0;
  if(b.wallStuck>1.2){const dx=W/2-b.x,dy=H/2-b.y,d=Math.hypot(dx,dy)||1;b.vx=dx/d*2.8;b.vy=dy/d*2.8;b.wallStuck=0;}
  b.x=Math.max(-60,Math.min(W+60,b.x));b.y=Math.max(52+b.r,Math.min(H-52-b.r,b.y));
}

function physics(dt){
  const p=game.a,ai=game.b,b=game.ball;
  let dx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+touchVec.x,dy=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+touchVec.y,d=Math.hypot(dx,dy)||1;
  p.vx+=dx/d*.72;p.vy+=dy/d*.72;if(Math.abs(dx)+Math.abs(dy)>.05)p.face=Math.atan2(dy,dx);if(keys.Space){dash(p);keys.Space=false;}
  const ax=b.x+70-ai.x,ay=b.y-ai.y,ad=Math.hypot(ax,ay)||1;ai.face=Math.atan2(ay,ax);ai.vx+=ax/ad*.56;ai.vy+=ay/ad*.56;if(ai.dashCd<=0&&ad>270&&Math.random()<.008)dash(ai);if(ai.pulseCd<=0&&Math.hypot(b.x-ai.x,b.y-ai.y)<220&&Math.random()<.04)pulse(ai);
  [p,ai].forEach(q=>{q.vx*=.91;q.vy*=.91;const s=Math.hypot(q.vx,q.vy),max=9.5;if(s>max){q.vx=q.vx/s*max;q.vy=q.vy/s*max;}q.x=Math.max(54,Math.min(W-54,q.x+q.vx*dt*60));q.y=Math.max(54,Math.min(H-54,q.y+q.vy*dt*60));q.dashCd=Math.max(0,q.dashCd-dt);q.pulseCd=Math.max(0,q.pulseCd-dt);q.trail.push({x:q.x,y:q.y});if(q.trail.length>11)q.trail.shift();});
  b.vx*=.994;b.vy*=.994;b.x+=b.vx*dt*60;b.y+=b.vy*dt*60;const bs=Math.hypot(b.vx,b.vy),bm=18;if(bs>bm){b.vx=b.vx/bs*bm;b.vy=b.vy/bs*bm;}
  if(b.y<52+b.r){b.y=52+b.r;b.vy=Math.abs(b.vy);}if(b.y>H-52-b.r){b.y=H-52-b.r;b.vy=-Math.abs(b.vy);}
  playerBallCollision(p,b,1.25);playerBallCollision(ai,b,1.12);playerPlayerCollision(p,ai);guardCore(dt);
  const goal=Core.isBallInsideGoal(b,W,H);if(goal){registerGoal(goal);return;}
  const gb=Core.goalBounds(H),inOpening=b.y>gb.top&&b.y<gb.bottom;
  if(!inOpening&&b.x-b.r<gb.leftLine){b.x=gb.leftLine+b.r;b.vx=Math.abs(b.vx);}if(!inOpening&&b.x+b.r>W-gb.leftLine){b.x=W-gb.leftLine-b.r;b.vx=-Math.abs(b.vx);}
  if(Number.isFinite(game.time)){game.time-=dt;if(Core.shouldEnterOvertime(game.time,game.scoreA,game.scoreB)){game.time=Infinity;game.overtime=true;$('#clock').textContent='OT';$('#ov').classList.remove('hidden');$('#ov').innerHTML='OVERTIME<small>Prochain but = victoire</small>';later(()=>{if(game&&game.phase==='play')$('#ov').classList.add('hidden');},900);}else if(game.time<=0){finishMatch();return;}}
  $('#clock').textContent=formatTime(game.time);$('#dashM').style.width=`${100-Math.min(100,p.dashCd/1.6*100)}%`;$('#fluxM').style.width=`${p.flux}%`;$('#fluxT').textContent=`${Math.round(p.flux)}%`;
}

function draw(){if(!game)return;ctx.clearRect(0,0,W,H);ctx.fillStyle='#050914';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#59f5ff12';ctx.lineWidth=1;for(let x=80;x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=80;y<H;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.strokeStyle='#ffffff22';ctx.lineWidth=2;ctx.strokeRect(52,52,W-104,H-104);ctx.beginPath();ctx.moveTo(W/2,52);ctx.lineTo(W/2,H-52);ctx.stroke();ctx.beginPath();ctx.arc(W/2,H/2,95,0,Math.PI*2);ctx.stroke();drawGoal(38,H/2-115,14,230,'#59f5ff');drawGoal(W-52,H/2-115,14,230,'#ff5f8f');drawPlayer(game.a);drawPlayer(game.b);drawBall(game.ball);}
function drawGoal(x,y,w,h,c){ctx.save();ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=24;ctx.fillRect(x,y,w,h);ctx.restore();}
function drawPlayer(p){p.trail.forEach((t,i)=>{ctx.globalAlpha=i/p.trail.length*.12;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(t.x,t.y,10+i,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.face);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(35,0);ctx.lineTo(-18,-22);ctx.lineTo(-6,0);ctx.lineTo(-18,22);ctx.closePath();ctx.fill();ctx.fillStyle='#041019';ctx.beginPath();ctx.arc(4,0,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle=p.polarity===1?'#d9ffff':'#ff8dd1';ctx.lineWidth=3;ctx.beginPath();ctx.arc(4,0,15,-.8,.8);ctx.stroke();ctx.restore();}
function drawBall(b){ctx.save();ctx.shadowColor='#8a64ff';ctx.shadowBlur=26;const gr=ctx.createRadialGradient(b.x-8,b.y-9,3,b.x,b.y,b.r);gr.addColorStop(0,'#fff');gr.addColorStop(.2,'#72f7ff');gr.addColorStop(.65,'#805cff');gr.addColorStop(1,'#172044');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.restore();}
function loop(now){if(!game||game.ended||game.phase==='paused')return;const dt=Math.min(.03,(now-last)/1000||.016);last=now;if(game.phase==='play')physics(dt);draw();if(game&&!game.ended&&game.phase!=='paused')raf=requestAnimationFrame(loop);}

const joy=$('#joy'),stick=$('#stick');let pointerId=null;
function joystickMove(e){const r=joy.getBoundingClientRect();let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,m=Math.hypot(x,y),max=33;if(m>max){x=x/m*max;y=y/m*max;}touchVec.x=x/max;touchVec.y=y/max;stick.style.transform=`translate(${x}px,${y}px)`;}
joy.addEventListener('pointerdown',e=>{pointerId=e.pointerId;joy.setPointerCapture(pointerId);joystickMove(e);e.preventDefault();});joy.addEventListener('pointermove',e=>{if(e.pointerId===pointerId)joystickMove(e);});function joystickEnd(e){if(e.pointerId!==pointerId)return;pointerId=null;touchVec.x=touchVec.y=0;stick.style.transform='translate(0,0)';}joy.addEventListener('pointerup',joystickEnd);joy.addEventListener('pointercancel',joystickEnd);

renderAll();
