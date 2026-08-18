# Phase 3 — Modes, IA et tutoriel

Statut : **VALIDÉE ✅**

## Tutoriel guidé

Le tutoriel est désormais une vraie séquence jouable en **7 étapes** :

- [x] 01 — Mouvement : déplacement soutenu au clavier, joystick ou manette.
- [x] 02 — Dash : déclenchement réel d'un Dash.
- [x] 03 — PUSH : Pulse utilisé avec la polarité cyan.
- [x] 04 — PULL : changement de polarité puis Pulse d'attraction.
- [x] 05 — Pulse : deuxième utilisation maîtrisée et possibilité de combo Dash + Pulse.
- [x] 06 — Rift Burst : Flux préparé à 100 % puis Burst réel.
- [x] 07 — First Duel : marquer 2 buts contre une IA Recruit.
- [x] Progression du tutoriel sauvegardée.
- [x] Tutoriel terminé mémorisé dans la sauvegarde.
- [x] Les étapes d'entraînement ne consomment pas le chrono d'un vrai match.
- [x] Une défaite au First Duel fait recommencer l'exercice sans ajouter de défaite, récompense ou historique de match.

## Intelligence artificielle

### Difficultés

- [x] **Recruit** — réaction lente, forte imprécision, vitesse réduite, peu de capacités.
- [x] **Challenger** — niveau intermédiaire.
- [x] **Elite** — réaction rapide, meilleure prédiction et utilisation fréquente des capacités.
- [x] **Riftborn** — réaction très rapide, faible erreur, vitesse maximale et utilisation avancée des capacités.

### Profils

- [x] **Agressif** — chasse le Core et pousse haut.
- [x] **Défensif** — reste nettement plus proche de son propre but.
- [x] **Technique** — anticipe la trajectoire et varie son approche.
- [x] **Contre-attaque** — protège davantage quand le Core devient dangereux puis accélère la transition.

### Capacités IA

- [x] Dash.
- [x] Pulse.
- [x] Rift Burst à 100 % Flux.
- [x] Changement intelligent PUSH / PULL pour les profils techniques et contre-attaque.
- [x] Mémoire de réaction indépendante par bot.
- [x] Paramètres IA réglables pour les modes non imposés.
- [x] Ranked impose Elite + Contre-attaque.
- [x] Tournament augmente Challenger → Elite → Riftborn.

## Modes de jeu

### RIFT Ranked

- [x] 1v1 compétitif standard.
- [x] 3:00, premier à 5.
- [x] IA Elite / Contre-attaque dans le prototype local.

### RIFT Duel

- [x] 1v1 standard dédié à la maîtrise mécanique.
- [x] 2:30, premier à 5.

### RIFT Doubles

- [x] **Vrai 2v2 local** dans la physique.
- [x] Joueur + allié IA contre deux IA rivales.
- [x] Les quatre participants ont collisions, Dash/Pulse/Burst et trajectoires indépendantes.
- [x] L'allié adopte un rôle plus défensif et le second rival un rôle agressif.

### RIFT Blitz

- [x] Match 1:30, premier à 3.
- [x] Core nettement plus rapide.
- [x] Joueurs démarrent avec 35 % de Flux.

### Overcharge

- [x] La vitesse maximale du Core augmente continuellement pendant le match.
- [x] Indicateur Overcharge en direct dans le HUD.

### Flux Control

- [x] Zones de contrôle visibles dans l'arène.
- [x] Maintenir le Core dans le camp adverse en restant proche donne des points.
- [x] Un but vaut 2 points.
- [x] Premier à 12 points.

### Chaos Rift

- [x] Mutation environ toutes les 12 secondes.
- [x] `CORE SURGE` — accélération soudaine du Core.
- [x] `FULL FLUX` — tous les joueurs passent à 100 % Flux.
- [x] `POLARITY SHIFT` — inversion générale PUSH/PULL.
- [x] `DASH RESET` — cooldown Dash remis à zéro.
- [x] Événement annoncé visuellement.

### Custom Match

- [x] Durée réglable de 60 à 360 secondes.
- [x] Score cible de 1 à 12.
- [x] Vitesse du Core de 75 % à 160 %.
- [x] Choix 1v1 / 2v2.
- [x] Paramètres sauvegardés.

### Tournament

- [x] Bracket local simulé de 8 participants sur 3 rounds.
- [x] Quart : Challenger.
- [x] Demi : Elite.
- [x] Finale : Riftborn.
- [x] Passage de round sans enregistrer chaque round comme un match séparé.
- [x] Récompense finale uniquement après la fin du parcours.

## Sauvegarde et compatibilité

- [x] `SAVE_VERSION = 3`.
- [x] La clé reste `rift.phase0.save`.
- [x] Les sauvegardes Phase 0/1/2 restent migrables.
- [x] Crédits, inventaire, stats, réglages et historique sont conservés.
- [x] L'ancien mode `quick` est automatiquement migré vers `duel`.
- [x] Difficulté IA, profil IA, règles Custom et progression tutoriel sont persistés.

## Validation automatique

Workflow GitHub Actions :

```text
npm install
    ↓
npm test
    ↓
npm run check
    ↓
npm run build
    ↓
npm run smoke
    ↓
rift-production-dist
```

Résultat final de la Phase 3 :

- **46/46 tests Node réussis** ;
- tests historiques Phase 0, Phase 1 et Phase 2 toujours verts ;
- tests dédiés aux modes, IA, tutoriel et migrations Phase 3 ;
- TypeScript `strict` : ✅ ;
- ESLint : ✅ ;
- build Vite de production : ✅ ;
- smoke test du bundle `dist/` : ✅ ;
- artefact de production généré par GitHub Actions : ✅.

## Critère de sortie

RIFT dispose maintenant d'une boucle d'apprentissage guidée, d'adversaires réellement différenciés et de plusieurs règles de match qui changent le gameplay plutôt que seulement la durée du chrono.

L'équilibrage fin des difficultés et des modes continuera pendant les playtests Alpha, mais la fonctionnalité et l'architecture prévues pour cette phase sont complètes.

**Critère de sortie atteint. Phase 3 VALIDÉE ✅**
