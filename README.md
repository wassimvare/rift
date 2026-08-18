# RIFT//EXCHANGE

Prototype jouable d'un jeu d'arène 1v1 mêlant gameplay compétitif, collection d'objets et économie.

## Roadmap

**Phase 0 — Stabilisation : VALIDÉE ✅**

**Phase 1 — Architecture propre et maintenable : PROCHAINE 🔵**

La feuille de route complète est maintenant suivie dans [`ROADMAP.md`](ROADMAP.md).

La Phase 0 couvre la sauvegarde complète, la fiabilité des buts, l'overtime, les états de match, pause/restart/abandon, résultats, revanche, historique et tests de non-régression.

Voir également [`PHASE0.md`](PHASE0.md) pour la checklist détaillée de validation.

## Jouer

Build web :

https://rift-playable-preview.vercel.app

Sur mobile, lance un match puis tourne le téléphone en paysage.

### Commandes PC

- WASD / flèches : déplacement
- E : Pulse
- Q : PUSH / PULL
- F : Rift Burst
- Espace : Dash
- P / Échap : pause / reprise

### Commandes mobile

- Joystick gauche : déplacement
- PULSE
- DASH
- PUSH/PULL
- RIFT BURST
- Boutons PAUSE / RESTART / QUITTER dans l'arène

## Modes

- RIFT Ranked — 3:00, premier à 5 buts
- Quick Duel — 2:30, premier à 4 buts
- RIFT Blitz — 1:30, premier à 3 buts

## Tests

```bash
npm test
```

Les tests couvrent notamment la sauvegarde/migration, une installation neuve, les buts gauche/droite, l'overtime, la mise à jour des statistiques et la limite d'historique.

## Structure actuelle

- `index.html` — interface et arène
- `game.js` — gameplay et états de match
- `core.js` — logique critique testable (save, buts, résultats)
- `tests/phase0.test.js` — tests automatiques
- `PHASE0.md` — validation de la Phase 0
- `ROADMAP.md` — feuille de route complète du projet

RIFT reste un prototype local : le Market et l'inventaire ne sont pas encore côté serveur, et le multijoueur réel viendra dans les phases suivantes.
