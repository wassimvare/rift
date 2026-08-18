# RIFT//EXCHANGE — Feuille de route

Dernière mise à jour : 18 août 2026

## Vue d'ensemble

| Phase | Objectif | Statut |
|---|---|---|
| 0 | Stabilisation du prototype | ✅ VALIDÉE |
| 1 | Architecture propre et maintenable | 🔵 PROCHAINE |
| 2 | Gameplay et sensations de jeu | ✅ VALIDÉE |
| 3 | Modes, IA et tutoriel | ⏳ À FAIRE |
| 4 | Vault, loadout, objets et pedigree | ⏳ À FAIRE |
| 5 | Progression, Ranked et saisons | ⏳ À FAIRE |
| 6 | Comptes et backend serveur | ⏳ À FAIRE |
| 7 | Multijoueur réel | ⏳ À FAIRE |
| 8 | Market et Trade joueur-à-joueur | ⏳ À FAIRE |
| 9 | Social et compétitif | ⏳ À FAIRE |
| 10 | Sécurité, anti-cheat et modération | ⏳ À FAIRE |
| 11 | Audio, graphismes, performances et analytics | ⏳ À FAIRE |
| 12 | Alpha, bêta et lancement | ⏳ À FAIRE |

> La Phase 2 a été réalisée en avance. La **priorité immédiate reste la Phase 1** afin de rendre le code maintenable avant d'ajouter le backend et le multijoueur.

---

# Phase 0 — Stabilisation

**Statut : ✅ VALIDÉE** — voir [`PHASE0.md`](PHASE0.md).

Validé : sauvegarde versionnée, migration, installation neuve, Market persistant, buts, kickoff, overtime, pause/restart/abandon, écran de résultat, revanche, historique, récupération du Core et tests automatiques.

---

# Phase 1 — Architecture propre et maintenable

**Statut : 🔵 PROCHAINE**

Objectif : pouvoir développer RIFT rapidement sans recréer de régressions.

- [ ] Passer à Vite.
- [ ] Passer le code critique en TypeScript.
- [ ] Séparer moteur de jeu, UI, économie, progression et réseau.
- [ ] Modules dédiés : `GameEngine`, `Physics`, `Player`, `RiftCore`, `Goals`, `Abilities`, `AI`.
- [ ] Gestionnaire d'état global.
- [ ] Données d'items séparées du gameplay.
- [ ] ESLint / formatage.
- [ ] Tests unitaires par module et smoke build.
- [ ] Compatibilité sauvegarde Phase 0/2.
- [ ] Jouabilité desktop + mobile conservée.
- [ ] Déploiement automatique après CI.

**Critère de sortie :** plus de gros fichier monolithique, build reproductible, tests 0/2 verts, architecture documentée et production déployable automatiquement.

---

# Phase 2 — Gameplay et sensations

**Statut : ✅ VALIDÉE** — voir [`PHASE2.md`](PHASE2.md).

## Mouvement / physique

- [x] Accélération et décélération précises.
- [x] Inertie/friction centralisées et testées.
- [x] Collisions joueur/Core renforcées.
- [x] Rebond cohérent sur les parois.
- [x] Sous-étapes physiques pour les grandes vitesses.
- [x] Rythme du Core ajusté par mode.

## Dash

- [x] Dash plus lisible et puissant.
- [x] Trail, onde et particules.
- [x] Feedback sonore/haptique.
- [x] Perfect Dash fonctionnel, limité à une activation par Dash.

## PUSH / PULL

- [x] Identité cyan / rose-violet.
- [x] Portée visible.
- [x] Falloff selon distance.
- [x] Cooldown Pulse visible.
- [x] Combo Dash + Pulse.

## Pulse / Rift Burst

- [x] Pulse plus lisible et anti-spam.
- [x] Burst à 100 % Flux avec impulsion, hit-stop, flash, shake et particules.
- [x] Force du Burst dépendante de la distance.

## Contrôles

- [x] Remapping clavier sauvegardé.
- [x] Support manette Gamepad API.
- [x] Deadzone manette.
- [x] Sensibilité joystick mobile.
- [x] Taille et position tactile réglables.
- [x] Layout droitier/gaucher.
- [x] Audio, haptique et camera shake configurables.

**Validation : 21/21 tests Node + smoke tests desktop/mobile sans erreur JavaScript.**

---

# Phase 3 — Modes, IA et tutoriel

## Tutoriel
- [ ] Mouvement, Dash, PUSH, PULL, Pulse, Rift Burst.
- [ ] Premier duel guidé.

## IA
- [ ] Difficultés Recruit / Challenger / Elite / Riftborn.
- [ ] Profils agressif, défensif, technique, contre-attaque.
- [ ] Utilisation intelligente de PULL et du Burst.

## Modes
- [ ] RIFT Duel 1v1.
- [ ] Doubles 2v2.
- [ ] Blitz avec règle propre.
- [ ] Overcharge.
- [ ] Flux Control.
- [ ] Chaos Rift.
- [ ] Custom Match.
- [ ] Tournament.

---

# Phase 4 — Vault, Loadout, objets et pedigree

- [ ] Instance unique par objet avec UUID permanent.
- [ ] Numéro de série, date de création, propriétaire initial/actuel.
- [ ] Nombre de propriétaires et historique trades/ventes.
- [ ] Matchs/victoires/buts associés à l'objet.
- [ ] Loadout : Frame, Trail, Core Skin, Goal FX, Banner, Title.
- [ ] Tous les cosmétiques équipés réellement visibles.
- [ ] Collections saisonnières.
- [ ] 100+ objets avant bêta publique.

---

# Phase 5 — Progression, Ranked et saisons

- [ ] XP, niveaux et récompenses.
- [ ] Missions quotidiennes/hebdomadaires.
- [ ] Achievements, titles, badges, statistiques.
- [ ] Ranked séparé du Casual.
- [ ] MMR caché et placements.
- [ ] Bronze → Silver → Gold → Platinum → Diamond → Master → Riftborn.
- [ ] Saisons de 8 à 12 semaines et reset partiel.
- [ ] Récompenses saisonnières.

---

# Phase 6 — Comptes et backend serveur

- [ ] Inscription/connexion, pseudo unique, profil, récupération.
- [ ] Synchronisation multi-appareils.
- [ ] Base utilisateurs, wallet, inventaire, item instances.
- [ ] Historique matchs et MMR serveur.
- [ ] Missions serveur, migrations, sauvegardes/restauration.

À partir d'ici, **le client ne doit plus être la source de vérité** pour crédits, objets ou résultats compétitifs.

---

# Phase 7 — Multijoueur réel

- [ ] Matchmaking 1v1 et serveur autoritaire.
- [ ] Synchronisation joueurs/Core.
- [ ] Client prediction, reconciliation et interpolation.
- [ ] Gestion latence/reconnexion.
- [ ] Abandons/pénalités et régions serveur.
- [ ] Rematch et partie privée par code.

---

# Phase 8 — Market et Trade joueur-à-joueur

## Market
- [ ] Listings réels et transactions atomiques serveur.
- [ ] Historique prix, moyenne, dernière vente, volume.
- [ ] Watchlist, recherche/filtres et frais de Market.

## Trade
- [ ] Session serveur, objets + NC, lock, double confirmation, timer anti-swap.
- [ ] Historique transaction et avertissement d'écart de valeur.

## Rareté
- [ ] Stocks limités garantis.
- [ ] Séries uniques à vie, aucune duplication.

---

# Phase 9 — Social et compétitif

- [ ] Amis, invitations, party, présence.
- [ ] Profils et leaderboards monde/pays/amis.
- [ ] Tournois.
- [ ] Spectateur et replays à terme.

---

# Phase 10 — Sécurité, anti-cheat et modération

- [ ] Validation serveur des résultats.
- [ ] Anti speed-hack/téléportation/Core hack.
- [ ] Protection wallet/inventaire.
- [ ] Détection AFK farming et rate limiting.
- [ ] Logs d'audit économie.
- [ ] Report, blocage, mute, filtrage pseudos, sanctions/bans.

---

# Phase 11 — Polish, performances et analytics

## Audio / visuel
- [ ] Musique menu et ambiance arène.
- [ ] Bibliothèque SFX finale.
- [ ] Shaders/failles, Goal FX, intro, MVP/victoire, plusieurs arènes.

## Performances
- [ ] 60 FPS stable, 120 FPS optionnel.
- [ ] Profils Low/Medium/High.
- [ ] Optimisation chauffe/batterie et safe areas mobiles.

## Analytics
- [ ] Sessions, matchs/session, tutoriel, rétention J1/J7/J30.
- [ ] Modes, économie/trades et crash monitoring.

---

# Phase 12 — Alpha, bêta et lancement

- [ ] Alpha 1 ~10 joueurs.
- [ ] Alpha 2 ~50 joueurs.
- [ ] Alpha 3 ~200 joueurs.
- [ ] Bêta progressive 1 000+ testeurs.
- [ ] Stress tests, matchmaking, économie, rétention, sécurité.

Ordre envisagé : **Web/PWA → Windows → iOS/Android → consoles si pertinent.**

---

# Jalons

- **Alpha 0.1 :** gameplay solide + IA + compte + progression + Vault + sauvegarde serveur.
- **Alpha 0.2 :** multijoueur 1v1 + matchmaking + amis + vrai Ranked.
- **Alpha 0.3 :** Market + Trade + objets uniques + séries + pedigree.
- **Beta 1.0 :** contenu, saisons, tournois, économie, sécurité et polish.

# Priorité immédiate

**Phase 1 — Architecture.** La Phase 2 est validée en avance ; aucune autre grosse fonctionnalité ne doit être empilée avant la refonte structurelle.
