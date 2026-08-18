# Architecture RIFT

```text
src/
├── main.ts                  # composition de l'application
├── data/                    # données statiques, sans logique gameplay
│   ├── catalog.ts
│   └── modes.ts
├── state/                   # sauvegarde + état global
│   ├── defaults.ts
│   ├── storage.ts
│   └── Store.ts
├── types/                   # contrats TypeScript partagés
├── game/
│   ├── GameEngine.ts        # cycle de vie d'un match
│   ├── config.ts            # tuning centralisé
│   ├── abilities/           # Dash / Pulse / Burst
│   ├── entities/            # création Player/Core
│   ├── physics/             # mouvement, collisions, sous-étapes
│   └── rules/               # buts / overtime
├── input/InputManager.ts    # clavier, tactile, Gamepad API
├── audio/Sfx.ts             # audio synthétique + haptique
└── ui/
    ├── UiController.ts      # écrans, HUD, market, réglages
    ├── Renderer.ts          # rendu Canvas
    └── dom.ts               # helpers DOM typés
```

## Règles d'architecture

- Le navigateur ne lit/écrit jamais directement la sauvegarde hors de `state/`.
- Les constantes de gameplay sont centralisées dans `game/config.ts`.
- Les fonctions mathématiques critiques restent pures et testables.
- Les données d'items et de modes ne sont pas définies dans le moteur.
- Le rendu ne décide pas des règles de match.
- L'UI appelle le moteur via des actions explicites.
- Les prochaines briques backend/réseau devront être ajoutées derrière de nouveaux modules plutôt que dans `GameEngine`.
