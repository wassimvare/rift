# Architecture RIFT

RIFT repose sur une architecture modulaire **Vite + TypeScript strict**. `GameEngine` orchestre un match, tandis que physique, capacités, IA, règles de modes, tutoriel, économie, progression, réseau et rendu restent séparés.

```text
src/
├── main.ts                       # composition / injection des dépendances
├── types/                        # contrats TypeScript partagés
│   ├── game.ts
│   ├── item.ts
│   └── state.ts
├── data/                         # données statiques
│   ├── catalog.ts
│   └── modes.ts                  # 9 configurations de modes
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
├── tutorial/
│   └── TutorialSystem.ts         # progression guidée en 7 étapes
├── game/
│   ├── GameEngine.ts             # orchestration du cycle de match
│   ├── config.ts                 # tuning centralisé
│   ├── modes/
│   │   └── ModeSystem.ts         # Overcharge / Flux / Chaos / Custom / Tournament
│   ├── ai/
│   │   └── AISystem.ts           # difficultés, profils et capacités IA
│   ├── abilities/
│   │   ├── AbilitySystem.ts      # Dash / Pulse / Burst / collisions actives
│   │   └── AbilityMath.ts        # calculs purs testables
│   ├── entities/
│   │   └── factories.ts          # création Player / Core
│   ├── physics/
│   │   ├── PhysicsSystem.ts      # intégration 1v1/2v2 et collisions
│   │   └── vector.ts             # math mouvement / deadzone / sous-étapes
│   └── rules/
│       └── goals.ts              # buts / overtime
├── input/
│   └── InputManager.ts           # clavier, tactile, Gamepad API
├── audio/
│   └── Sfx.ts                    # audio synthétique + haptique
└── ui/
    ├── UiController.ts           # écrans, HUD, modes, tutoriel, Market, réglages
    ├── Renderer.ts               # rendu Canvas, joueurs supplémentaires et zones
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
  ├─ ModeSystem
  ├─ TutorialSystem
  ├─ UiController
  ├─ Renderer
  └─ GameEngine
         ├─ AbilitySystem
         └─ PhysicsSystem
```

## Phase 3 : responsabilités nouvelles

### `AISystem`

- possède les 4 difficultés et leurs paramètres de réaction/précision/vitesse ;
- possède les 4 profils tactiques ;
- conserve une mémoire de réaction distincte par bot ;
- retourne une intention de mouvement au moteur ;
- peut demander Dash, Pulse, Burst et modifier la polarité, mais ne gère ni score ni sauvegarde.

### `ModeSystem`

- résout les règles du mode sélectionné ;
- applique Overcharge, Flux Control et Chaos Rift ;
- fournit la valeur des buts et le score cible ;
- construit les règles Custom depuis les réglages sauvegardés ;
- définit la montée de difficulté du Tournament.

### `TutorialSystem`

- contient la machine d'état des 7 étapes ;
- ne modifie pas la progression compétitive ;
- indique quand l'IA doit être activée ;
- permet de recommencer le duel guidé sans polluer les statistiques.

### `PhysicsSystem`

La physique n'est plus limitée à deux participants : elle reçoit le joueur local et une liste de contrôles bots. Elle intègre les positions, collisions joueur/Core et collisions entre tous les joueurs. Cette base permet au **Doubles local 2v2** d'être réel et prépare le futur Doubles réseau.

## Règles d'architecture

1. Le navigateur ne lit/écrit pas directement la sauvegarde hors de `state/`.
2. Les constantes de gameplay sont centralisées dans `game/config.ts`.
3. Les fonctions mathématiques critiques restent pures et testables.
4. Les données d'items et de modes ne vivent pas dans le moteur.
5. `PhysicsSystem` ne décide pas de la stratégie IA.
6. `ModeSystem` décide des règles spécifiques au mode, pas du rendu.
7. `TutorialSystem` décide de l'avancement pédagogique, jamais des récompenses compétitives.
8. `Renderer` dessine mais ne décide jamais du score ou des règles.
9. `UiController` gère le DOM mais ne modifie pas directement l'économie ou la sauvegarde.
10. Les achats passent par `MarketService`.
11. Les résultats/récompenses passent par `ProgressionService`.
12. Le réseau passe par `NetworkGateway` ; la Phase 7 pourra remplacer `LocalNetworkGateway` sans réécrire le gameplay.
13. `GameEngine` orchestre les services au lieu de réimplémenter leurs responsabilités.
14. Toute nouvelle logique critique doit être accompagnée d'un test automatisé avant fusion.

## Build et validation

```text
npm test
npm run check
npm run build
npm run smoke
```

GitHub Actions exécute ce pipeline sur `main` et sur les pull requests. Après réussite, `dist/` est conservé dans l'artefact `rift-production-dist`.
