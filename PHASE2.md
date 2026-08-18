# Phase 2 — Gameplay et sensations

Statut : **VALIDÉE ✅**

> Phase réalisée en avance sur la Phase 1. La refonte d'architecture reste à faire séparément ; la Phase 2 valide ici le comportement et le game feel du prototype actuel.

## Mouvement et physique

- [x] Accélération progressive et décélération distincte en mouvement / à l'arrêt.
- [x] Inertie et friction centralisées dans une configuration de gameplay testable.
- [x] Vitesse joueur plafonnée de façon déterministe.
- [x] Collisions joueur/Core renforcées avec impulsion relative et composante tangentielle.
- [x] Rebond du Core avec restitution contrôlée sur les parois.
- [x] Sous-étapes physiques adaptatives pour limiter le tunneling à grande vitesse.
- [x] Vitesse maximale du Core contrôlée et rythme légèrement différencié par mode.
- [x] Protection Phase 0 contre Core invalide / bloqué conservée.

## Dash

- [x] Dash plus puissant, cooldown ramené à une valeur lisible et fenêtre active explicite.
- [x] Trail renforcé pendant le Dash.
- [x] Anneau d'impulsion + particules au déclenchement.
- [x] Feedback sonore synthétique et haptique.
- [x] **Perfect Dash** implémenté sur collision pendant la fenêtre active.
- [x] Perfect Dash : impulsion supplémentaire, Flux bonus, hit-stop, camera shake, flash et feedback visuel.
- [x] Perfect Dash limité à une activation par Dash.

## PUSH / PULL

- [x] Identité PUSH cyan / PULL rose-violet.
- [x] Portée du Pulse visible dans l'arène.
- [x] Falloff de force selon la distance.
- [x] PULL inverse correctement le vecteur d'impulsion.
- [x] Cooldown Pulse visible dans le HUD.
- [x] Combo Dash + Pulse avec bonus de force et de Flux.
- [x] Feedback visuel/sonore/haptique spécifique à la polarité.

## Pulse / Rift Burst

- [x] Pulse avec onde visuelle, particules et portée claire.
- [x] Anti-spam via cooldown centralisé.
- [x] Flux lisible jusqu'à `READY`.
- [x] Rift Burst à 100 % avec forte impulsion radiale.
- [x] Rift Burst : double onde, particules, flash, hit-stop et camera shake.
- [x] Force du Burst décroissante selon la distance.

## Contrôles

- [x] Remapping clavier sauvegardé pour mouvement, Dash, Pulse, Push/Pull, Burst et Pause.
- [x] Flèches conservées comme fallback de déplacement.
- [x] Support Gamepad API.
- [x] Manette : stick gauche, A Dash, X Pulse, B Push/Pull, Y Burst, Start Pause.
- [x] Deadzone manette testée pour éviter le stick drift.
- [x] Sensibilité joystick mobile réglable de 60 % à 150 %.
- [x] Taille des commandes tactiles réglable.
- [x] Écart au bord réglable.
- [x] Layout tactile droitier / gaucher.
- [x] Réglages audio, vibrations et camera shake sauvegardés.

## Feedback et lisibilité

- [x] Audio gameplay synthétique sans dépendance externe.
- [x] Haptique sur Dash, Pulse, Perfect Dash, Burst et but.
- [x] Camera shake désactivable.
- [x] Particules et shockwaves intégrées au moteur de rendu.
- [x] Feedback `PERFECT DASH`, `DASH + PULSE` et `RIFT BURST`.
- [x] HUD Dash / Pulse / Flux / Polarité lisible.
- [x] UI mobile dézoomée et contrôles non superposés.

## Validation automatique

Commande :

```bash
npm test
npm run check
```

Résultat :

- **21/21 tests Node réussis** : 9 tests Phase 0 + 12 tests Phase 2.
- Syntaxe `core.js` et `game.js` validée.
- Migration Phase 0 → Phase 2 testée.
- Réglages personnalisés sauvegardés/rechargés testés.
- Accélération, friction, vitesse max, deadzone, Pulse falloff, Burst falloff, Perfect Dash, sous-étapes et rebond testés.

## Smoke tests navigateur

- [x] Démarrage neuf : 4 200 NC.
- [x] Page Réglages accessible sans erreur JavaScript.
- [x] Sensibilité joystick modifiée à 135 % et reflétée immédiatement.
- [x] Dash remappé sur `ShiftLeft` et déclenché avec la nouvelle touche.
- [x] Pause : chrono gelé.
- [x] Perfect Dash déclenché en conditions de match réelles.
- [x] Mobile paysage : contrôles tactiles visibles, 4 boutons d'action, arène sans zoom excessif.
- [x] Layout gaucher : joystick et boutons effectivement inversés.
- [x] Aucun `pageerror` pendant les smoke tests desktop/mobile.

## Critère de sortie

La mécanique de base possède désormais un skill ceiling identifiable : déplacement précis, Dash timing, Perfect Dash, choix PUSH/PULL, combo Dash + Pulse et gestion du Flux/Burst.

La validation **technique et gameplay du prototype** est atteinte. L'équilibrage fin et la validation subjective de rétention sur plusieurs sessions continueront naturellement pendant les playtests Alpha et ne rouvrent pas cette phase sauf régression majeure.
