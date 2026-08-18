'use strict';
function physics(dt){
  const p=game.a,ai=game.b,b=game.ball,input=currentPlayerInput();updatePlayerMotion(p,input,dt);
  if(keyDown('dash')){dash(p);keys[state.settings.keymap.dash]=false;keys.Space=false;}
  const aiIn=aiInput(ai,b);updatePlayerMotion(ai,aiIn,dt);ai.face=Math.atan2(aiIn.y,aiIn.x);const ad=Math.hypot(b.x-ai.x,b.y-ai.y);if(ai.dashCd<=0&&ad>285&&Math.random()<.009*game.m.ai)dash(ai);if(ai.pulseCd<=0&&ad<245&&Math.random()<.045*game.m.ai)pulse(ai);

  const ballFriction=Math.pow(GP.coreFriction,dt*60);b.vx*=ballFriction;b.vy*=ballFriction;const maxBall=GP.coreMaxSpeed*game.m.coreSpeed,bs=Math.hypot(b.vx,b.vy);if(bs>maxBall){b.vx=b.vx/bs*maxBall;b.vy=b.vy/bs*maxBall;}
  const steps=Core.physicsSubsteps(b.vx,b.vy,dt),sub=dt/steps;
  for(let i=0;i<steps;i++){
    integratePlayer(p,sub);integratePlayer(ai,sub);ballStep(b,sub);playerBallCollision(p,b,1.28);playerBallCollision(ai,b,1.13);playerPlayerCollision(p,ai);if(wallAndGoalStep(b))return;
  }
  guardCore(dt);
  if(Number.isFinite(game.time)){game.time-=dt;if(Core.shouldEnterOvertime(game.time,game.scoreA,game.scoreB)){game.time=Infinity;game.overtime=true;$('#clock').textContent='OT';$('#ov').classList.remove('hidden');$('#ov').innerHTML='OVERTIME<small>Prochain but = victoire</small>';later(()=>{if(game&&game.phase==='play')$('#ov').classList.add('hidden');},900);}else if(game.time<=0){finishMatch();return;}}
  updateAbilityHud();
}
function updateAbilityHud(){if(!game)return;const p=game.a;$('#clock').textContent=formatTime(game.time);$('#dashM').style.width=`${100-Math.min(100,p.dashCd/GP.dashCooldown*100)}%`;$('#pulseM').style.width=`${100-Math.min(100,p.pulseCd/GP.pulseCooldown*100)}%`;$('#pulseT').textContent=p.pulseCd<=0?'OK':p.pulseCd.toFixed(1);$('#pulseT').classList.toggle('abilityReady',p.pulseCd<=0);$('#fluxM').style.width=`${p.flux}%`;$('#fluxT').textContent=p.flux>=100?'READY':`${Math.round(p.flux)}%`;$('#fluxT').classList.toggle('abilityReady',p.flux>=100);$('#burst').classList.toggle('abilityReady',p.flux>=100);}

function drawArena(){ctx.fillStyle='#050914';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#59f5ff12';ctx.lineWidth=1;for(let x=80;x<W;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=80;y<H;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.strokeStyle='#ffffff22';ctx.lineWidth=2;ctx.strokeRect(52,52,W-104,H-104);ctx.beginPath();ctx.moveTo(W/2,52);ctx.lineTo(W/2,H-52);ctx.stroke();ctx.beginPath();ctx.arc(W/2,H/2,95,0,Math.PI*2);ctx.stroke();drawGoal(38,H/2-115,14,230,'#59f5ff');drawGoal(W-52,H/2-115,14,230,'#ff5f8f');}
function drawGoal(x,y,w,h,c){ctx.save();ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=24;ctx.fillRect(x,y,w,h);ctx.restore();}
function drawPulseRange(p){const color=p.polarity===1?'#59f5ff':'#ff71c6';ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=p.pulseCd<=0?.12:.035;ctx.lineWidth=2;ctx.setLineDash([8,11]);ctx.beginPath();ctx.arc(p.x,p.y,GP.pulseRange,0,Math.PI*2);ctx.stroke();ctx.restore();}
function drawPlayer(p){p.trail.forEach((t,i)=>{const boost=t.boost?1.8:1;ctx.globalAlpha=(i/p.trail.length)*(t.boost?.22:.1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(t.x,t.y,(8+i*.8)*boost,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.face);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=p.dashActive>0?35:20;ctx.beginPath();ctx.moveTo(p.dashActive>0?42:35,0);ctx.lineTo(-18,-22);ctx.lineTo(-6,0);ctx.lineTo(-18,22);ctx.closePath();ctx.fill();ctx.fillStyle='#041019';ctx.beginPath();ctx.arc(4,0,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle=p.polarity===1?'#d9ffff':'#ff8dd1';ctx.lineWidth=3;ctx.beginPath();ctx.arc(4,0,15,-.8,.8);ctx.stroke();ctx.restore();}
function drawBall(b){ctx.save();ctx.shadowColor='#8a64ff';ctx.shadowBlur=26;const gr=ctx.createRadialGradient(b.x-8,b.y-9,3,b.x,b.y,b.r);gr.addColorStop(0,'#fff');gr.addColorStop(.2,'#72f7ff');gr.addColorStop(.65,'#805cff');gr.addColorStop(1,'#172044');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.restore();}
function drawEffects(){for(const r of game.rings){const t=1-r.life/r.maxLife,radius=r.start+(r.end-r.start)*t;ctx.save();ctx.globalAlpha=Math.max(0,r.life/r.maxLife)*.65;ctx.strokeStyle=r.color;ctx.lineWidth=3*(1-t)+1;ctx.beginPath();ctx.arc(r.x,r.y,radius,0,Math.PI*2);ctx.stroke();ctx.restore();}for(const p of game.particles){ctx.save();ctx.globalAlpha=Math.max(0,p.life/p.maxLife);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.restore();}}
function draw(){if(!game)return;ctx.clearRect(0,0,W,H);const shake=state.settings.cameraShake?game.shake:0,ox=(Math.random()-.5)*shake,oy=(Math.random()-.5)*shake;ctx.save();ctx.translate(ox,oy);drawArena();drawPulseRange(game.a);drawPlayer(game.a);drawPlayer(game.b);drawBall(game.ball);drawEffects();ctx.restore();if(game.flash>0){ctx.save();ctx.globalAlpha=Math.min(.32,game.flash*.35);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.restore();}}
function loop(now){
  if(!game||game.ended)return;const dt=Math.min(.03,(now-last)/1000||.016);last=now;pollGamepad();updateEffects(dt);
  if(game.phase==='play'){if(game.freeze>0)game.freeze=Math.max(0,game.freeze-dt);else physics(dt);}draw();raf=requestAnimationFrame(loop);
}

const joy=$('#joy'),stick=$('#stick');let pointerId=null;
function joystickMove(e){const r=joy.getBoundingClientRect();let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,m=Math.hypot(x,y),max=r.width*.38;if(m>max){x=x/m*max;y=y/m*max;}const n=Core.normalizeInput(x/max,y/max,state.settings.joystickSensitivity);touchVec.x=n.x;touchVec.y=n.y;stick.style.transform=`translate(${x}px,${y}px)`;}
joy.addEventListener('pointerdown',e=>{pointerId=e.pointerId;joy.setPointerCapture(pointerId);joystickMove(e);e.preventDefault();},{passive:false});joy.addEventListener('pointermove',e=>{if(e.pointerId===pointerId)joystickMove(e);});function joystickEnd(e){if(e.pointerId!==pointerId)return;pointerId=null;touchVec.x=touchVec.y=0;stick.style.transform='translate(0,0)';}joy.addEventListener('pointerup',joystickEnd);joy.addEventListener('pointercancel',joystickEnd);

renderAll();
