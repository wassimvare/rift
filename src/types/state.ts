import type { AiDifficulty, AiProfile, InventoryType, ModeId, Outcome, TouchLayout } from './game.js';

export interface InventoryItem { uid:string; id:string; acquiredAt:number; }
export interface MatchHistoryEntry { id:string;at:number;mode:ModeId|string;scoreA:number;scoreB:number;outcome:Outcome;overtime:boolean;credits:number;xp:number; }
export interface KeyMap { up:string;down:string;left:string;right:string;dash:string;pulse:string;polarity:string;burst:string;pause:string; }
export interface PlayerSettings {
  audio:boolean;
  haptics:boolean;
  cameraShake:boolean;
  joystickSensitivity:number;
  touchScale:number;
  touchInset:number;
  touchLayout:TouchLayout;
  controller:boolean;
  keymap:KeyMap;
  aiDifficulty:AiDifficulty;
  aiProfile:AiProfile;
  customTime:number;
  customGoal:number;
  customCoreSpeed:number;
  customTeamSize:1|2;
}
export interface PlayerStats { matches:number;wins:number;losses:number;goalsFor:number;goalsAgainst:number;streak:number;bestStreak:number;abandoned:number; }
export interface TutorialProgress { completed:boolean; bestStep:number; completedAt:number|null; }
export interface PlayerState {
  saveVersion:number;
  credits:number;
  shards:number;
  selectedMode:ModeId;
  inventory:InventoryItem[];
  equippedItems:Record<InventoryType,string|null>;
  xp:number;
  level:number;
  stats:PlayerStats;
  settings:PlayerSettings;
  tutorial:TutorialProgress;
  missions:unknown[];
  matchHistory:MatchHistoryEntry[];
}
export interface StorageLike { getItem(key:string):string|null; setItem(key:string,value:string):void; }
