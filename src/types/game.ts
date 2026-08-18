export type ModeId =
  | 'ranked'
  | 'duel'
  | 'doubles'
  | 'blitz'
  | 'overcharge'
  | 'flux'
  | 'chaos'
  | 'custom'
  | 'tournament';
export type Outcome = 'win' | 'loss' | 'draw' | 'abandoned';
export type TouchLayout = 'right' | 'left';
export type InventoryType = 'Frame' | 'Trail' | 'Core Skin' | 'Goal FX' | 'Banner';
export type AiDifficulty = 'recruit' | 'challenger' | 'elite' | 'riftborn';
export type AiProfile = 'aggressive' | 'defensive' | 'technical' | 'counter';
export type TeamSide = 'you' | 'rival';
export type ModeRule = 'standard' | 'doubles' | 'blitz' | 'overcharge' | 'flux' | 'chaos' | 'custom' | 'tournament';
export type ChaosEvent = 'CORE SURGE' | 'FULL FLUX' | 'POLARITY SHIFT' | 'DASH RESET';

export interface Vector2 { x: number; y: number; }
export interface NormalizedInput extends Vector2 { magnitude: number; }
export interface GameplayConfig {
  playerAcceleration:number;
  playerMovingFriction:number;
  playerIdleFriction:number;
  playerMaxSpeed:number;
  dashImpulse:number;
  dashCooldown:number;
  dashActive:number;
  perfectDashMultiplier:number;
  perfectDashFlux:number;
  pulseRange:number;
  pulseCooldown:number;
  pulseMinForce:number;
  pulseMaxForce:number;
  pulseComboMultiplier:number;
  burstRange:number;
  burstForce:number;
  coreFriction:number;
  coreMaxSpeed:number;
  wallRestitution:number;
  maxSubsteps:number;
  substepTravel:number;
  controllerDeadzone:number;
}
export interface ModeConfig {
  name:string;
  subtitle:string;
  rule:ModeRule;
  time:number;
  goal:number;
  rewardWin:number;
  rewardLoss:number;
  xpWin:number;
  xpLoss:number;
  coreSpeed:number;
  ai:number;
  teamSize:1|2;
  description:string;
}
export interface PlayerEntity {
  x:number;
  y:number;
  vx:number;
  vy:number;
  r:number;
  color:string;
  ai:boolean;
  face:number;
  dashCd:number;
  dashActive:number;
  perfectConsumed:boolean;
  pulseCd:number;
  polarity:1|-1;
  flux:number;
  trail:Array<{x:number;y:number;boost:boolean}>;
}
export interface BotSlot {
  player:PlayerEntity;
  team:TeamSide;
  difficulty:AiDifficulty;
  profile:AiProfile;
}
export interface BallEntity { x:number;y:number;vx:number;vy:number;r:number;wallStuck:number; }
export interface Particle { x:number;y:number;vx:number;vy:number;life:number;maxLife:number;size:number;color:string; }
export interface Ring { x:number;y:number;color:string;start:number;end:number;life:number;maxLife:number; }
export type GamePhase='countdown'|'play'|'paused'|'goal'|'result';
export interface MatchState {
  mode:ModeId;
  m:ModeConfig;
  a:PlayerEntity;
  b:PlayerEntity;
  extraPlayers:BotSlot[];
  ball:BallEntity;
  scoreA:number;
  scoreB:number;
  time:number;
  phase:GamePhase;
  ended:boolean;
  overtime:boolean;
  lastScorer:'player'|'rival'|null;
  particles:Particle[];
  rings:Ring[];
  shake:number;
  flash:number;
  freeze:number;
  hitSfxCd:number;
  elapsed:number;
  controlA:number;
  controlB:number;
  chaosTimer:number;
  chaosEvent:ChaosEvent|null;
  tournamentRound:number;
  tutorial:boolean;
}
