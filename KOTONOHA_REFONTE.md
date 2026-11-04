# KOTONOHA — refonte « carnet de voyage » (mission 3)

Réalisée le 4 novembre 2026. Ce document décrit ce qui a changé, comment, et avec quelles limites.

## Direction artistique

- Un carnet de voyage illustré : papier crème, encre sombre, vermillon, indigo, matcha, or. Titres en Shippori Mincho, notes manuscrites en Klee One.
- Moins de gris : texte principal `#1D1A2C` sur `#FCF7EE`. Les contrastes WCAG AA sont vérifiés par axe-core.
- Thème de nuit conservé et redessiné.
- Tout le système visuel est dans `app/theme.css`, chargé en dernier. Le CSS d'origine de `index.html` n'a pas été réécrit.
- Mobile : barre de navigation en bas, sans `backdrop-filter`. Aucun défilement horizontal n'a été mesuré entre 360 et 1 280 px.

## Renard

- `app/fox.js` dessine six poses en SVG : accueil, étude, repos, sommeil, célébration et focus.
- La pose suit le moment de la journée et l'état du Focus.
- Animations discrètes (queue, clignement, respiration, lanterne). Elles sont coupées par `prefers-reduced-motion`.
- Le renard reste à sa place : en-tête, Accueil, Focus, salon de détente. Il ne s'affiche jamais par-dessus le contenu.

## Kamon (à la place des badges)

- 24 fiches dans `app/kamon-data.js`. Chacune donne :
  - le nom japonais et sa lecture ;
  - ce que le blason représente et sa signification ;
  - le contexte historique et un récit ;
  - au moins une source.
- Le texte distingue ce qui est établi, ce qui relève de la tradition et ce qui est une interprétation. Rien n'est attribué sans source.
- Les dessins sont schématiques : ce ne sont pas des reproductions d'armoiries officielles.
- Les conditions d'obtention reposent sur l'activité réelle :
  - première unité ;
  - 3, 7, 30 et 100 jours d'étude ;
  - 100, 1 000 et 5 000 révisions ;
  - modules validés ;
  - examen blanc ;
  - bilans N4, N3 et N2 ;
  - paquet Anki vu en entier ;
  - 100 mots maîtrisés ;
  - fin du voyage.
- Un kamon obtenu apparaît comme un sceau qu'on appose. Sa fiche illustrée s'ouvre depuis `#kamon`.
- **Migration :**
  - `S.g.badges` n'est ni modifié ni supprimé ;
  - chaque ancien badge donne le kamon correspondant, avec la date d'obtention d'origine ;
  - les kamon sont enregistrés dans `S.g.kamon`, sans révélation rétroactive.
- Testé dans `refonte.spec.js` : badges intacts, dates reprises.

## Journal de la semaine

- Il remplace les « soirées d'étude ».
- Sept jours, chacun dans un état parmi : terminée, en cours, repos, reportée, libre, non réalisée.
- Les durées affichées sont le temps actif réel. Les activités du jour sont listées.
- Le repos est présenté comme une étape du voyage, jamais comme un échec.
- Navigation semaine par semaine.

## Voyage au Japon

- Carte illustrée dessinée à partir de coordonnées réelles (projection simple), avec 8 régions et 14 destinations.
- L'itinéraire suit cet ordre : Tokyo, Kamakura, Nikkō, Hakone, Kyoto, Nara, Osaka, Kanazawa, Kumano, Hiroshima, Miyajima, Matsushima, Hakodate, Sapporo.
- Chaque destination propose un récit, un point de culture, un souvenir à collectionner et des sources (Wikipédia japonaise pour l'instant).
- Les trajets se font en train, en bateau, à pied ou par la route. Ils sont animés (renard qui se déplace), et instantanés si les animations sont réduites.
- **Points de voyage :** ils sont recalculés à chaque affichage et jamais stockés. Barème :

  | Activité | Points |
  |---|---|
  | Carte révisée | 1 |
  | Étape d'unité | 5 |
  | Unité comprise | 25 |
  | Unité maîtrisée | 60 |
  | Examen blanc | 40 |
  | Minute active | 1 |
  | Texte écrit | 10 |
  | Conversation | 8 |
  | Lecture personnelle | 5 |
  | Mot étudié | 0,5 |

  La maîtrise pèse donc nettement plus que le simple passage.
- Le détail des points est affiché à côté de la carte. L'interface rappelle que ces points ne mesurent pas le niveau de japonais.
- Rien de pédagogique n'est bloqué par le voyage. Une pause ne fait perdre aucun point.

## Focus

- Panneau de nuit avec des lanternes qui s'allument au fil de la séance, et le renard en pose focus.
- Minuteur personnalisable, pause et reprise.
- Ambiances activables une à une, jamais au démarrage.
- Accès à la salle de détente et bouton « Retour à la séance » (dernière page d'apprentissage).
- Transitions d'entrée et de sortie.

## Leçons

Chaque unité affiche un panneau « Prolonger la leçon » avec :
- l'écoute ;
- un sujet d'écriture tiré des points de l'unité ;
- une conversation du niveau ;
- la lecture ;
- la carte de l'unité ;
- le tracé des kanji.

Les laboratoires sont ainsi reliés aux leçons, tout en restant accessibles séparément.

## Visualisations

- Progrès affiche :
  - les révisions et le temps actif sur 30 jours ;
  - les révisions prévues sur 14 jours ;
  - la maîtrise par niveau ;
  - la réussite par compétence.
- Chaque graphique a un résumé texte. S'il n'y a pas encore de données, c'est écrit.
- La carte du parcours se zoome et se déplace (boutons, molette, glisser, clavier).

## Salle de détente

- 8 expériences, dont 4 nouvelles : étang aux koi, atelier musical, pinceau, ricochets.
- Aucune n'utilise de japonais, ne garde de score ou ne joue de son sans action. Toutes se quittent immédiatement.
- Détails et références dans `KOTONOHA_PAUSES_ET_MINIJEUX.md`.

## Mouvement

- Plusieurs éléments sont animés :
  - la carte qui se déplie ;
  - le train et le bateau en déplacement ;
  - les destinations ouvertes qui brillent ;
  - le kamon apposé comme un sceau ;
  - le renard ;
  - les transitions d'écran.
- Les animations reposent sur `transform` et `opacity`. Tout est désactivé par `prefers-reduced-motion`.

## Données

- Aucune donnée pédagogique n'a été modifiée. `npm run check` confirme des empreintes identiques à la référence prise avant la mission 2.
- Le corpus Anki (11 041 notes, 1 890 identifiants bloqués) n'est pas dans le dépôt. Le code d'import n'a pas été touché.

## Limites connues

- Les dessins (renard, kamon, carte) sont des illustrations SVG faites à la main : simples, pas des œuvres d'illustrateur.
- Les sources des destinations sont surtout Wikipédia japonaise. Des sources institutionnelles (offices de tourisme, musées) seraient préférables.
- Safari réel n'a pas été testé ; WebKit sous Windows reste instable (voir `KOTONOHA_TESTS.md`).
