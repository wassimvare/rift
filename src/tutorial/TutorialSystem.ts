import type { MatchState } from '../types/game.js';

export type TutorialAction='dash'|'push'|'pull'|'pulse'|'burst';
export interface TutorialStep{ id:'movement'|'dash'|'push'|'pull'|'pulse'|'burst'|'duel'; title:string; prompt:string; }
export interface TutorialUpdate{ advanced:boolean; completed:boolean; step:TutorialStep|null; }

export const TUTORIAL_STEPS:TutorialStep[]=[
  {id:'movement',title:'01 · MOUVEMENT',prompt:'Déplace-toi avec WASD, les flèches ou le joystick pendant quelques secondes.'},
  {id:'dash',title:'02 · DASH',prompt:'Utilise DASH pour accélérer brutalement dans ta direction.'},
  {id:'push',title:'03 · PUSH',prompt:'Reste en polarité PUSH (cyan) et utilise PULSE sur le Core.'},
  {id:'pull',title:'04 · PULL',prompt:'Passe en PULL (rose), puis utilise PULSE pour attirer le Core.'},
  {id:'pulse',title:'05 · PULSE',prompt:'Utilise encore PULSE près du Core. Essaie de le combiner avec un Dash.'},
  {id:'burst',title:'06 · RIFT BURST',prompt:'Ton Flux est chargé à 100 %. Déclenche RIFT BURST.'},
  {id:'duel',title:'07 · FIRST DUEL',prompt:'Marque 2 buts contre une IA Recruit pour terminer le tutoriel.'},
];

export class TutorialSystem{
  private index=-1;
  private movement=0;
  private duelGoals=0;

  get active():boolean{return this.index>=0&&this.index<TUTORIAL_STEPS.length;}
  get stepIndex():number{return Math.max(0,this.index);}
  get current():TutorialStep|null{return this.active?(TUTORIAL_STEPS[this.index]??null):null;}
  get aiEnabled():boolean{return this.current?.id==='duel';}

  start():TutorialStep{
    this.index=0;this.movement=0;this.duelGoals=0;
    return TUTORIAL_STEPS[0]??{id:'movement',title:'01 · MOUVEMENT',prompt:'Déplace-toi pour commencer.'};
  }

  stop():void{this.index=-1;this.movement=0;this.duelGoals=0;}

  tickMovement(dt:number,magnitude:number):TutorialUpdate{
    if(this.current?.id!=='movement')return this.snapshot(false);
    if(magnitude>.25)this.movement+=dt;else this.movement=Math.max(0,this.movement-dt*.5);
    return this.movement>=1.4?this.advance():this.snapshot(false);
  }

  action(action:TutorialAction):TutorialUpdate{
    const id=this.current?.id;
    if(!id)return this.snapshot(false);
    if(id==='dash'&&action==='dash')return this.advance();
    if(id==='push'&&action==='push')return this.advance();
    if(id==='pull'&&action==='pull')return this.advance();
    if(id==='pulse'&&action==='pulse')return this.advance();
    if(id==='burst'&&action==='burst')return this.advance();
    return this.snapshot(false);
  }

  goal(playerScored:boolean):TutorialUpdate{
    if(this.current?.id!=='duel'||!playerScored)return this.snapshot(false);
    this.duelGoals+=1;
    if(this.duelGoals>=2){this.index=TUTORIAL_STEPS.length;return{advanced:true,completed:true,step:null};}
    return this.snapshot(false);
  }

  resetDuel():void{this.duelGoals=0;}

  prepare(game:MatchState):void{
    const id=this.current?.id;
    if(id==='burst')game.a.flux=100;
    if(id==='duel'){
      game.scoreA=0;game.scoreB=0;game.time=120;game.overtime=false;
    }
  }

  private advance():TutorialUpdate{
    this.index+=1;
    this.movement=0;
    return this.snapshot(true);
  }

  private snapshot(advanced:boolean):TutorialUpdate{return{advanced,completed:this.index>=TUTORIAL_STEPS.length,step:this.current};}
}
