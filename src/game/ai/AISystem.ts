import type { AiDifficulty, AiProfile, MatchState, NormalizedInput, PlayerEntity, TeamSide } from '../../types/game.js';
import type { AbilitySystem } from '../abilities/AbilitySystem.js';
import { ARENA } from '../config.js';
import { normalizeInput } from '../physics/vector.js';

export interface AiTuning{
  reaction:number;
  error:number;
  speed:number;
  dashChance:number;
  pulseChance:number;
  burstChance:number;
  prediction:number;
}

export const AI_DIFFICULTIES:Record<AiDifficulty,AiTuning>={
  recruit:{reaction:.42,error:135,speed:.64,dashChance:.0025,pulseChance:.010,burstChance:.001,prediction:.35},
  challenger:{reaction:.24,error:72,speed:.79,dashChance:.0055,pulseChance:.022,burstChance:.004,prediction:.62},
  elite:{reaction:.12,error:28,speed:.93,dashChance:.009,pulseChance:.040,burstChance:.009,prediction:.86},
  riftborn:{reaction:.055,error:8,speed:1,dashChance:.014,pulseChance:.058,burstChance:.016,prediction:1},
};

interface Memory{wait:number;input:NormalizedInput;}

export function aiDifficultyScore(value:AiDifficulty):number{return(['recruit','challenger','elite','riftborn'] as AiDifficulty[]).indexOf(value);}

export function profileTarget(game:MatchState,player:PlayerEntity,team:TeamSide,profile:AiProfile,prediction=1):{x:number;y:number}{
  const attack=team==='you'?1:-1;
  const ownGoal=team==='you'?70:ARENA.width-70;
  const predicted={x:game.ball.x+game.ball.vx*(8+16*prediction),y:game.ball.y+game.ball.vy*(5+11*prediction)};
  const ballThreat=team==='you'?game.ball.x<ARENA.width*.48:game.ball.x>ARENA.width*.52;
  if(profile==='defensive')return{x:ownGoal+(game.ball.x-ownGoal)*.3,y:ARENA.height/2+(game.ball.y-ARENA.height/2)*.58};
  if(profile==='counter'&&ballThreat)return{x:ownGoal+(game.ball.x-ownGoal)*.6,y:game.ball.y};
  if(profile==='aggressive')return{x:predicted.x-attack*62,y:predicted.y};
  if(profile==='technical')return{x:predicted.x-attack*28,y:predicted.y+Math.sin(game.elapsed*1.7)*18};
  return{x:predicted.x-attack*48,y:predicted.y};
}

export class AISystem{
  private readonly memory=new WeakMap<PlayerEntity,Memory>();

  update(
    game:MatchState,
    dt:number,
    abilities:AbilitySystem,
    player:PlayerEntity=game.b,
    team:TeamSide='rival',
    difficulty:AiDifficulty='challenger',
    profile:AiProfile='technical',
  ):NormalizedInput{
    const tuning=AI_DIFFICULTIES[difficulty];
    let memory=this.memory.get(player)??{wait:0,input:normalizeInput(0,0,1)};
    memory.wait-=dt;
    if(memory.wait<=0){
      const target=profileTarget(game,player,team,profile,tuning.prediction);
      const jitter=()=> (Math.random()-.5)*2*tuning.error;
      const normalized=normalizeInput(target.x+jitter()-player.x,target.y+jitter()-player.y,1);
      memory={wait:tuning.reaction*(.75+Math.random()*.5),input:{x:normalized.x*tuning.speed,y:normalized.y*tuning.speed,magnitude:normalized.magnitude*tuning.speed}};
      this.memory.set(player,memory);
    }

    const distance=Math.hypot(game.ball.x-player.x,game.ball.y-player.y);
    const attack=team==='you'?1:-1;
    const ballDirection=(game.ball.x-player.x)*attack;
    if((profile==='technical'||profile==='counter')&&distance<330){
      const desired:1|-1=ballDirection>=0?1:-1;
      if(player.polarity!==desired&&Math.random()<.12*tuning.prediction)player.polarity=desired;
    }
    if(player.dashCd<=0&&distance>220&&distance<560&&Math.random()<tuning.dashChance*dt*60)abilities.dash(player,memory.input);
    if(player.pulseCd<=0&&distance<285&&Math.random()<tuning.pulseChance*dt*60)abilities.pulse(player);
    if(player.flux>=100&&distance<430&&Math.random()<tuning.burstChance*dt*60)abilities.burst(player);
    return memory.input;
  }
}
