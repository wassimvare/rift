import type { ModeConfig, ModeId } from '../types/game.js';

export const MODES:Record<ModeId,ModeConfig>={
  ranked:{name:'RIFT RANKED',subtitle:'3:00 · premier à 5',rule:'standard',time:180,goal:5,rewardWin:620,rewardLoss:260,xpWin:120,xpLoss:55,coreSpeed:1,ai:1,teamSize:1,description:'Duel compétitif standard. IA Elite avec profil contre-attaque.'},
  duel:{name:'RIFT DUEL',subtitle:'2:30 · premier à 5',rule:'standard',time:150,goal:5,rewardWin:430,rewardLoss:190,xpWin:90,xpLoss:45,coreSpeed:1,ai:.95,teamSize:1,description:'Le 1v1 pur pour apprendre les timings et les mécaniques.'},
  doubles:{name:'RIFT DOUBLES',subtitle:'3:00 · 2v2 · premier à 5',rule:'doubles',time:180,goal:5,rewardWin:540,rewardLoss:235,xpWin:105,xpLoss:50,coreSpeed:1.04,ai:.98,teamSize:2,description:'2v2 avec un allié IA et deux rivaux IA sur la même arène.'},
  blitz:{name:'RIFT BLITZ',subtitle:'1:30 · premier à 3 · Core rapide',rule:'blitz',time:90,goal:3,rewardWin:330,rewardLoss:140,xpWin:66,xpLoss:34,coreSpeed:1.38,ai:1.03,teamSize:1,description:'Core survolté, départ avec du Flux et rythme beaucoup plus agressif.'},
  overcharge:{name:'OVERCHARGE',subtitle:'2:30 · Core accélère sans cesse',rule:'overcharge',time:150,goal:5,rewardWin:500,rewardLoss:210,xpWin:100,xpLoss:48,coreSpeed:.92,ai:1,teamSize:1,description:'La vitesse maximale du Core augmente pendant tout le match.'},
  flux:{name:'FLUX CONTROL',subtitle:'2:30 · premier à 12 points',rule:'flux',time:150,goal:12,rewardWin:520,rewardLoss:220,xpWin:104,xpLoss:50,coreSpeed:.96,ai:.98,teamSize:1,description:'Contrôle le Core dans le camp adverse pour marquer des points. Un but vaut 2.'},
  chaos:{name:'CHAOS RIFT',subtitle:'2:15 · mutation toutes les 12 s',rule:'chaos',time:135,goal:5,rewardWin:510,rewardLoss:220,xpWin:102,xpLoss:50,coreSpeed:1.08,ai:1,teamSize:1,description:'Core Surge, Full Flux, Polarity Shift ou Dash Reset changent le duel en direct.'},
  custom:{name:'CUSTOM MATCH',subtitle:'Règles personnalisées',rule:'custom',time:180,goal:5,rewardWin:150,rewardLoss:80,xpWin:35,xpLoss:20,coreSpeed:1,ai:.95,teamSize:1,description:'Choisis durée, score cible, vitesse du Core et 1v1/2v2.'},
  tournament:{name:'RIFT TOURNAMENT',subtitle:'Bracket 8 joueurs · 3 rounds',rule:'tournament',time:120,goal:3,rewardWin:900,rewardLoss:180,xpWin:180,xpLoss:40,coreSpeed:1.02,ai:1,teamSize:1,description:'Quart, demi puis finale contre des IA de plus en plus fortes.'},
};

export const MODE_ORDER:ModeId[]=['ranked','duel','doubles','blitz','overcharge','flux','chaos','custom','tournament'];
