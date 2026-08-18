import { MODES } from '../../data/modes.js';
import type { PlayerSettings } from '../../types/state.js';
import type { AiDifficulty, ChaosEvent, MatchState, ModeConfig, ModeId, TeamSide } from '../../types/game.js';
import { ARENA } from '../config.js';

export interface ModeTickResult {
  scoreChanged:boolean;
  event:ChaosEvent|null;
}

const CHAOS_EVENTS:readonly ChaosEvent[]=['CORE SURGE','FULL FLUX','POLARITY SHIFT','DASH RESET'];

export function tournamentDifficulty(round:number):AiDifficulty{
  if(round<=1)return'challenger';
  if(round===2)return'elite';
  return'riftborn';
}

export function chaosEventForIndex(index:number):ChaosEvent{
  const event=CHAOS_EVENTS[Math.abs(Math.floor(index))%CHAOS_EVENTS.length];
  return event??'CORE SURGE';
}

export function resolveMode(modeId:ModeId,settings:PlayerSettings,tournamentRound=1):ModeConfig{
  const base={...MODES[modeId]};
  if(modeId==='custom'){
    return{
      ...base,
      time:settings.customTime,
      goal:settings.customGoal,
      coreSpeed:settings.customCoreSpeed,
      teamSize:settings.customTeamSize,
      subtitle:`${Math.round(settings.customTime/60*10)/10} min · premier à ${settings.customGoal} · ${settings.customTeamSize}v${settings.customTeamSize}`,
    };
  }
  if(modeId==='tournament'){
    return{...base,subtitle:`Round ${tournamentRound}/3 · premier à ${base.goal}`};
  }
  return base;
}

export class ModeSystem{
  start(game:MatchState):void{
    game.elapsed=0;
    game.controlA=0;
    game.controlB=0;
    game.chaosTimer=12;
    game.chaosEvent=null;
    if(game.m.rule==='blitz'){
      game.a.flux=35;
      game.b.flux=35;
      for(const slot of game.extraPlayers)slot.player.flux=35;
    }
  }

  goalPoints(game:MatchState):number{return game.m.rule==='flux'?2:1;}

  targetReached(game:MatchState):boolean{return game.scoreA>=game.m.goal||game.scoreB>=game.m.goal;}

  tick(game:MatchState,dt:number):ModeTickResult{
    game.elapsed+=dt;
    let scoreChanged=false;
    let event:ChaosEvent|null=null;

    if(game.m.rule==='overcharge'){
      game.m.coreSpeed=Math.min(1.65,0.92+game.elapsed*0.0048);
    }

    if(game.m.rule==='flux')scoreChanged=this.tickFlux(game,dt);

    if(game.m.rule==='chaos'){
      game.chaosTimer-=dt;
      if(game.chaosTimer<=0){
        const index=Math.floor(game.elapsed/12)+Math.floor(Math.random()*4);
        event=chaosEventForIndex(index);
        game.chaosEvent=event;
        game.chaosTimer=12;
        this.applyChaos(game,event);
      }
    }

    return{scoreChanged,event};
  }

  private tickFlux(game:MatchState,dt:number):boolean{
    const side:TeamSide|null=game.ball.x>ARENA.width*.58?'you':game.ball.x<ARENA.width*.42?'rival':null;
    if(!side){game.controlA=Math.max(0,game.controlA-dt*1.5);game.controlB=Math.max(0,game.controlB-dt*1.5);return false;}
    const players=side==='you'?[game.a,...game.extraPlayers.filter(slot=>slot.team==='you').map(slot=>slot.player)]:[game.b,...game.extraPlayers.filter(slot=>slot.team==='rival').map(slot=>slot.player)];
    const close=players.some(player=>Math.hypot(player.x-game.ball.x,player.y-game.ball.y)<270);
    if(!close)return false;
    if(side==='you'){
      game.controlA+=dt;
      game.controlB=0;
      if(game.controlA>=1){game.controlA-=1;game.scoreA+=1;return true;}
    }else{
      game.controlB+=dt;
      game.controlA=0;
      if(game.controlB>=1){game.controlB-=1;game.scoreB+=1;return true;}
    }
    return false;
  }

  private applyChaos(game:MatchState,event:ChaosEvent):void{
    if(event==='CORE SURGE'){
      const speed=Math.hypot(game.ball.vx,game.ball.vy)||1;
      if(speed<2){game.ball.vx=(Math.random()>.5?1:-1)*8;game.ball.vy=(Math.random()-.5)*8;}
      else{game.ball.vx*=1.45;game.ball.vy*=1.45;}
      game.shake=Math.max(game.shake,10);
      return;
    }
    const players=[game.a,game.b,...game.extraPlayers.map(slot=>slot.player)];
    if(event==='FULL FLUX')for(const player of players)player.flux=100;
    if(event==='POLARITY SHIFT')for(const player of players)player.polarity=player.polarity===1?-1:1;
    if(event==='DASH RESET')for(const player of players)player.dashCd=0;
  }
}
