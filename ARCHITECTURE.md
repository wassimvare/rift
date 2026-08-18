# Architecture RIFT

La Phase 1 établit une architecture modulaire Vite + TypeScript. `GameEngine` orchestre le match, mais les responsabilités métier restent dans des modules remplaçables et testables.

```text
src/
├── main.ts                       # composition / injection des dépendances
├── types/                        # contrats TypeScript partagés
│   ├── game.ts
│   ├── item.ts
│   └── state.ts
├── data/                         # données statiques
│   ├── catalog.ts
│   └── modes.ts
├── state/                        # sauvegarde et état global
│   ├── defaults.ts
│   ├── storage.ts
│   └── Store.ts
├── economy/
│   └── MarketService.ts          # mutations d'achat / économie locale
├── progression/
│   └── ProgressionService.ts     # résultats, récompenses, abandons
├── network/
│   └── NetworkGateway.ts         # frontière réseau + transport local actuel
├── game/
│   ├── GameEngine.ts             # orchestration du cycle de match
│   ├── config.ts                 # tuning centralisé
│   ├── ai/
│   │   └── AISystem.ts           # décisions IA
│   ├── abilities/
│   │   ├── AbilitySystem.ts      # Dash / Pulse / Burst / collisions actives
│   │   └── AbilityMath.ts        # calculs purs testables
│   ├── entities/
│   │   └── factories.ts          # création Player / Core
│   ├── physics/
│   │   ├── PhysicsSystem.ts      # intégration et collisions
│   │   └── vector.ts             # math mouvement / deadzone / sous-étapes
│   └── rules/
│       └── goals.ts              # buts / overtime
├── input/
│   └── InputManager.ts           # clavier, tactile, Gamepad API
├── audio/
│   └── Sfx.ts                    # audio synthétique + haptique
└── ui/
    ├── UiController.ts           # écrans, HUD, Market, réglages
    ├── Renderer.ts               # rendu Canvas uniquement
    └── dom.ts                    # helpers DOM typés
```

## Flux principal

```text
main.ts
  ├─ Store
  ├─ InputManager
  ├─ Sfx
  ├─ MarketService
  ├─ ProgressionService
  ├─ LocalNetworkGateway
  ├─ AISystem
  ├─ UiController
  ├─ Renderer
  └─ GameEngine
         ├─ AbilitySystem
         └─ PhysicsSystem
```

## Règles d'architecture

1. Le navigateur ne lit/écrit pas directement la sauvegarde hors de `state/`.
2. Les constantes de gameplay sont centralisées dans `game/config.ts`.
3. Les fonctions mathématiques critiques restent pures et testables.
4. Les données d’items et de modes ne vivent pas dans le moteur.
5. `PhysicsSystem` ne décide pas de la stratégie IA.
6. `Renderer` dessine mais ne décide jamais du score ou des règles.
7. `UiController` gère le DOM mais ne modifie pas directement l’économie ou la sauvegarde.
8. Les achats passent par `MarketService`.
9. Les résultats/récompenses passent par `ProgressionService`.
10. Le réseau passe par l’interface `NetworkGateway` ; la Phase 7 pourra remplacer `LocalNetworkGateway` par un transport serveur sans réécrire le gameplay.
11. `GameEngine` orchestre les services au lieu de réimplémenter leurs responsabilités.
12. Toute nouvelle logique critique doit être accompagnée d’un test automatisé avant fusion.

## Build et validation

```text
npm test
npm run check
npm run build
npm run smoke
```

GitHub Actions exécute ce pipeline sur `main` et sur les pull requests. Après réussite, `dist/` est conservé dans l’artefact `rift-production-dist`.
