# Phase 0 — Stabilisation

Statut : **VALIDÉE ✅**

## Critères de validation

- [x] Sauvegarde versionnée unique (`rift.phase0.save`).
- [x] Migration des anciens Nova Credits (`rxCredits`).
- [x] Installation neuve : 4 200 NC + inventaire starter garantis.
- [x] Sauvegarde complète : crédits, shards, inventaire, équipements, XP, niveau, statistiques, réglages, missions, historique.
- [x] Les achats Market persistent après rechargement.
- [x] Détection des buts alignée sur les lignes visibles.
- [x] Fonction pure `isBallInsideGoal()` testée à gauche/droite et hors ouverture.
- [x] Reset de kickoff après chaque but avec mini compte à rebours.
- [x] Overtime en mort subite sur égalité à la fin du temps réglementaire.
- [x] Pause/reprise : le chrono est gelé pendant la pause.
- [x] Quitter : confirmation avant abandon.
- [x] Restart : confirmation, score et chrono remis à zéro sans compter un résultat.
- [x] Écran de résultat : score, récompenses, revanche, retour menu.
- [x] Historique des 50 derniers matchs.
- [x] Protection du Rift Core contre états non numériques et blocage contre les murs.
- [x] Tests Node automatiques.
- [x] Workflow GitHub Actions sur push/PR.
- [x] Smoke test desktop : achat, but, pause, restart, abandon.
- [x] Smoke test mobile paysage : joystick, 4 actions et contrôles de match visibles.
- [x] Smoke test overtime : mort subite, écran de résultat, historique et récupération du Core.

## Résultat de validation

- **9/9 tests Node réussis**.
- Vérification syntaxique de `core.js` et `game.js` réussie.
- Smoke tests UI desktop et mobile réussis sans exception JavaScript.
- Un bug détecté pendant la validation (nouveau joueur à 0 NC) a été corrigé puis couvert par un test de non-régression.

## Commande de validation

```bash
npm test
```

La Phase 0 est désormais fermée. Les prochaines modifications structurelles relèvent de la Phase 1.
