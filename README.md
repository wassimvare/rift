# RIFT//EXCHANGE

Prototype compétitif d'arène 1v1 avec Core, PUSH/PULL, Pulse, Dash, Perfect Dash, Rift Burst et économie d'objets.

## État du projet

- Phase 0 — Stabilisation : ✅ VALIDÉE
- Phase 1 — Architecture : ✅ VALIDÉE
- Phase 2 — Gameplay & sensations : ✅ VALIDÉE
- Phase 3 — Modes, IA & tutoriel : 🔵 PROCHAINE

Voir [`ROADMAP.md`](ROADMAP.md), [`PHASE0.md`](PHASE0.md), [`PHASE1.md`](PHASE1.md), [`PHASE2.md`](PHASE2.md) et [`ARCHITECTURE.md`](ARCHITECTURE.md).

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

La CI GitHub exécute les tests Phase 0/1/2, TypeScript strict, ESLint, le build Vite et le smoke test. Le dossier `dist/` validé est publié comme artefact `rift-production-dist`.

## Architecture

RIFT utilise **Vite + TypeScript strict**. Les responsabilités sont séparées :

- `src/game/` — moteur, physique, règles, capacités, IA et entités ;
- `src/state/` — sauvegarde et Store ;
- `src/economy/` — économie locale ;
- `src/progression/` — résultats/progression ;
- `src/network/` — frontière réseau remplaçable ;
- `src/input/` — clavier, tactile et manette ;
- `src/audio/` — audio/haptique ;
- `src/ui/` — DOM et rendu Canvas ;
- `src/data/` — catalogue et modes.

La sauvegarde reste compatible avec les builds Phase 0/2 via la clé `rift.phase0.save`.
