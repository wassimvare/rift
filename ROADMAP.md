# RIFT//EXCHANGE — Feuille de route

Dernière mise à jour : 18 août 2026

## Vue d'ensemble

| Phase | Objectif | Statut |
|---|---|---|
| 0 | Stabilisation du prototype | ✅ VALIDÉE |
| 1 | Architecture propre et maintenable | ✅ VALIDÉE |
| 2 | Gameplay et sensations de jeu | ✅ VALIDÉE |
| 3 | Modes, IA et tutoriel | ✅ VALIDÉE |
| 4 | Vault, loadout, objets et pedigree | 🔵 PROCHAINE |
| 5 | Progression, Ranked et saisons | ⏳ À FAIRE |
| 6 | Comptes et backend serveur | ⏳ À FAIRE |
| 7 | Multijoueur réel | ⏳ À FAIRE |
| 8 | Market et Trade joueur-à-joueur | ⏳ À FAIRE |
| 9 | Social et compétitif | ⏳ À FAIRE |
| 10 | Sécurité, anti-cheat et modération | ⏳ À FAIRE |
| 11 | Audio, graphismes, performances et analytics | ⏳ À FAIRE |
| 12 | Alpha, bêta et lancement | ⏳ À FAIRE |

**État actuel : les Phases 0 → 3 sont fermées. La priorité devient la Phase 4.**

---

# Phase 0 — Stabilisation

**Statut : ✅ VALIDÉE** — voir [`PHASE0.md`](PHASE0.md).

Sauvegarde, migration, buts, kickoff, overtime, pause/restart/abandon, résultats, historique, récupération du Core et tests de non-régression sont validés.

---

# Phase 1 — Architecture propre et maintenable

**Statut : ✅ VALIDÉE** — voir [`PHASE1.md`](PHASE1.md) et [`ARCHITECTURE.md`](ARCHITECTURE.md).

Validé : Vite, TypeScript strict, moteur/physique/capacités/IA/état/UI/rendu/économie/progression/réseau séparés, ESLint/Prettier, build reproductible, CI et artefact de production.

---

# Phase 2 — Gameplay et sensations

**Statut : ✅ VALIDÉE** — voir [`PHASE2.md`](PHASE2.md).

Validé : accélération/inertie, collisions, sous-étapes physiques, Perfect Dash, PUSH/PULL, Pulse avec falloff, combo Dash + Pulse, Rift Burst, feedback visuel/sonore/haptique, manette, remapping et réglages tactiles.

---

# Phase 3 — Modes, IA et tutoriel

**Statut : ✅ VALIDÉE** — voir [`PHASE3.md`](PHASE3.md).

## Tutoriel

- [x] Mouvement.
- [x] Dash.
- [x] PUSH.
- [x] PULL.
- [x] Pulse.
- [x] Rift Burst.
- [x] Premier duel guidé contre Recruit.
- [x] Progression du tutoriel sauvegardée.
- [x] Échec du duel d'entraînement sans impact sur les vraies statistiques.

## IA

- [x] Recruit.
- [x] Challenger.
- [x] Elite.
- [x] Riftborn.
- [x] Profil agressif.
- [x] Profil défensif.
- [x] Profil technique.
- [x] Profil contre-attaque.
- [x] Utilisation du Dash, Pulse et Rift Burst.
- [x] Gestion dynamique de PUSH/PULL pour les profils avancés.
- [x] Réaction, précision, vitesse et prédiction distinctes par difficulté.

## Modes

- [x] RIFT Ranked.
- [x] RIFT Duel 1v1.
- [x] **RIFT Doubles 2v2 réellement jouable avec quatre participants dans la physique locale.**
- [x] Blitz avec Core plus rapide et Flux initial.
- [x] Overcharge avec accélération progressive du Core.
- [x] Flux Control avec zones et points de contrôle.
- [x] Chaos Rift avec mutations périodiques.
- [x] Custom Match : durée, score, vitesse Core, 1v1/2v2.
- [x] Tournament : 3 rounds Challenger → Elite → Riftborn.

## Validation

- [x] **46/46 tests**.
- [x] Tests historiques Phase 0/1/2 toujours verts.
- [x] TypeScript strict.
- [x] ESLint.
- [x] Build Vite.
- [x] Smoke test `dist/`.
- [x] Artefact de production GitHub Actions.

**Critère de sortie : atteint.**

---

# Phase 4 — Vault, Loadout, objets et pedigree

**Statut : 🔵 PROCHAINE**

Objectif : transformer les cosmétiques actuels en vrais objets de collection persistants, identifiables et équipables.

- [ ] Chaque objet devient une instance unique avec UUID permanent.
- [ ] Numéro de série.
- [ ] Date de création.
- [ ] Propriétaire initial et actuel.
- [ ] Nombre de propriétaires.
- [ ] Historique trades/ventes.
- [ ] Matchs, victoires et buts associés à l'objet.
- [ ] Pedigree visible dans le Vault.
- [ ] Loadout : Frame, Trail, Core Skin, Goal FX, Banner, Title.
- [ ] Tous les cosmétiques équipés réellement visibles en jeu ou sur le profil.
- [ ] Preview avant équipement.
- [ ] Collections thématiques et saisonnières.
- [ ] Raretés visuellement différenciées.
- [ ] 100+ objets avant bêta publique.

## Critères pour valider la Phase 4

- un objet précis conserve son identité et son historique ;
- équipement réellement appliqué en match ;
- aucune duplication d'instance locale pendant les migrations/sauvegardes ;
- Vault utilisable sur desktop et mobile ;
- tests 0 → 4 + build + smoke CI verts.

---

# Phase 5 — Progression, Ranked et saisons

- [ ] XP, niveaux et récompenses.
- [ ] Missions quotidiennes et hebdomadaires.
- [ ] Achievements, Titles et badges.
- [ ] Statistiques détaillées.
- [ ] Ranked totalement séparé du Casual.
- [ ] MMR caché et matchs de placement.
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
- [ ] Catalogue et instances d'items serveur.
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
- [ ] Doubles 2v2 réseau sur la base du mode local validé en Phase 3.

---

# Phase 8 — Market et Trade joueur-à-joueur

## Market

- [ ] Listings réels.
- [ ] Transactions atomiques serveur.
- [ ] Historique de prix, moyenne, dernière vente et volume.
- [ ] Watchlist/favoris.
- [ ] Recherche/filtres avancés.
- [ ] Frais de Market et contrôle de l'inflation.

## Trade

- [ ] Session serveur.
- [ ] Objets + NC.
- [ ] Lock de l'offre.
- [ ] Double confirmation.
- [ ] Timer anti-swap.
- [ ] Historique de transaction.
- [ ] Avertissement d'écart de valeur sans bloquer un échange volontaire.

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
- [ ] Tournois réseau.
- [ ] Spectateur et replays à terme.

---

# Phase 10 — Sécurité, anti-cheat et modération

- [ ] Validation serveur de tous les résultats.
- [ ] Anti speed-hack / téléportation / manipulation du Core.
- [ ] Protection wallet/inventaire.
- [ ] Détection AFK farming.
- [ ] Rate limiting.
- [ ] Logs d'audit économie.
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

**Phase 4 — Vault, Loadout, objets et pedigree.** Les Phases 0, 1, 2 et 3 sont validées ; le gameplay dispose maintenant d'une base stable, de modes distincts, d'un tutoriel et d'une IA suffisamment structurée pour commencer à construire la couche collection.
