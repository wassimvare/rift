# RIFT//EXCHANGE

Prototype compétitif d'arène autour du **Rift Core**, avec PUSH/PULL, Pulse, Dash, Perfect Dash, Rift Burst, IA évolutive, modes alternatifs et économie d'objets.

## État du projet

- Phase 0 — Stabilisation : ✅ VALIDÉE
- Phase 1 — Architecture : ✅ VALIDÉE
- Phase 2 — Gameplay & sensations : ✅ VALIDÉE
- Phase 3 — Modes, IA & tutoriel : ✅ VALIDÉE
- Phase 4 — Vault, Loadout, objets & pedigree : 🔵 PROCHAINE

Voir [`ROADMAP.md`](ROADMAP.md), [`PHASE0.md`](PHASE0.md), [`PHASE1.md`](PHASE1.md), [`PHASE2.md`](PHASE2.md), [`PHASE3.md`](PHASE3.md) et [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Gameplay Phase 3

RIFT propose maintenant :

- tutoriel guidé en 7 étapes ;
- 4 difficultés IA : Recruit, Challenger, Elite, Riftborn ;
- 4 profils IA : agressif, défensif, technique, contre-attaque ;
- RIFT Ranked ;
- RIFT Duel 1v1 ;
- RIFT Doubles 2v2 local avec IA ;
- RIFT Blitz ;
- Overcharge ;
- Flux Control ;
- Chaos Rift ;
- Custom Match ;
- Tournament en 3 rounds.

## Développement

```bash
npm install
npm run dev
```

## Validation

```bash
npm test
npm run check
npm run build
npm run smoke
```

La CI GitHub exécute les tests Phase 0/1/2/3, TypeScript strict, ESLint, le build Vite et le smoke test. Le dossier `dist/` validé est publié comme artefact `rift-production-dist`.

Dernière validation Phase 3 : **46/46 tests réussis**.

## Architecture

RIFT utilise **Vite + TypeScript strict**. Les responsabilités sont séparées :

- `src/game/` — moteur, physique, règles, capacités, modes, IA et entités ;
- `src/tutorial/` — tutoriel guidé ;
- `src/state/` — sauvegarde et Store ;
- `src/economy/` — économie locale ;
- `src/progression/` — résultats/progression ;
- `src/network/` — frontière réseau remplaçable ;
- `src/input/` — clavier, tactile et manette ;
- `src/audio/` — audio/haptique ;
- `src/ui/` — DOM et rendu Canvas ;
- `src/data/` — catalogue et modes.

La sauvegarde utilise toujours la clé `rift.phase0.save`. Le schéma Phase 3 est en version 3 et migre les sauvegardes précédentes, y compris l'ancien mode `quick` vers `duel`.
