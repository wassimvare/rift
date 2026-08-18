# RIFT//EXCHANGE

Prototype compétitif d'arène 1v1 avec Core, PUSH/PULL, Pulse, Dash, Perfect Dash, Rift Burst et économie d'objets.

## État du projet

- Phase 0 — Stabilisation : ✅ VALIDÉE
- Phase 1 — Architecture : 🧪 EN VALIDATION
- Phase 2 — Gameplay & sensations : ✅ VALIDÉE

Voir [`ROADMAP.md`](ROADMAP.md), [`PHASE1.md`](PHASE1.md) et [`ARCHITECTURE.md`](ARCHITECTURE.md).

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

## Architecture

RIFT utilise désormais **Vite + TypeScript strict**. La logique est séparée en modules : état, données, moteur, physique, capacités, entrées, audio et UI.

La sauvegarde reste compatible avec les builds Phase 0/2 via la clé `rift.phase0.save`.
