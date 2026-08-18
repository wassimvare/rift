# Phase 1 — Architecture propre et maintenable

Statut : **EN VALIDATION 🧪**

## Architecture

- [x] Vite devient le système officiel de développement et de build.
- [x] TypeScript strict activé sur le code applicatif.
- [x] `index.html` ne charge plus les anciens scripts globaux.
- [x] Point d’entrée unique : `src/main.ts`.
- [x] Données catalogue séparées dans `src/data/catalog.ts`.
- [x] Données modes séparées dans `src/data/modes.ts`.
- [x] État persistant séparé dans `src/state/`.
- [x] Store global observable (`Store`).
- [x] Types partagés séparés dans `src/types/`.
- [x] Moteur de match séparé (`GameEngine`).
- [x] Physique séparée (`PhysicsSystem`, fonctions vectorielles testables).
- [x] Capacités séparées (`AbilitySystem`, math de Pulse/Burst/Perfect Dash).
- [x] Entités séparées (`factories.ts`).
- [x] Règles de but/overtime séparées (`rules/goals.ts`).
- [x] Entrées clavier/mobile/manette séparées (`InputManager`).
- [x] Audio/haptique séparés (`Sfx`).
- [x] Rendu Canvas séparé (`Renderer`).
- [x] UI/DOM séparés (`UiController`, `dom.ts`).
- [x] Ancienne architecture JS supprimée dans le commit Phase 1.

## Compatibilité

- [x] La clé de sauvegarde reste `rift.phase0.save`.
- [x] `SAVE_VERSION = 2` conservé pour ne pas casser les sauvegardes Phase 2.
- [x] Migration des anciens Nova Credits conservée.
- [x] Inventaire, statistiques, réglages et historique conservés au rechargement.
- [x] Gameplay Phase 2 conservé : Dash, Perfect Dash, PUSH/PULL, Pulse, Burst, mobile et manette.

## Qualité

- [x] TypeScript `strict` compile sans erreur localement.
- [x] ESLint configuré.
- [x] Prettier configuré + commande de formatage.
- [x] 24 tests Node passent localement.
- [x] Tests Phase 0 et Phase 2 conservés.
- [x] 4 tests dédiés à l’architecture Phase 1 ajoutés.
- [x] Workflow GitHub Actions : install → tests → lint/types → build Vite → smoke build.
- [x] Smoke test du bundle de production ajouté.

## Critères de validation finale

La phase sera passée en **VALIDÉE ✅** uniquement après :

1. CI GitHub verte sur le commit Phase 1.
2. Build Vite de production créée avec succès.
3. Ancienne architecture JS supprimée du dépôt.
4. Build de production déployée et jouable.
5. Aucun échec des tests Phase 0/2.

> Branche `phase1-ci-validation` utilisée uniquement pour exposer le workflow de validation pull request au connecteur.
