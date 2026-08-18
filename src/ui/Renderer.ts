import type{MatchState,PlayerEntity}from'../types/game.js';import type{PlayerSettings}from'../types/state.js';import{ARENA,GAMEPLAY}from'../game/config.js';

export class Renderer{
  private readonly ctx:CanvasRenderingContext2D;
  constructor(canvas:HTMLCanvasElement,private readonly settings:()=>PlayerSettings){const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D indisponible');this.ctx=ctx;}
  draw(game:MatchState):void{
    const{ctx}=this;ctx.clearRect(0,0,ARENA.width,ARENA.height);const shake=this.settings().cameraShake?game.shake:0;
    ctx.save();ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);this.arena(game);this.pulseRange(game.a);this.player(game.a);this.player(game.b);for(const slot of game.extraPlayers)this.player(slot.player);this.ball(game);this.effects(game);ctx.restore();
    if(game.flash>0){ctx.save();ctx.globalAlpha=Math.min(.32,game.flash*.35);ctx.fillStyle='#fff';ctx.fillRect(0,0,ARENA.width,ARENA.height);ctx.restore();}
  }
  private arena(game:MatchState):void{
    const{ctx}=this;ctx.fillStyle='#050914';ctx.fillRect(0,0,ARENA.width,ARENA.height);ctx.strokeStyle='#59f5ff12';ctx.lineWidth=1;
    for(let x=80;x<ARENA.width;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,ARENA.height);ctx.stroke();}
    for(let y=80;y<ARENA.height;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(ARENA.width,y);ctx.stroke();}
    if(game.m.rule==='flux'){
      ctx.fillStyle='#59f5ff08';ctx.fillRect(ARENA.width*.58,52,ARENA.width*.42-52,ARENA.height-104);ctx.fillStyle='#ff5f8f08';ctx.fillRect(52,52,ARENA.width*.42-52,ARENA.height-104);
      ctx.strokeStyle='#ffffff16';ctx.setLineDash([12,12]);ctx.beginPath();ctx.moveTo(ARENA.width*.42,52);ctx.lineTo(ARENA.width*.42,ARENA.height-52);ctx.moveTo(ARENA.width*.58,52);ctx.lineTo(ARENA.width*.58,ARENA.height-52);ctx.stroke();ctx.setLineDash([]);
    }
    ctx.strokeStyle='#ffffff22';ctx.lineWidth=2;ctx.strokeRect(52,52,ARENA.width-104,ARENA.height-104);ctx.beginPath();ctx.moveTo(ARENA.width/2,52);ctx.lineTo(ARENA.width/2,ARENA.height-52);ctx.stroke();ctx.beginPath();ctx.arc(ARENA.width/2,ARENA.height/2,95,0,Math.PI*2);ctx.stroke();this.goal(38,ARENA.height/2-115,'#59f5ff');this.goal(ARENA.width-52,ARENA.height/2-115,'#ff5f8f');
  }
  private goal(x:number,y:number,color:string):void{const{ctx}=this;ctx.save();ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=24;ctx.fillRect(x,y,14,230);ctx.restore();}
  private pulseRange(player:PlayerEntity):void{const{ctx}=this;ctx.save();ctx.strokeStyle=player.polarity===1?'#59f5ff':'#ff71c6';ctx.globalAlpha=player.pulseCd<=0?.12:.035;ctx.lineWidth=2;ctx.setLineDash([8,11]);ctx.beginPath();ctx.arc(player.x,player.y,GAMEPLAY.pulseRange,0,Math.PI*2);ctx.stroke();ctx.restore();}
  private player(player:PlayerEntity):void{
    const{ctx}=this;player.trail.forEach((point,index)=>{ctx.globalAlpha=index/Math.max(1,player.trail.length)*(point.boost?.22:.1);ctx.fillStyle=player.color;ctx.beginPath();ctx.arc(point.x,point.y,(8+index*.8)*(point.boost?1.8:1),0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
    ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.face);ctx.fillStyle=player.color;ctx.shadowColor=player.color;ctx.shadowBlur=player.dashActive>0?35:20;ctx.beginPath();ctx.moveTo(player.dashActive>0?42:35,0);ctx.lineTo(-18,-22);ctx.lineTo(-6,0);ctx.lineTo(-18,22);ctx.closePath();ctx.fill();ctx.fillStyle='#041019';ctx.beginPath();ctx.arc(4,0,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle=player.polarity===1?'#d9ffff':'#ff8dd1';ctx.lineWidth=3;ctx.beginPath();ctx.arc(4,0,15,-.8,.8);ctx.stroke();ctx.restore();
  }
  private ball(game:MatchState):void{const b=game.ball,{ctx}=this;ctx.save();ctx.shadowColor=game.m.rule==='overcharge'?'#ffb35c':'#8a64ff';ctx.shadowBlur=game.m.rule==='overcharge'?34:26;const g=ctx.createRadialGradient(b.x-8,b.y-9,3,b.x,b.y,b.r);g.addColorStop(0,'#fff');g.addColorStop(.2,game.m.rule==='chaos'?'#ff9de6':'#72f7ff');g.addColorStop(.65,'#805cff');g.addColorStop(1,'#172044');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.restore();}
  private effects(game:MatchState):void{const{ctx}=this;for(const r of game.rings){const t=1-r.life/r.maxLife;ctx.save();ctx.globalAlpha=Math.max(0,r.life/r.maxLife)*.65;ctx.strokeStyle=r.color;ctx.lineWidth=3*(1-t)+1;ctx.beginPath();ctx.arc(r.x,r.y,r.start+(r.end-r.start)*t,0,Math.PI*2);ctx.stroke();ctx.restore();}for(const p of game.particles){ctx.save();ctx.globalAlpha=Math.max(0,p.life/p.maxLife);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.restore();}}
}
