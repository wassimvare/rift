# Phase 0 — Stabilisation

Statut cible : **VALIDÉE**

## Critères de validation

- [x] Sauvegarde versionnée unique (`rift.phase0.save`).
- [x] Migration des anciens Nova Credits (`rxCredits`).
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

## Commande de validation

```bash
npm test
```

Tous les tests doivent passer avant de considérer la Phase 0 comme validée.
