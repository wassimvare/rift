# RIFT//EXCHANGE — Feuille de route

Dernière mise à jour : 18 août 2026

## Vue d'ensemble

| Phase | Objectif | Statut |
|---|---|---|
| 0 | Stabilisation du prototype | ✅ VALIDÉE |
| 1 | Architecture propre et maintenable | 🔵 PROCHAINE |
| 2 | Gameplay et sensations de jeu | ⏳ À FAIRE |
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

---

# Phase 0 — Stabilisation

**Statut : ✅ VALIDÉE**

La Phase 0 est fermée. Voir [`PHASE0.md`](PHASE0.md) pour la checklist et les résultats de validation.

Validé :

- sauvegarde versionnée et migration ;
- sauvegarde complète de l'état du joueur ;
- installation neuve correcte ;
- Market persistant ;
- buts fiabilisés ;
- kickoff après but ;
- overtime en mort subite ;
- pause/reprise ;
- restart confirmé ;
- abandon confirmé ;
- écran de résultat et revanche ;
- historique ;
- récupération du Core en état invalide ;
- tests automatiques et CI.

**Critère de sortie : atteint.**

---

# Phase 1 — Architecture propre et maintenable

**Statut : 🔵 PROCHAINE**

Objectif : pouvoir développer RIFT rapidement sans recréer des bugs à chaque modification.

## À faire

- [ ] Passer à une structure de projet moderne avec Vite.
- [ ] Passer le code critique en TypeScript.
- [ ] Séparer le moteur de jeu, l'UI, l'économie, la progression et le réseau.
- [ ] Créer des modules dédiés : `GameEngine`, `Physics`, `Player`, `RiftCore`, `Goals`, `Abilities`, `AI`.
- [ ] Créer un vrai gestionnaire d'état global.
- [ ] Séparer les données d'items du code gameplay.
- [ ] Ajouter ESLint / formatage automatique.
- [ ] Ajouter des tests unitaires par module.
- [ ] Ajouter des tests de smoke build.
- [ ] Garder la sauvegarde Phase 0 compatible après migration.
- [ ] Conserver la jouabilité desktop + mobile.
- [ ] Déploiement automatique de la build après validation CI.

## Critères pour passer Phase 1 en VALIDÉE

- aucun gros fichier monolithique contenant toute la logique ;
- build reproductible avec une commande ;
- tests Phase 0 toujours verts ;
- aucune régression sur sauvegarde, score, overtime et mobile ;
- architecture documentée ;
- production déployable automatiquement.

---

# Phase 2 — Gameplay et sensations

Objectif : rendre le match suffisamment bon pour être rejoué même sans récompense ni Market.

## Mouvement et physique

- [ ] Accélération/décélération plus précise.
- [ ] Inertie et friction équilibrées.
- [ ] Collisions joueur/Core plus satisfaisantes.
- [ ] Rebond du Core cohérent sur toutes les parois.
- [ ] Gestion fiable des collisions à grande vitesse.
- [ ] Réglage du rythme de match.

## Dash

- [ ] Dash plus lisible et plus puissant.
- [ ] Trail et impact visuel.
- [ ] Feedback sonore/haptique.
- [ ] Fenêtre de Perfect Dash à tester.

## PUSH / PULL

- [ ] Identité visuelle cyan/violet claire.
- [ ] Portée visible.
- [ ] Force et falloff équilibrés.
- [ ] Cooldown/ressource lisible.
- [ ] Combos possibles avec Dash et Pulse.

## Pulse / Rift Burst

- [ ] Pulse plus lisible.
- [ ] Burst spectaculaire à 100 % Flux.
- [ ] Effets de caméra et particules.
- [ ] Équilibrage anti-spam.

## Contrôles

- [ ] Remapping clavier.
- [ ] Support manette.
- [ ] Sensibilité joystick mobile.
- [ ] Position/taille des boutons tactiles personnalisables.

## Critère de sortie

Le gameplay doit rester amusant pendant plusieurs matchs successifs sans dépendre du système de récompenses.

---

# Phase 3 — Modes, IA et tutoriel

## Tutoriel

- [ ] Mouvement.
- [ ] Dash.
- [ ] PUSH.
- [ ] PULL.
- [ ] Pulse.
- [ ] Rift Burst.
- [ ] Premier duel guidé.

## IA

- [ ] Recruit.
- [ ] Challenger.
- [ ] Elite.
- [ ] Riftborn.
- [ ] Profils agressif, défensif, technique et contre-attaque.

## Modes

- [ ] RIFT Duel 1v1.
- [ ] Doubles 2v2.
- [ ] Blitz avec vraie règle propre.
- [ ] Overcharge.
- [ ] Flux Control.
- [ ] Chaos Rift.
- [ ] Custom Match.
- [ ] Tournament.

---

# Phase 4 — Vault, Loadout, objets et pedigree

- [ ] Chaque objet devient une instance unique.
- [ ] UUID permanent.
- [ ] Numéro de série.
- [ ] Date de création.
- [ ] Propriétaire initial et actuel.
- [ ] Nombre de propriétaires.
- [ ] Historique des trades/ventes.
- [ ] Matchs, victoires et buts associés à l'objet.
- [ ] Loadout complet : Frame, Trail, Core Skin, Goal FX, Banner, Title.
- [ ] Tous les cosmétiques équipés doivent apparaître réellement en match ou dans le profil.
- [ ] Collections thématiques et saisonnières.
- [ ] 100+ objets avant bêta publique.

---

# Phase 5 — Progression, Ranked et saisons

- [ ] XP et niveaux.
- [ ] Récompenses de niveau.
- [ ] Missions quotidiennes.
- [ ] Missions hebdomadaires.
- [ ] Achievements.
- [ ] Titles et badges.
- [ ] Statistiques détaillées.
- [ ] Séparation complète Ranked / Casual.
- [ ] MMR caché.
- [ ] Bronze → Silver → Gold → Platinum → Diamond → Master → Riftborn.
- [ ] Placement matches.
- [ ] Saisons de 8 à 12 semaines.
- [ ] Reset partiel du Ranked.
- [ ] Récompenses saisonnières exclusives.

---

# Phase 6 — Comptes et backend serveur

- [ ] Inscription et connexion.
- [ ] Pseudo unique.
- [ ] Profil public.
- [ ] Récupération de compte.
- [ ] Synchronisation multi-appareils.
- [ ] Base de données utilisateurs.
- [ ] Wallet serveur.
- [ ] Inventaire serveur.
- [ ] Item catalog / item instances.
- [ ] Match history serveur.
- [ ] Ranked ratings serveur.
- [ ] Missions serveur.
- [ ] Migrations de base de données.
- [ ] Sauvegardes et restauration.

**À partir de cette phase, le client ne doit plus être la source de vérité pour les crédits, objets ou résultats compétitifs.**

---

# Phase 7 — Multijoueur réel

- [ ] Matchmaking 1v1.
- [ ] Serveur autoritaire.
- [ ] Synchronisation du Core et des joueurs.
- [ ] Client prediction.
- [ ] Server reconciliation.
- [ ] Interpolation.
- [ ] Gestion de la latence.
- [ ] Reconnexion.
- [ ] Abandons et pénalités.
- [ ] Région serveur automatique.
- [ ] Rematch.
- [ ] Partie privée par code.

---

# Phase 8 — Market et Trade joueur-à-joueur

## Market

- [ ] Listings réels.
- [ ] Achat/vente atomique côté serveur.
- [ ] Historique de prix.
- [ ] Prix moyen.
- [ ] Dernière vente.
- [ ] Volume.
- [ ] Watchlist/favoris.
- [ ] Recherche et filtres avancés.
- [ ] Frais de Market pour contrôler l'inflation.

## Trade

- [ ] Session de trade serveur.
- [ ] Objets + NC dans l'offre.
- [ ] Lock de l'offre.
- [ ] Double confirmation.
- [ ] Timer anti-swap.
- [ ] Historique de transaction.
- [ ] Avertissement en cas d'écart de valeur important sans bloquer le trade.

## Rareté

- [ ] Stocks limités réellement garantis.
- [ ] Numéros de série uniques à vie.
- [ ] Aucune duplication possible.

---

# Phase 9 — Social et compétitif

- [ ] Liste d'amis.
- [ ] Invitations.
- [ ] Party.
- [ ] Statut en ligne.
- [ ] Profil joueur.
- [ ] Leaderboard mondial.
- [ ] Leaderboard pays.
- [ ] Leaderboard amis.
- [ ] Tournois.
- [ ] Spectateur à terme.
- [ ] Replays à terme.

---

# Phase 10 — Sécurité, anti-cheat et modération

- [ ] Validation serveur de tous les résultats.
- [ ] Protection contre speed hack / téléportation / modification du Core.
- [ ] Protection crédits et inventaire.
- [ ] Détection d'AFK farming.
- [ ] Rate limiting.
- [ ] Logs d'audit économie.
- [ ] Report joueur.
- [ ] Blocage / mute.
- [ ] Filtrage des pseudos.
- [ ] Sanctions et bans.

---

# Phase 11 — Polish, performances et analytics

## Audio

- [ ] Musique menu.
- [ ] Ambiance arène.
- [ ] Sons Dash/Pulse/PUSH/PULL/Burst.
- [ ] But/victoire/défaite.
- [ ] Son de drop par rareté.

## Visuel

- [ ] Shaders et failles.
- [ ] Particules.
- [ ] Goal explosions.
- [ ] Camera shake réglable.
- [ ] Intro de match.
- [ ] MVP/victoire.
- [ ] Plusieurs arènes.

## Performances

- [ ] 60 FPS cible stable.
- [ ] 120 FPS optionnel sur appareils compatibles.
- [ ] Profils Low / Medium / High.
- [ ] Optimisation chauffe/batterie mobile.
- [ ] Safe areas iPhone/Android.

## Analytics

- [ ] Sessions.
- [ ] Matchs/session.
- [ ] Taux de fin de tutoriel.
- [ ] Rétention J1/J7/J30.
- [ ] Modes joués.
- [ ] Économie et trades.
- [ ] Crash/error monitoring.

---

# Phase 12 — Alpha, bêta et lancement

## Alpha privée

- [ ] Alpha 1 : ~10 joueurs.
- [ ] Alpha 2 : ~50 joueurs.
- [ ] Alpha 3 : ~200 joueurs.
- [ ] Correction des bugs bloquants avant chaque montée en charge.

## Bêta

- [ ] 1 000+ testeurs progressivement.
- [ ] Stress test serveurs.
- [ ] Validation matchmaking.
- [ ] Validation économie.
- [ ] Validation rétention.
- [ ] Audit sécurité.

## Lancement

Ordre envisagé :

1. Web/PWA.
2. Windows.
3. iOS / Android.
4. Consoles seulement si le jeu justifie l'investissement.

---

# Jalons principaux

### Alpha 0.1

Gameplay solide + IA + compte + progression + Vault + sauvegarde serveur.

### Alpha 0.2

Multijoueur 1v1 + matchmaking + amis + Ranked réel.

### Alpha 0.3

Market + Trade + objets uniques + numéros de série + pedigree.

### Beta 1.0

Contenu, saisons, tournois, économie équilibrée, sécurité et polish suffisants pour une audience plus large.

---

# Priorité immédiate

**Phase 1 — Architecture.**

Aucune nouvelle grosse fonctionnalité ne doit être ajoutée avant que la base de code soit suffisamment propre pour supporter le multijoueur, le backend et l'économie sans multiplier les régressions.
