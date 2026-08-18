'use strict';
function dash(p){
  if(!game||game.phase!=='play'||!p||p.dashCd>0)return false;
  let dx,dy;if(p.ai){dx=Math.cos(p.face);dy=Math.sin(p.face);}else{const input=currentPlayerInput();dx=input.x;dy=input.y;}
  let d=Math.hypot(dx,dy);if(d<.1){dx=Math.cos(p.face);dy=Math.sin(p.face);d=1;}
  p.vx+=dx/d*GP.dashImpulse;p.vy+=dy/d*GP.dashImpulse;p.dashCd=GP.dashCooldown;p.dashActive=GP.dashActive;p.perfectConsumed=false;
  spawnBurst(p.x,p.y,p.color,14,5);spawnRing(p.x,p.y,p.color,18,70,.22);if(!p.ai){sfx('dash');vibrate(18);}return true;
}
function pulse(p){
  if(!game||game.phase!=='play'||!p||p.pulseCd>0)return false;p.pulseCd=GP.pulseCooldown;
  const b=game.ball,dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),combo=p.dashActive>0;const f=Core.pulseForce(d,p.polarity,combo);
  const color=p.polarity===1?'#59f5ff':'#ff71c6';spawnRing(p.x,p.y,color,28,GP.pulseRange,.34);spawnBurst(p.x,p.y,color,12,3);
  if(f!==0&&d>1){b.vx+=dx/d*f;b.vy+=dy/d*f;p.flux=Math.min(100,p.flux+11+Math.abs(f)*.8+(combo?5:0));game.shake=Math.max(game.shake,combo?6:3);if(!p.ai){combatFeedback(combo?'DASH + PULSE':'PULSE',color,320);vibrate(combo?20:12);}}
  if(!p.ai)sfx(p.polarity===1?'pulsePush':'pulsePull');return true;
}
function burst(p){
  if(!game||game.phase!=='play'||!p||p.flux<100)return false;p.flux=0;
  const b=game.ball,dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||1,f=Core.burstForce(d);
  if(f>0){b.vx+=dx/d*f;b.vy+=dy/d*f;}
  game.shake=Math.max(game.shake,18);game.flash=Math.max(game.flash,.7);game.freeze=Math.max(game.freeze,.075);spawnRing(p.x,p.y,'#ffffff',34,GP.burstRange,.48);spawnRing(p.x,p.y,'#9a78ff',20,GP.burstRange*.78,.55);spawnBurst(p.x,p.y,'#c6b5ff',65,12);combatFeedback('RIFT BURST','#ffffff',650);if(!p.ai){sfx('burst');vibrate(55);}return true;
}
function bindFast(id,fn){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();fn();},{passive:false});}
bindFast('#dash',()=>dash(game?.a));bindFast('#pulse',()=>pulse(game?.a));bindFast('#burst',()=>burst(game?.a));

function combatFeedback(text,color='#fff',duration=400){const e=$('#combatHint');e.textContent=text;e.style.color=color;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),duration);}
function spawnRing(x,y,color,start=20,end=180,life=.35){if(!game)return;game.rings.push({x,y,color,r:start,start,end,life,maxLife:life});}
function spawnBurst(x,y,color,count=18,speed=6){if(!game)return;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=(.35+Math.random()*.65)*speed;game.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+Math.random()*.35,maxLife:.6,size:1.5+Math.random()*3,color});}}
function updateEffects(dt){if(!game)return;game.shake=Math.max(0,game.shake-dt*28);game.flash=Math.max(0,game.flash-dt*2.7);game.hitSfxCd=Math.max(0,game.hitSfxCd-dt);for(const p of game.particles){p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vx*=Math.pow(.94,dt*60);p.vy*=Math.pow(.94,dt*60);p.life-=dt;}game.particles=game.particles.filter(p=>p.life>0);for(const r of game.rings)r.life-=dt;game.rings=game.rings.filter(r=>r.life>0);}

function perfectDash(p,b){
  p.perfectConsumed=true;p.flux=Math.min(100,p.flux+GP.perfectDashFlux);game.freeze=Math.max(game.freeze,.055);game.shake=Math.max(game.shake,12);game.flash=Math.max(game.flash,.36);spawnRing(b.x,b.y,'#ffffff',16,135,.3);spawnBurst(b.x,b.y,'#ffffff',28,9);
  if(!p.ai){combatFeedback('PERFECT DASH','#6cffad',620);sfx('perfect');vibrate(32);}
}
function playerBallCollision(p,b,power){
  const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),min=p.r+b.r;if(!(d<min&&d>0))return false;
  const nx=dx/d,ny=dy/d,overlap=min-d;b.x+=nx*overlap;b.y+=ny*overlap;
  const relative=(p.vx-b.vx)*nx+(p.vy-b.vy)*ny;let impulse=(3.9+Math.max(0,relative)*1.12)*power;
  const perfect=Core.isPerfectDash(p.dashActive,p.perfectConsumed,d,min);if(perfect){impulse*=GP.perfectDashMultiplier;perfectDash(p,b);}
  b.vx+=nx*impulse;b.vy+=ny*impulse;
  const tangentX=-ny,tangentY=nx,tangent=(p.vx*tangentX+p.vy*tangentY)*.12;b.vx+=tangentX*tangent;b.vy+=tangentY*tangent;
  p.flux=Math.min(100,p.flux+(perfect?8:4));if(game.hitSfxCd<=0){sfx(perfect?'perfect':'hit');game.hitSfxCd=.05;}game.shake=Math.max(game.shake,perfect?12:Math.min(6,Math.abs(relative)*.6));return perfect;
}
function playerPlayerCollision(a,b){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;if(d<min&&d>0){const nx=dx/d,ny=dy/d,o=min-d;a.x-=nx*o/2;b.x+=nx*o/2;a.y-=ny*o/2;b.y+=ny*o/2;const rel=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(rel>0){const j=rel*.58;a.vx-=nx*j;b.vx+=nx*j;a.vy-=ny*j;b.vy+=ny*j;}}}
function guardCore(dt){
  const b=game.ball;if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(b.vx)||!Number.isFinite(b.vy)){game.ball=makeBall();toast('Core réinitialisé');return;}
  const speed=Math.hypot(b.vx,b.vy),nearWall=b.x<82||b.x>W-82||b.y<92||b.y>H-92;
  if(nearWall&&speed<.22)b.wallStuck+=dt;else b.wallStuck=0;
  if(b.wallStuck>1.2){const dx=W/2-b.x,dy=H/2-b.y,d=Math.hypot(dx,dy)||1;b.vx=dx/d*3.2;b.vy=dy/d*3.2;b.wallStuck=0;}
  b.x=Math.max(-60,Math.min(W+60,b.x));b.y=Math.max(52+b.r,Math.min(H-52-b.r,b.y));
}

function currentGamepad(){if(!state.settings.controller||!navigator.getGamepads)return null;return [...navigator.getGamepads()].find(Boolean)||null;}
function currentPlayerInput(){
  let x=(keyDown('right')?1:0)-(keyDown('left')?1:0)+touchVec.x,y=(keyDown('down')?1:0)-(keyDown('up')?1:0)+touchVec.y;
  const gp=currentGamepad();if(gp){x+=Core.applyDeadzone(gp.axes[0]||0);y+=Core.applyDeadzone(gp.axes[1]||0);}
  return Core.normalizeInput(x,y,1);
}
function gamepadEdge(index,gp){const pressed=!!gp?.buttons?.[index]?.pressed,old=!!gamepadPrev[index];gamepadPrev[index]=pressed;return pressed&&!old;}
function pollGamepad(){
  const gp=currentGamepad();if(!gp){gamepadPrev=[];return;}
  if(gamepadEdge(9,gp)&&game&&!game.ended)togglePause();
  if(!game||game.phase!=='play')return;
  if(gamepadEdge(0,gp))dash(game.a);if(gamepadEdge(2,gp))pulse(game.a);if(gamepadEdge(1,gp))togglePolarity();if(gamepadEdge(3,gp))burst(game.a);
}
addEventListener('gamepadconnected',()=>renderSettings());addEventListener('gamepaddisconnected',()=>renderSettings());

function updatePlayerMotion(q,input,dt){const v=Core.stepMovement(q.vx,q.vy,input.x,input.y,dt);q.vx=v.vx;q.vy=v.vy;if(input.magnitude>.05)q.face=Math.atan2(input.y,input.x);q.dashCd=Math.max(0,q.dashCd-dt);q.dashActive=Math.max(0,q.dashActive-dt);q.pulseCd=Math.max(0,q.pulseCd-dt);}
function integratePlayer(q,dt){q.x=Math.max(54,Math.min(W-54,q.x+q.vx*dt*60));q.y=Math.max(54,Math.min(H-54,q.y+q.vy*dt*60));q.trail.push({x:q.x,y:q.y,boost:q.dashActive>0});if(q.trail.length>16)q.trail.shift();}
function aiInput(ai,b){const predict=9+Math.min(18,Math.hypot(b.vx,b.vy)*1.2),tx=b.x+b.vx*predict+75,ty=b.y+b.vy*predict*.7;return Core.normalizeInput(tx-ai.x,ty-ai.y,1);}
function ballStep(b,dt){b.x+=b.vx*dt*60;b.y+=b.vy*dt*60;}
function wallAndGoalStep(b){
  const goal=Core.isBallInsideGoal(b,W,H);if(goal){registerGoal(goal);return true;}
  const gb=Core.goalBounds(H),inOpening=b.y>gb.top&&b.y<gb.bottom;
  if(b.y-b.r<52){b.y=52+b.r;b.vy=Math.abs(b.vy)*GP.wallRestitution;spawnBurst(b.x,b.y,'#a8eaff',4,2);}
  if(b.y+b.r>H-52){b.y=H-52-b.r;b.vy=-Math.abs(b.vy)*GP.wallRestitution;spawnBurst(b.x,b.y,'#a8eaff',4,2);}
  if(!inOpening&&b.x-b.r<gb.leftLine){b.x=gb.leftLine+b.r;b.vx=Math.abs(b.vx)*GP.wallRestitution;spawnBurst(b.x,b.y,'#59f5ff',4,2);}
  if(!inOpening&&b.x+b.r>W-gb.leftLine){b.x=W-gb.leftLine-b.r;b.vx=-Math.abs(b.vx)*GP.wallRestitution;spawnBurst(b.x,b.y,'#ff5f8f',4,2);}
  return false;
}

