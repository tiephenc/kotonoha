# KOTONOHA — le chemin (carte de progression)

Carte de progression inspirée des « overworld maps » des jeux d'aventure japonais, ajoutée le 5 novembre 2026. Route : `#chemin`, dans l'onglet Apprendre (sous-rubrique « Le chemin »). Code : `app/chemin.js`, styles dans `app/theme.css`.

## 1. Existant (analysé avant de développer)

| Élément | Où | Ce qu'on en tire |
|---|---|---|
| Parcours | `MODULES` (32 modules : 9 N4, 11 N3, 12 N2), `N4`/`N3`/`N2`, `UNITS`, `SYL` dans `index.html` | les étapes de la carte |
| Progression | `S.units[n].done[section]` (une section n'est marquée qu'une fois, `markDone`), `S.units[n].at` (date de validation du test), `S.units[n].best`, `S.units[n].sc` | étapes terminées, historique, XP des leçons |
| Exercices | `S.log` = `[horodatage, unité, compétence, juste]`, tronqué aux 2 000 dernières réponses | XP des exercices réussis |
| Révisions | `S.rh` (cartes révisées par jour) | bonus de régularité |
| Série | `S.g.days` (objectif du jour atteint), `metDay`, `streak()` | récompenses de séries |
| Récompenses | kamon (`app/kamon-data.js`), débloqués notamment par nombre de modules validés | prochaine récompense |
| XP existante | `S.g.xp` via `gainXP()`, comptée à chaque événement | conservée telle quelle, non modifiée |

## 2. Architecture retenue

- **Étapes** : une étape par module (32), regroupées en trois régions : N4 (village au pied des collines), N3 (forêt de bambous et pagode), N2 (sanctuaires, château et mont Fuji).
  - Une étape est **terminée** quand toutes les unités du module sont validées (test réussi).
  - L'étape **en cours** est la première non terminée.
  - Les suivantes sont **verrouillées sur la carte seulement** : les leçons restent toutes accessibles depuis Apprendre, rien de pédagogique n'est bloqué.
- **XP de parcours** : un registre de récompenses à clé unique, dans `KX.local('chemin-xp')`, sur l'appareil et inclus dans l'export. À chaque affichage, le module lit les données réelles et n'ajoute que les clés absentes du registre. Aucune clé ne peut rapporter deux fois, et le total ne baisse jamais (même quand le journal des réponses est tronqué).
  - Section de leçon faite : 10 XP (`s:unité:section`).
  - Test d'unité validé : 40 XP, bilan 100, examen blanc ou diagnostic 150, plus un bonus de 0 à 10 selon le meilleur score au-dessus de 70 % (`t:unité`).
  - Exercice réussi : 1 XP par bonne réponse, plafonné à 20 par unité et par compétence, pour qu'un exercice rejoué ne rapporte pas indéfiniment (`e:unité:compétence:rang`).
  - Révisions régulières : 15 XP par jour avec au moins 10 cartes révisées (`r:jour`).
  - Séries de jours consécutifs (objectif du jour atteint) : 3, 7, 14, 30, 60 et 100 jours rapportent 30, 60, 120, 250, 500 et 1 000 XP, une seule fois chacun (`st:jours`).
- **Niveau** : il faut 100 × N XP pour passer du niveau N au suivant. L'écran affiche :
  - l'XP totale, le niveau et la progression vers le niveau suivant ;
  - le pourcentage du parcours (unités validées sur 210) ;
  - la prochaine récompense : le prochain kamon lié aux modules, sinon la prochaine série.
- **Personnage** : sa position est mémorisée dans `S.x.chemin.at`. S'il est derrière l'étape en cours (une leçon vient d'être terminée), il marche jusqu'à elle à l'ouverture de la carte, puis la position est enregistrée.
- **Rendu** :
  - un canvas en pixel art (320 × 900, agrandi sans lissage) pour le paysage ;
  - des boutons HTML pour les étapes (clavier, lecteurs d'écran, infobulles) ;
  - des couches CSS pour la brume, les lucioles, les pétales, l'eau et les halos ;
  - tout s'arrête avec `prefers-reduced-motion`.
- **Interactions** :
  - étape terminée : historique (unités, dates de validation, meilleurs scores, XP gagnée) ;
  - étape en cours : accès direct à la leçon ;
  - étape verrouillée : non activable, avec une infobulle qui dit ce qui la dévoile ;
  - zoom (boutons), déplacement (glisser, molette, clavier).

## 3. Ce que la carte ne fait pas

- Elle ne remplace ni l'XP existante (`S.g.xp`), ni le voyage au Japon, ni les kamon ; elle s'y ajoute.
- L'XP de parcours mesure l'activité, pas le niveau de japonais (la maîtrise réelle reste dans Maîtrise).
