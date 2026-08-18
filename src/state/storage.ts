import type { InventoryItem, MatchHistoryEntry, PlayerSettings, PlayerState, StorageLike } from '../types/state.js';
import type { ModeId, Outcome } from '../types/game.js';
import { DEFAULT_KEYMAP, LEGACY_CREDITS_KEY, MAX_HISTORY, SAVE_KEY, SAVE_VERSION, defaultSettings, defaultState } from './defaults.js';

const MODES:ModeId[]=['ranked','duel','doubles','blitz','overcharge','flux','chaos','custom','tournament'];
const DIFFICULTIES=['recruit','challenger','elite','riftborn'] as const;
const PROFILES=['aggressive','defensive','technical','counter'] as const;
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(value)?value:min));
const uid=(prefix='itm')=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;

function normalizeInventory(list:unknown):InventoryItem[]{
  const base=defaultState().inventory;
  if(!Array.isArray(list))return base;
  return list.map((entry,index)=>{
    if(typeof entry==='string')return{uid:`legacy_${index}_${entry}`,id:entry,acquiredAt:0};
    if(!entry||typeof entry!=='object'||typeof(entry as Record<string,unknown>).id!=='string')return null;
    const value=entry as Partial<InventoryItem>;
    return{uid:typeof value.uid==='string'&&value.uid?value.uid:uid('itm'),id:value.id!,acquiredAt:Number.isFinite(value.acquiredAt)?value.acquiredAt!:0};
  }).filter((item):item is InventoryItem=>item!==null);
}

export function normalizeSettings(raw:unknown):PlayerSettings{
  const base=defaultSettings();
  const input=raw&&typeof raw==='object'?raw as Partial<PlayerSettings>:{};
  return{
    ...base,
    ...input,
    audio:input.audio!==false,
    haptics:input.haptics!==false,
    cameraShake:input.cameraShake!==false,
    joystickSensitivity:clamp(Number(input.joystickSensitivity??base.joystickSensitivity),.6,1.5),
    touchScale:clamp(Number(input.touchScale??base.touchScale),.8,1.3),
    touchInset:clamp(Number(input.touchInset??base.touchInset),6,36),
    touchLayout:input.touchLayout==='left'?'left':'right',
    controller:input.controller!==false,
    keymap:{...DEFAULT_KEYMAP,...(input.keymap??{})},
    aiDifficulty:DIFFICULTIES.includes(input.aiDifficulty as (typeof DIFFICULTIES)[number])?input.aiDifficulty!:base.aiDifficulty,
    aiProfile:PROFILES.includes(input.aiProfile as (typeof PROFILES)[number])?input.aiProfile!:base.aiProfile,
    customTime:clamp(Number(input.customTime??base.customTime),60,360),
    customGoal:Math.round(clamp(Number(input.customGoal??base.customGoal),1,12)),
    customCoreSpeed:clamp(Number(input.customCoreSpeed??base.customCoreSpeed),.75,1.6),
    customTeamSize:input.customTeamSize===2?2:1,
  };
}

export function migrateState(raw:unknown,legacyCredits?:number):PlayerState{
  const base=defaultState();
  if(!raw||typeof raw!=='object'){
    if(Number.isFinite(legacyCredits)&&legacyCredits!>=0)base.credits=legacyCredits!;
    return base;
  }
  const input=raw as Partial<PlayerState>&{mode?:ModeId;inv?:unknown[];equipped?:PlayerState['equippedItems']};
  const rawMode=(input.selectedMode??input.mode) as string|undefined;
  const mode=(rawMode==='quick'?'duel':rawMode) as ModeId|undefined;
  const tutorial=input.tutorial&&typeof input.tutorial==='object'?input.tutorial:{};
  return{
    ...base,
    ...input,
    saveVersion:SAVE_VERSION,
    credits:Number.isFinite(input.credits)&&input.credits!>=0?input.credits!:base.credits,
    shards:Number.isFinite(input.shards)&&input.shards!>=0?input.shards!:base.shards,
    selectedMode:mode&&MODES.includes(mode)?mode:base.selectedMode,
    inventory:normalizeInventory(input.inventory??input.inv),
    equippedItems:{...base.equippedItems,...(input.equippedItems??input.equipped??{})},
    stats:{...base.stats,...(input.stats??{})},
    settings:normalizeSettings(input.settings),
    tutorial:{...base.tutorial,...tutorial},
    missions:Array.isArray(input.missions)?input.missions:[],
    matchHistory:Array.isArray(input.matchHistory)?input.matchHistory.slice(0,MAX_HISTORY):[],
  };
}

export function loadState(storage:StorageLike):PlayerState{
  const legacyRaw=storage.getItem(LEGACY_CREDITS_KEY);
  const parsed=legacyRaw===null||legacyRaw===''?undefined:Number(legacyRaw);
  const legacy=Number.isFinite(parsed)&&parsed!>=0?parsed:undefined;
  try{
    const raw=storage.getItem(SAVE_KEY);
    return raw?migrateState(JSON.parse(raw),legacy):migrateState(null,legacy);
  }catch{return migrateState(null,legacy);}
}
export function saveState(storage:StorageLike,state:PlayerState):PlayerState{
  const normalized=migrateState(state);
  storage.setItem(SAVE_KEY,JSON.stringify(normalized));
  return normalized;
}
export function addInventoryItem(state:PlayerState,id:string,acquiredAt=Date.now()):InventoryItem{
  const value={uid:uid('itm'),id,acquiredAt};state.inventory.push(value);return value;
}
export function addMatchHistory(state:PlayerState,entry:MatchHistoryEntry):void{
  state.matchHistory.unshift(entry);if(state.matchHistory.length>MAX_HISTORY)state.matchHistory.length=MAX_HISTORY;
}
export function matchOutcome(scoreA:number,scoreB:number):Exclude<Outcome,'abandoned'>{return scoreA>scoreB?'win':scoreA<scoreB?'loss':'draw';}
export function applyMatchResult(state:PlayerState,result:Omit<MatchHistoryEntry,'id'|'outcome'>&{id?:string}):Exclude<Outcome,'abandoned'>{
  const outcome=matchOutcome(result.scoreA,result.scoreB);
  state.stats.matches+=1;state.stats.goalsFor+=result.scoreA;state.stats.goalsAgainst+=result.scoreB;
  if(outcome==='win'){state.stats.wins+=1;state.stats.streak+=1;state.stats.bestStreak=Math.max(state.stats.bestStreak,state.stats.streak);}
  else if(outcome==='loss'){state.stats.losses+=1;state.stats.streak=0;}
  state.credits+=result.credits||0;state.shards+=outcome==='win'?2:1;state.xp+=result.xp||0;
  addMatchHistory(state,{...result,id:result.id??uid('match'),outcome});return outcome;
}
