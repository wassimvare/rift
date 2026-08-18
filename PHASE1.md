# Phase 1 — Architecture propre et maintenable

Statut : **VALIDÉE ✅**

## Architecture

- [x] Vite est le système officiel de développement et de build.
- [x] TypeScript `strict` activé sur le code applicatif.
- [x] Point d’entrée unique : `src/main.ts`.
- [x] Données catalogue séparées dans `src/data/`.
- [x] État persistant et Store global séparés dans `src/state/`.
- [x] Types partagés dans `src/types/`.
- [x] Moteur de match séparé : `GameEngine`.
- [x] Physique séparée : `PhysicsSystem` + fonctions mathématiques testables.
- [x] Capacités séparées : `AbilitySystem` + `AbilityMath`.
- [x] IA séparée : `AISystem`.
- [x] Entités séparées : `game/entities/`.
- [x] Règles de buts/overtime séparées : `game/rules/`.
- [x] Entrées clavier/mobile/manette séparées : `InputManager`.
- [x] Audio/haptique séparés : `Sfx`.
- [x] Rendu Canvas séparé : `Renderer`.
- [x] UI/DOM séparés : `UiController` + `dom.ts`.
- [x] Économie séparée : `MarketService`.
- [x] Progression séparée : `ProgressionService`.
- [x] Frontière réseau créée : `NetworkGateway`, actuellement implémentée par `LocalNetworkGateway`.
- [x] Ancienne architecture `core.js`, `game.js` et `game/phase2-*.js` supprimée.

## Compatibilité

- [x] La clé de sauvegarde reste `rift.phase0.save`.
- [x] `SAVE_VERSION = 2` conservé pour les sauvegardes Phase 2.
- [x] Migration des anciens Nova Credits conservée.
- [x] Inventaire, statistiques, réglages et historique persistent après migration.
- [x] Gameplay Phase 2 conservé : Dash, Perfect Dash, PUSH/PULL, Pulse, Burst, mobile et manette.

## Qualité et CI

- [x] TypeScript strict sans erreur.
- [x] ESLint sans erreur.
- [x] Prettier configuré.
- [x] Tests Phase 0 conservés.
- [x] Tests Phase 2 conservés.
- [x] Tests Phase 1 dédiés aux frontières d’architecture.
- [x] **28/28 tests Node réussis dans GitHub Actions**.
- [x] `npm run check` réussi dans GitHub Actions.
- [x] `npm run build` Vite réussi dans GitHub Actions.
- [x] `npm run smoke` réussi sur le bundle `dist/`.
- [x] Artefact `rift-production-dist` généré automatiquement après validation.
- [x] Déploiement production du bundle validé effectué sur Vercel.

## Pipeline officiel

```text
Git push / Pull Request
        ↓
npm install
        ↓
28 tests Phase 0 + 1 + 2
        ↓
TypeScript strict + ESLint
        ↓
Vite production build
        ↓
Smoke test dist/
        ↓
Artefact rift-production-dist
```

## Résultat

La Phase 1 est fermée. RIFT ne repose plus sur un fichier JavaScript monolithique : chaque responsabilité possède désormais une frontière claire et testable. La future couche multijoueur pourra remplacer `LocalNetworkGateway` sans réécrire la physique, l’UI, l’économie locale ou le moteur de match.

**Critère de sortie : atteint. ✅**
