import { CATALOG, itemById } from '../data/catalog.js';
import { MODES } from '../data/modes.js';
import type { InputAction } from '../input/InputManager.js';
import type { PlayerState } from '../types/state.js';
import type { AiDifficulty, AiProfile, ModeId } from '../types/game.js';
import { qs, qsa } from './dom.js';

export interface UiActions{
  play():void;
  startTutorial():void;
  pause():void;
  restart():void;
  quit():void;
  dash():void;
  pulse():void;
  polarity():void;
  burst():void;
  buy(id:string):void;
  selectMode(mode:ModeId):void;
  setting<K extends keyof PlayerState['settings']>(key:K,value:PlayerState['settings'][K]):void;
  captureBinding(action:InputAction):void;
  navigate(view:string):boolean;
}

export class UiController{
  private toastTimer=0;
  private combatTimer=0;
  constructor(private readonly actions:UiActions){this.bind();}

  render(state:PlayerState,captureAction:InputAction|null=null):void{
    qs('#credits').textContent=state.credits.toLocaleString('fr-FR');qs('#shards').textContent=String(state.shards);
    qs('#statMatches').textContent=String(state.stats.matches);qs('#statWins').textContent=String(state.stats.wins);qs('#statGoals').textContent=String(state.stats.goalsFor);qs('#statCollection').textContent=String(state.inventory.length);
    qsa<HTMLElement>('.mode').forEach(button=>button.classList.toggle('sel',button.dataset.mode===state.selectedMode));
    qs('#tutorialState').textContent=state.tutorial.completed?'TUTORIEL TERMINÉ ✅':state.tutorial.bestStep>0?`TUTORIEL ${state.tutorial.bestStep}/7`:'TUTORIEL À FAIRE';
    qs<HTMLSelectElement>('#aiDifficulty').value=state.settings.aiDifficulty;qs<HTMLSelectElement>('#aiProfile').value=state.settings.aiProfile;
    qs<HTMLInputElement>('#customTime').value=String(state.settings.customTime);qs('#customTimeValue').textContent=`${state.settings.customTime}s`;
    qs<HTMLInputElement>('#customGoal').value=String(state.settings.customGoal);qs('#customGoalValue').textContent=String(state.settings.customGoal);
    qs<HTMLInputElement>('#customCoreSpeed').value=String(state.settings.customCoreSpeed);qs('#customCoreSpeedValue').textContent=`${Math.round(state.settings.customCoreSpeed*100)}%`;
    qs<HTMLSelectElement>('#customTeamSize').value=String(state.settings.customTeamSize);
    qs('#vaultGrid').innerHTML=state.inventory.map(entry=>{const item=itemById(entry.id);return item?this.card(item):'';}).join('')||'<p>Vault vide.</p>';
    qs('#marketGrid').innerHTML=CATALOG.map(item=>this.card(item,`<button class="ghost buy" data-id="${item.id}">ACHETER</button>`)).join('');
    qsa<HTMLButtonElement>('.buy').forEach(button=>button.onclick=()=>this.actions.buy(button.dataset.id??''));
    qs('#historyList').innerHTML=state.matchHistory.length?state.matchHistory.map(entry=>`<article class="panel historyRow"><div><b>${entry.outcome==='win'?'VICTOIRE':entry.outcome==='loss'?'DÉFAITE':entry.outcome==='abandoned'?'ABANDON':'NUL'} ${entry.scoreA}-${entry.scoreB}</b><br><small>${MODES[entry.mode as ModeId]?.name??entry.mode}${entry.overtime?' · OVERTIME':''}</small></div><small>+${entry.credits||0} NC</small></article>`).join(''):'<p>Aucun match terminé.</p>';
    this.renderSettings(state,captureAction);this.applyTouchSettings(state);
  }

  setScore(a:number,b:number):void{qs('#sa').textContent=String(a);qs('#sb').textContent=String(b);}
  setModeAndClock(mode:string,clock:string):void{qs('#modeTitle').textContent=mode;qs('#clock').textContent=clock;}
  setClock(clock:string):void{qs('#clock').textContent=clock;}
  modeStatus(text:string):void{qs('#modeStatus').textContent=text;}
  setPauseLabel(label:string):void{qs('#pauseBtn').textContent=label;}
  setPolarity(pull:boolean):void{const color=pull?'#ff71c6':'#59f5ff',label=pull?'PULL':'PUSH';qs<HTMLElement>('#polarityText').textContent=label;qs<HTMLElement>('#polarityText').style.color=color;qs<HTMLElement>('#pol').style.color=color;}
  abilityHud(dashPct:number,pulsePct:number,pulseText:string,flux:number):void{qs<HTMLElement>('#dashM').style.width=`${dashPct}%`;qs<HTMLElement>('#pulseM').style.width=`${pulsePct}%`;qs('#pulseT').textContent=pulseText;qs<HTMLElement>('#fluxM').style.width=`${flux}%`;qs('#fluxT').textContent=flux>=100?'READY':`${Math.round(flux)}%`;qs('#burst').classList.toggle('abilityReady',flux>=100);}
  overlay(html:string,visible=true):void{const element=qs('#ov');element.innerHTML=html;element.classList.toggle('hidden',!visible);}
  tutorialPrompt(title:string,prompt:string,progress:number,visible=true):void{const coach=qs('#tutorialCoach');coach.classList.toggle('hidden',!visible);qs('#tutorialTitle').textContent=title;qs('#tutorialPrompt').textContent=prompt;qs('#tutorialProgress').textContent=visible?`${progress}/7`:'';}
  combat(text:string,color='#fff',duration=400):void{const element=qs<HTMLElement>('#combatHint');element.textContent=text;element.style.color=color;element.classList.add('show');window.clearTimeout(this.combatTimer);this.combatTimer=window.setTimeout(()=>element.classList.remove('show'),duration);}
  toast(text:string):void{const element=qs('#toast');element.textContent=text;element.classList.add('show');window.clearTimeout(this.toastTimer);this.toastTimer=window.setTimeout(()=>element.classList.remove('show'),1600);}
  showModal(html:string):void{qs('#modalContent').innerHTML=html;qs('#modal').classList.remove('hidden');}
  closeModal():void{qs('#modal').classList.add('hidden');}
  gameView():void{qsa('.view').forEach(view=>view.classList.remove('active'));qs('#game').classList.add('active');qsa('[data-v]').forEach(button=>button.classList.remove('active'));document.body.classList.add('game');window.scrollTo(0,0);}
  menuView():void{document.body.classList.remove('game');qsa('.view').forEach(view=>view.classList.remove('active'));qs('#home').classList.add('active');qsa<HTMLElement>('[data-v]').forEach(button=>button.classList.toggle('active',button.dataset.v==='home'));}
  navigate(view:string):void{qsa('.view').forEach(element=>element.classList.remove('active'));qs(`#${view}`).classList.add('active');qsa<HTMLElement>('[data-v]').forEach(button=>button.classList.toggle('active',button.dataset.v===view));document.body.classList.toggle('game',view==='game');window.scrollTo(0,0);}
  bindResult(rematch:()=>void,menu:()=>void):void{qs<HTMLButtonElement>('#rematch').onclick=rematch;qs<HTMLButtonElement>('#resultMenu').onclick=menu;}
  bindConfirm(confirmId:string,confirm:()=>void,cancelId:string,cancel:()=>void):void{qs<HTMLButtonElement>(`#${confirmId}`).onclick=confirm;qs<HTMLButtonElement>(`#${cancelId}`).onclick=cancel;}

  private bind():void{
    qsa<HTMLButtonElement>('[data-v]').forEach(button=>button.onclick=()=>this.actions.navigate(button.dataset.v??'home'));
    qsa<HTMLButtonElement>('.mode').forEach(button=>button.onclick=()=>this.actions.selectMode(button.dataset.mode as ModeId));
    qs<HTMLButtonElement>('#play').onclick=()=>this.actions.play();qs<HTMLButtonElement>('#tutorialBtn').onclick=()=>this.actions.startTutorial();qs<HTMLButtonElement>('#pauseBtn').onclick=()=>this.actions.pause();qs<HTMLButtonElement>('#restartBtn').onclick=()=>this.actions.restart();qs<HTMLButtonElement>('#exitBtn').onclick=()=>this.actions.quit();
    for(const[id,action]of[['#dash','dash'],['#pulse','pulse'],['#pol','polarity'],['#burst','burst'],['#polarityText','polarity']]as const)qs<HTMLButtonElement>(id).onpointerdown=event=>{event.preventDefault();this.actions[action]();};
    qs<HTMLSelectElement>('#aiDifficulty').addEventListener('change',event=>this.actions.setting('aiDifficulty',(event.target as HTMLSelectElement).value as AiDifficulty));
    qs<HTMLSelectElement>('#aiProfile').addEventListener('change',event=>this.actions.setting('aiProfile',(event.target as HTMLSelectElement).value as AiProfile));
    const bindRange=<K extends'joystickSensitivity'|'touchScale'|'touchInset'|'customTime'|'customGoal'|'customCoreSpeed'>(id:string,key:K)=>qs<HTMLInputElement>(id).addEventListener('input',event=>this.actions.setting(key,Number((event.target as HTMLInputElement).value)as PlayerState['settings'][K]));
    bindRange('#joySens','joystickSensitivity');bindRange('#touchScale','touchScale');bindRange('#touchInset','touchInset');bindRange('#customTime','customTime');bindRange('#customGoal','customGoal');bindRange('#customCoreSpeed','customCoreSpeed');
    qs<HTMLSelectElement>('#customTeamSize').addEventListener('change',event=>this.actions.setting('customTeamSize',Number((event.target as HTMLSelectElement).value)===2?2:1));
    qs<HTMLSelectElement>('#touchLayout').addEventListener('change',event=>this.actions.setting('touchLayout',(event.target as HTMLSelectElement).value as PlayerState['settings']['touchLayout']));
    qs<HTMLButtonElement>('#hapticsToggle').onclick=()=>this.toggleBool('haptics');qs<HTMLButtonElement>('#shakeToggle').onclick=()=>this.toggleBool('cameraShake');qs<HTMLButtonElement>('#audioToggle').onclick=()=>this.toggleBool('audio');qsa<HTMLButtonElement>('.bindBtn').forEach(button=>button.onclick=()=>this.actions.captureBinding(button.dataset.bind as InputAction));
  }
  private toggleBool(key:'haptics'|'cameraShake'|'audio'):void{const button=key==='haptics'?qs('#hapticsToggle'):key==='cameraShake'?qs('#shakeToggle'):qs('#audioToggle');this.actions.setting(key,button.textContent!=='ON');}
  private card(item:(typeof CATALOG)[number],button=''):string{return`<article class="panel card"><div class="art" style="--a:${item.a};--b:${item.b}"></div><h3>${item.name}</h3><small>${item.type}</small><div class="price">${item.price.toLocaleString('fr-FR')} NC</div>${button}</article>`;}
  private renderSettings(state:PlayerState,captureAction:InputAction|null):void{const settings=state.settings;qs<HTMLInputElement>('#joySens').value=String(settings.joystickSensitivity);qs('#joySensValue').textContent=`${Math.round(settings.joystickSensitivity*100)}%`;qs<HTMLInputElement>('#touchScale').value=String(settings.touchScale);qs('#touchScaleValue').textContent=`${Math.round(settings.touchScale*100)}%`;qs<HTMLInputElement>('#touchInset').value=String(settings.touchInset);qs('#touchInsetValue').textContent=`${settings.touchInset}px`;qs<HTMLSelectElement>('#touchLayout').value=settings.touchLayout;qs('#hapticsToggle').textContent=settings.haptics?'ON':'OFF';qs('#shakeToggle').textContent=settings.cameraShake?'ON':'OFF';qs('#audioToggle').textContent=settings.audio?'ON':'OFF';qsa<HTMLButtonElement>('.bindBtn').forEach(button=>{const action=button.dataset.bind as InputAction,label=action.toUpperCase();button.innerHTML=`${label}<br><b>${this.prettyCode(settings.keymap[action])}</b>`;button.classList.toggle('waiting',captureAction===action);});const pad=[...(navigator.getGamepads?.()??[])].find(Boolean);qs('#gamepadDot').classList.toggle('on',!!pad);qs('#gamepadStatus').textContent=pad?`Manette détectée : ${pad.id.slice(0,42)}`:'Aucune manette détectée';}
  private applyTouchSettings(state:PlayerState):void{const arena=qs<HTMLElement>('#arena');arena.style.setProperty('--touch-scale',String(state.settings.touchScale));arena.style.setProperty('--touch-inset',`${state.settings.touchInset}px`);arena.classList.toggle('touch-left',state.settings.touchLayout==='left');}
  private prettyCode(code:string):string{return({Space:'ESPACE',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Escape:'ÉCHAP'}as Record<string,string>)[code]??code.replace(/^Key/,'').replace(/^Digit/,'');}
}
