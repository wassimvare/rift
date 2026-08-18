'use strict';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const Core = window.RiftCore;
const GP = Core.GAMEPLAY;

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
  ranked:{name:'RIFT RANKED',time:180,goal:5,rewardWin:620,rewardLoss:260,xpWin:120,xpLoss:55,coreSpeed:1,ai:0.98},
  quick:{name:'QUICK DUEL',time:150,goal:4,rewardWin:430,rewardLoss:190,xpWin:90,xpLoss:45,coreSpeed:1.04,ai:0.94},
  blitz:{name:'RIFT BLITZ',time:90,goal:3,rewardWin:300,rewardLoss:130,xpWin:62,xpLoss:32,coreSpeed:1.12,ai:1.02}
};

let state = Core.loadState(localStorage);
let game = null, raf = 0, last = 0, keys = {}, touchVec = {x:0,y:0}, timers = new Set();
let captureAction = null, gamepadPrev = [], audioCtx = null;
const canvas = $('#cv'), ctx = canvas.getContext('2d'), arena = $('#arena'), W = 1280, H = 720;

function item(id){ return CATALOG.find(i=>i.id===id); }
function persist(){ state = Core.saveState(localStorage, state); renderAll(); }
function toast(text){ const e=$('#toast');e.textContent=text;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1600); }
function vibrate(ms=20){ if(state.settings.haptics && navigator.vibrate) navigator.vibrate(ms); }
function later(fn,ms){ const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);return id; }
function clearTimers(){ for(const id of timers) clearTimeout(id); timers.clear(); }
function nav(view){ if(game && view!=='game' && !game.ended) return askQuit(); $$('.view').forEach(v=>v.classList.remove('active'));$('#'+view).classList.add('active');$$('[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v===view));document.body.classList.toggle('game',view==='game');if(view==='settings')renderSettings();window.scrollTo(0,0); }
$$('[data-v]').forEach(b=>b.onclick=()=>nav(b.dataset.v));

function ensureAudio(){
  if(!state.settings.audio)return null;
  try{ if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx; }catch(_){return null;}
}
function sfx(type){
  const ac=ensureAudio();if(!ac)return;
  const map={dash:[170,0.06,'sawtooth',0.035],pulsePush:[310,0.09,'sine',0.035],pulsePull:[190,0.11,'triangle',0.04],hit:[115,0.045,'square',0.025],perfect:[520,0.12,'sawtooth',0.05],burst:[80,0.22,'sawtooth',0.06],goal:[410,0.22,'triangle',0.055],toggle:[250,0.045,'sine',0.025]};
  const [freq,dur,typeOsc,gainPeak]=map[type]||map.hit;const now=ac.currentTime;const o=ac.createOscillator(),g=ac.createGain();o.type=typeOsc;o.frequency.setValueAtTime(freq,now);if(type==='burst')o.frequency.exponentialRampToValueAtTime(45,now+dur);else if(type==='perfect'||type==='goal')o.frequency.exponentialRampToValueAtTime(freq*1.7,now+dur);g.gain.setValueAtTime(0.0001,now);g.gain.exponentialRampToValueAtTime(gainPeak,now+.01);g.gain.exponentialRampToValueAtTime(0.0001,now+dur);o.connect(g).connect(ac.destination);o.start(now);o.stop(now+dur+.02);
}

function card(i,button=''){return `<article class="panel card"><div class="art" style="--a:${i.a};--b:${i.b}"></div><h3>${i.name}</h3><small>${i.type}</small><div class="price">${i.price.toLocaleString('fr-FR')} NC</div>${button}</article>`;}
function renderAll(){
  $('#credits').textContent=state.credits.toLocaleString('fr-FR');$('#shards').textContent=state.shards;
  $('#statMatches').textContent=state.stats.matches;$('#statWins').textContent=state.stats.wins;$('#statGoals').textContent=state.stats.goalsFor;$('#statCollection').textContent=state.inventory.length;
  $$('.mode').forEach(b=>b.classList.toggle('sel',b.dataset.mode===state.selectedMode));
  $('#vaultGrid').innerHTML=state.inventory.map(o=>{const i=item(o.id);return i?card(i):''}).join('')||'<p>Vault vide.</p>';
  $('#marketGrid').innerHTML=CATALOG.map(i=>card(i,`<button class="ghost buy" data-id="${i.id}">ACHETER</button>`)).join('');
  $$('.buy').forEach(b=>b.onclick=()=>buy(b.dataset.id));
  $('#historyList').innerHTML=state.matchHistory.length?state.matchHistory.map(h=>`<article class="panel historyRow"><div><b>${h.outcome==='win'?'VICTOIRE':h.outcome==='loss'?'DÉFAITE':h.outcome==='abandoned'?'ABANDON':'NUL'} ${h.scoreA}-${h.scoreB}</b><br><small>${MODES[h.mode]?.name||h.mode}${h.overtime?' · OVERTIME':''}</small></div><small>+${h.credits||0} NC</small></article>`).join(''):'<p>Aucun match terminé.</p>';
  renderSettings();applyTouchSettings();
}
function buy(id){ const i=item(id);if(!i)return;if(state.credits<i.price)return toast('Pas assez de Nova Credits');state.credits-=i.price;Core.addInventoryItem(state,id);persist();toast(`${i.name} acheté`); }
$$('.mode').forEach(b=>b.onclick=()=>{state.selectedMode=b.dataset.mode;persist();});

function prettyCode(code){const aliases={Space:'ESPACE',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Escape:'ÉCHAP'};if(aliases[code])return aliases[code];return String(code||'?').replace(/^Key/,'').replace(/^Digit/,'');}
function renderSettings(){
  if(!$('#joySens'))return;
  $('#joySens').value=state.settings.joystickSensitivity;$('#joySensValue').textContent=`${Math.round(state.settings.joystickSensitivity*100)}%`;
  $('#touchScale').value=state.settings.touchScale;$('#touchScaleValue').textContent=`${Math.round(state.settings.touchScale*100)}%`;
  $('#touchInset').value=state.settings.touchInset;$('#touchInsetValue').textContent=`${state.settings.touchInset}px`;
  $('#touchLayout').value=state.settings.touchLayout;
  $('#hapticsToggle').textContent=state.settings.haptics?'ON':'OFF';$('#shakeToggle').textContent=state.settings.cameraShake?'ON':'OFF';$('#audioToggle').textContent=state.settings.audio?'ON':'OFF';
  $$('.bindBtn').forEach(b=>{const action=b.dataset.bind;const label=b.childNodes[0]?.textContent?.trim()||action.toUpperCase();b.innerHTML=`${label}<br><b>${prettyCode(state.settings.keymap[action])}</b>`;b.classList.toggle('waiting',captureAction===action);});
  const pads=navigator.getGamepads?.()||[];const pad=[...pads].find(Boolean);$('#gamepadDot').classList.toggle('on',!!pad);$('#gamepadStatus').textContent=pad?`Manette détectée : ${pad.id.slice(0,42)}`:'Aucune manette détectée';
}
function applyTouchSettings(){
  if(!arena)return;arena.style.setProperty('--touch-scale',state.settings.touchScale);arena.style.setProperty('--touch-inset',`${state.settings.touchInset}px`);arena.classList.toggle('touch-left',state.settings.touchLayout==='left');
}
function settingChange(id,key,parser=Number){const el=$(id);if(!el)return;el.addEventListener('input',()=>{state.settings[key]=parser(el.value);persist();});}
settingChange('#joySens','joystickSensitivity');settingChange('#touchScale','touchScale');settingChange('#touchInset','touchInset');
$('#touchLayout').addEventListener('change',e=>{state.settings.touchLayout=e.target.value;persist();});
$('#hapticsToggle').onclick=()=>{state.settings.haptics=!state.settings.haptics;persist();};
$('#shakeToggle').onclick=()=>{state.settings.cameraShake=!state.settings.cameraShake;persist();};
$('#audioToggle').onclick=()=>{state.settings.audio=!state.settings.audio;persist();if(state.settings.audio)sfx('toggle');};
$$('.bindBtn').forEach(b=>b.onclick=()=>{captureAction=b.dataset.bind;renderSettings();toast('Appuie sur la nouvelle touche');});

function showModal(html){ $('#modalContent').innerHTML=html;$('#modal').classList.remove('hidden'); }
function closeModal(){ $('#modal').classList.add('hidden'); }
$('#modal').onclick=e=>{ if(e.target.id==='modal' && (!game || game.phase!=='result')) closeModal(); };

