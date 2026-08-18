# RIFT//EXCHANGE — Feuille de route

Dernière mise à jour : 18 août 2026

## Vue d'ensemble

| Phase | Objectif | Statut |
|---|---|---|
| 0 | Stabilisation du prototype | ✅ VALIDÉE |
| 1 | Architecture propre et maintenable | ✅ VALIDÉE |
| 2 | Gameplay et sensations de jeu | ✅ VALIDÉE |
| 3 | Modes, IA et tutoriel | 🔵 PROCHAINE |
| 4 | Vault, loadout, objets et pedigree | ⏳ À FAIRE |
| 5 | Progression, Ranked et saisons | ⏳ À FAIRE |
| 6 | Comptes et backend serveur | ⏳ À FAIRE |
| 7 | Multijoueur réel | ⏳ À FAIRE |
| 8 | Market et Trade joueur-à-joueur | ⏳ À FAIRE |
| 9 | Social et compétitif | ⏳ À FAIRE |
| 10 | Sécurité, anti-cheat et modération | ⏳ À FAIRE |
| 11 | Audio, graphismes, performances et analytics | ⏳ À FAIRE |
| 12 | Alpha, bêta et lancement | ⏳ À FAIRE |

**État actuel : les fondations 0 → 2 sont fermées. La priorité devient la Phase 3.**

---

# Phase 0 — Stabilisation

**Statut : ✅ VALIDÉE** — voir [`PHASE0.md`](PHASE0.md).

Sauvegarde, migration, buts, kickoff, overtime, pause/restart/abandon, résultats, historique, récupération du Core et tests de non-régression sont validés.

---

# Phase 1 — Architecture propre et maintenable

**Statut : ✅ VALIDÉE** — voir [`PHASE1.md`](PHASE1.md) et [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Validé

- [x] Vite + TypeScript strict.
- [x] Point d’entrée `src/main.ts`.
- [x] `GameEngine` séparé du rendu et de l’UI.
- [x] `PhysicsSystem` séparé.
- [x] `AbilitySystem` / `AbilityMath` séparés.
- [x] `AISystem` séparé.
- [x] Entités et règles de buts/overtime séparées.
- [x] État et sauvegarde dans `src/state/`.
- [x] Store observable.
- [x] Catalogue/modes dans `src/data/`.
- [x] `MarketService` pour l’économie.
- [x] `ProgressionService` pour les résultats/progression.
- [x] `NetworkGateway` comme frontière réseau remplaçable.
- [x] `InputManager`, `Sfx`, `Renderer`, `UiController` séparés.
- [x] Ancienne architecture JS supprimée.
- [x] ESLint + Prettier.
- [x] **28/28 tests CI**.
- [x] Typecheck/lint CI.
- [x] Build Vite CI.
- [x] Smoke test `dist/`.
- [x] Artefact production automatique `rift-production-dist`.
- [x] Bundle validé déployé en production.

**Critère de sortie : atteint.**

---

# Phase 2 — Gameplay et sensations

**Statut : ✅ VALIDÉE** — voir [`PHASE2.md`](PHASE2.md).

Validé : accélération/inertie, collisions, sous-étapes physiques, Perfect Dash, PUSH/PULL, Pulse avec falloff, combo Dash + Pulse, Rift Burst, feedback visuel/sonore/haptique, manette, remapping et réglages tactiles.

---

# Phase 3 — Modes, IA et tutoriel

**Statut : 🔵 PROCHAINE**

## Tutoriel

- [ ] Mouvement.
- [ ] Dash et Perfect Dash.
- [ ] PUSH.
- [ ] PULL.
- [ ] Pulse.
- [ ] Rift Burst.
- [ ] Premier duel guidé de 3 à 5 minutes maximum.
- [ ] Possibilité de rejouer/ignorer le tutoriel.

## IA

- [ ] Difficulté Recruit.
- [ ] Difficulté Challenger.
- [ ] Difficulté Elite.
- [ ] Difficulté Riftborn.
- [ ] Profil agressif.
- [ ] Profil défensif.
- [ ] Profil technique.
- [ ] Profil contre-attaque.
- [ ] Utilisation intelligente de PULL.
- [ ] Gestion du Flux/Rift Burst par l’IA.
- [ ] Tests de comportement déterministes sur les décisions critiques.

## Modes

- [ ] RIFT Duel 1v1 classique.
- [ ] Blitz avec vraie règle différenciante.
- [ ] Overcharge.
- [ ] Flux Control.
- [ ] Chaos Rift.
- [ ] Custom Match.
- [ ] Préparer l’architecture Doubles 2v2 pour le futur multijoueur.
- [ ] Préparer le format Tournament.

## Critères de validation

- tutoriel complet sans blocage ;
- 4 difficultés IA réellement distinctes ;
- au moins 3 expériences de jeu qui ne sont pas de simples variantes de chrono ;
- aucune régression Phase 0/1/2 ;
- tests + build + smoke CI verts.

---

# Phase 4 — Vault, Loadout, objets et pedigree

- [ ] Chaque objet devient une instance unique avec UUID permanent.
- [ ] Numéro de série.
- [ ] Date de création.
- [ ] Propriétaire initial et actuel.
- [ ] Nombre de propriétaires.
- [ ] Historique trades/ventes.
- [ ] Matchs/victoires/buts associés à l’objet.
- [ ] Loadout : Frame, Trail, Core Skin, Goal FX, Banner, Title.
- [ ] Tous les cosmétiques équipés visibles en jeu ou profil.
- [ ] Collections saisonnières.
- [ ] 100+ objets avant bêta publique.

---

# Phase 5 — Progression, Ranked et saisons

- [ ] XP, niveaux et récompenses.
- [ ] Missions quotidiennes et hebdomadaires.
- [ ] Achievements, titles et badges.
- [ ] Statistiques détaillées.
- [ ] Ranked totalement séparé du Casual.
- [ ] MMR caché et placements.
- [ ] Bronze → Silver → Gold → Platinum → Diamond → Master → Riftborn.
- [ ] Saisons de 8 à 12 semaines.
- [ ] Reset Ranked partiel.
- [ ] Récompenses saisonnières.

---

# Phase 6 — Comptes et backend serveur

- [ ] Inscription/connexion.
- [ ] Pseudo unique et profil public.
- [ ] Récupération de compte.
- [ ] Synchronisation multi-appareils.
- [ ] Base utilisateurs.
- [ ] Wallet et inventaire serveur.
- [ ] Catalogue et instances d’items serveur.
- [ ] Historique matchs / MMR / missions serveur.
- [ ] Migrations et sauvegardes de base de données.

À partir de cette phase, **le client ne sera plus la source de vérité** pour les crédits, objets ou résultats compétitifs.

---

# Phase 7 — Multijoueur réel

- [ ] Matchmaking 1v1.
- [ ] Serveur autoritaire.
- [ ] Synchronisation joueurs/Core.
- [ ] Client prediction.
- [ ] Server reconciliation.
- [ ] Interpolation.
- [ ] Gestion latence et reconnexion.
- [ ] Abandons/pénalités.
- [ ] Régions serveur.
- [ ] Rematch.
- [ ] Partie privée par code.

---

# Phase 8 — Market et Trade joueur-à-joueur

## Market

- [ ] Listings réels.
- [ ] Transactions atomiques serveur.
- [ ] Historique de prix, moyenne, dernière vente et volume.
- [ ] Watchlist/favoris.
- [ ] Recherche/filtres avancés.
- [ ] Frais de Market et contrôle de l’inflation.

## Trade

- [ ] Session serveur.
- [ ] Objets + NC.
- [ ] Lock de l’offre.
- [ ] Double confirmation.
- [ ] Timer anti-swap.
- [ ] Historique de transaction.
- [ ] Avertissement d’écart de valeur sans bloquer un échange volontaire.

## Rareté

- [ ] Stocks limités garantis côté serveur.
- [ ] Numéros de série uniques à vie.
- [ ] Aucune duplication possible.

---

# Phase 9 — Social et compétitif

- [ ] Amis, invitations et party.
- [ ] Statut en ligne.
- [ ] Profils joueurs.
- [ ] Leaderboards monde/pays/amis.
- [ ] Tournois.
- [ ] Spectateur et replays à terme.

---

# Phase 10 — Sécurité, anti-cheat et modération

- [ ] Validation serveur de tous les résultats.
- [ ] Anti speed-hack / téléportation / manipulation du Core.
- [ ] Protection wallet/inventaire.
- [ ] Détection AFK farming.
- [ ] Rate limiting.
- [ ] Logs d’audit économie.
- [ ] Report, blocage, mute et filtrage pseudos.
- [ ] Sanctions/bans.

---

# Phase 11 — Polish, performances et analytics

## Audio / visuel

- [ ] Musique menu et ambiance arène.
- [ ] Bibliothèque SFX finale.
- [ ] Shaders/failles.
- [ ] Goal explosions.
- [ ] Intro de match et écran MVP/victoire.
- [ ] Plusieurs arènes.

## Performances

- [ ] 60 FPS stable.
- [ ] 120 FPS optionnel.
- [ ] Profils Low / Medium / High.
- [ ] Optimisation chauffe/batterie mobile.
- [ ] Safe areas iPhone/Android.

## Analytics

- [ ] Sessions et matchs/session.
- [ ] Taux de fin du tutoriel.
- [ ] Rétention J1/J7/J30.
- [ ] Modes joués.
- [ ] Économie/trades.
- [ ] Crash/error monitoring.

---

# Phase 12 — Alpha, bêta et lancement

- [ ] Alpha 1 : ~10 joueurs.
- [ ] Alpha 2 : ~50 joueurs.
- [ ] Alpha 3 : ~200 joueurs.
- [ ] Bêta progressive : 1 000+ testeurs.
- [ ] Stress tests serveurs.
- [ ] Validation matchmaking, économie, rétention et sécurité.

Ordre envisagé : **Web/PWA → Windows → iOS/Android → consoles si pertinent.**

---

# Jalons

- **Alpha 0.1 :** gameplay solide + IA + compte + progression + Vault + sauvegarde serveur.
- **Alpha 0.2 :** multijoueur 1v1 + matchmaking + amis + vrai Ranked.
- **Alpha 0.3 :** Market + Trade + objets uniques + séries + pedigree.
- **Beta 1.0 :** contenu, saisons, tournois, économie, sécurité et polish.

# Priorité immédiate

**Phase 3 — Modes, IA et tutoriel.** Les Phases 0, 1 et 2 sont désormais validées ; les prochaines fonctionnalités peuvent être ajoutées sur la nouvelle architecture TypeScript sans revenir à l’ancien monolithe.
