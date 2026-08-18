# RIFT//EXCHANGE

Prototype jouable d'un jeu d'arène 1v1 mêlant gameplay compétitif, collection d'objets et économie.

## État du projet

- **Phase 0 — Stabilisation : ✅ VALIDÉE**
- **Phase 2 — Gameplay & sensations : ✅ VALIDÉE**
- **Phase 1 — Architecture : 🔵 PROCHAINE**

La Phase 2 a été réalisée en avance : mouvement retravaillé, collisions renforcées, Perfect Dash, PUSH/PULL avec falloff, Pulse lisible, Rift Burst amélioré, support manette et réglages tactiles/clavier.

Voir [`ROADMAP.md`](ROADMAP.md), [`PHASE0.md`](PHASE0.md) et [`PHASE2.md`](PHASE2.md).

## Jouer

Build web : https://rift-playable-preview.vercel.app

Sur mobile, lance un match puis tourne le téléphone en paysage.

### Commandes PC par défaut

- WASD / flèches : déplacement
- E : Pulse
- Q : PUSH / PULL
- F : Rift Burst
- Espace : Dash
- P / Échap : pause

Toutes les touches principales peuvent maintenant être remappées dans **Réglages**.

### Manette

- Stick gauche : déplacement
- A : Dash
- X : Pulse
- B : PUSH / PULL
- Y : Rift Burst
- Start : Pause

### Mobile

- Joystick gauche + 4 actions tactiles
- Sensibilité, taille, position et layout droitier/gaucher configurables

## Modes

- RIFT Ranked — 3:00, premier à 5 buts
- Quick Duel — 2:30, premier à 4 buts
- RIFT Blitz — 1:30, premier à 3 buts

## Validation

```bash
npm test
npm run check
```

État actuel : **21/21 tests Node réussis**, incluant les 9 tests de stabilisation Phase 0 et 12 tests gameplay Phase 2.

## Structure actuelle

- `index.html` — interface, arène et réglages
- `game/phase2-a.js` → `phase2-d.js` — gameplay et rendu Phase 2, chargés dans l’ordre
- `game.js` — note de compatibilité vers le nouveau découpage
- `core.js` — logique pure testable, sauvegarde et paramètres gameplay
- `tests/phase0.test.js` — non-régression Phase 0
- `tests/phase2.test.js` — gameplay Phase 2

La refonte d'architecture TypeScript/Vite reste la prochaine priorité avant backend et multijoueur.
