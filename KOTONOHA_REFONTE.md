# KOTONOHA — refontes visuelles

## Mission 4 : l'izakaya de campagne (5 novembre 2026)

Cette refonte remplace la direction « carnet de voyage » ci-dessous. Les données (voyage, kamon, journal) et les fonctions sont conservées ; seuls l'habillage, la navigation et l'accueil changent.

### Direction artistique

- Un vieil izakaya de campagne (kominka, satoyama), traduit en langage graphique et non en décor : la **teinture au pochoir des noren** (katazome). Aplats teints, filets blancs réservés, motif pochoir de feuilles de « kotonoha » et de crosses de fougère.
- **Jour** : coton écru, bois clair, vert mousse, kakishibu (brun-orangé). **Nuit** : bois sombre, toile indigo, lanternes ambrées, rouge profond. Le même établissement à deux moments, pas un simple thème clair ou sombre.
- Le mode « Selon l'heure » passe à la nuit de 19 h à 7 h. La lanterne de l'en-tête force jour ou nuit.
- Typographie :
  - Dela Gothic One pour les grands caractères japonais ;
  - Anton pour les titres latins monumentaux ;
  - Shippori Mincho pour les titres ;
  - Zen Kaku Gothic New pour le texte.
- Tout est dans `app/theme.css` (jetons en tête, puis composants). Choix enregistré dans `PRODUCT.md` et `.impeccable/surfaces/index-html.md`.

### Navigation

- Six onglets : Aujourd'hui, Apprendre, Pratiquer, Voyager, Détente, Profil. L'onglet courant est un pan de noren qui pend de la poutre de l'en-tête. Sur mobile, les onglets forment une barre de tissu teint en bas de l'écran.
- Chaque onglet regroupe des écrans existants, rappelés par une bande de sous-rubriques en tête d'écran. Toutes les anciennes adresses fonctionnent (`#revision`, `#progres`, `#unite-12/…`).
- Un grand caractère d'onglet (今日, 学ぶ, 練習, 旅, 憩い, 私), coupé par le bord, signe chaque espace (décoratif, masqué aux lecteurs d'écran).

### Aujourd'hui : la séance de 4 heures

- La première vue est la séance, en trois pans de noren :
  - Réviser ;
  - Avancer (sections du parcours enchaînées) ;
  - Défi et pratique.
- Chaque pan reprend l'ancien emblème d'étape (`hanaArt` d'origine), son contenu, sa durée, l'avancement réel et un accès direct. L'étape en cours est relevée.
- **Durée réglable** : 2 à 6 h, 4 h par défaut. Une pause de 10 min toutes les 50 min de travail.
- Les durées sont figées pour la journée au premier affichage. Quand toutes les sections prévues sont faites, la liste se prolonge avec les suivantes.
- Une **frise** pose les étapes et les pauses bout à bout. Les durées, alignées à droite, totalisent exactement la séance. Un repère indique où l'on en est, d'après le temps actif mesuré.
- Le bouton « Lancer un bloc de 50 min » ouvre le Focus. « Reprendre » renvoie à la dernière activité d'apprentissage (mémorisée 20 h).
- Sous la séance : une lisière de jardin en trois couches SVG (collines, cèdres, fougères, lanterne de pierre allumée la nuit) avec une parallaxe légère, puis les recommandations, le voyage et le journal de la semaine.

### Renard

- Retour au dessin d'origine : masque géométrique crème, flamme et marques vermillon, col à vagues seigaiha.
- Six poses : accueil, étude (pinceau), focus (lanterne), repos (thé), sommeil, célébration. Seuls changent le regard, l'inclinaison et l'objet.
- Animations discrètes (respiration, oreille, clignement, lanterne), coupées par `prefers-reduced-motion`.

### Espaces

- **Focus** : salle du soir (bois sombre, bandeau de noren indigo, lueur de lanterne), avec le renard en pose focus, y compris avant le premier bloc.
- **Voyager** : carte ancienne, terres sur washi à l'encre, mer en lavis ; noms de régions en grands caractères vermillon.
- **Kamon** : chaque kamon obtenu est un sceau réservé en blanc sur un carré de tissu teint ; les kamon à découvrir sont en pointillés.
- **Détente** : jardin moussu, bandeau de feuilles, cartes unies.

### Mouvement

- Plusieurs mouvements :
  - les pans se déroulent à l'arrivée et ondulent au survol ;
  - l'onglet courant se déplie ;
  - transitions d'onglets (View Transitions, quand le navigateur les connaît) ;
  - apparitions au défilement (`animation-timeline: view()` là où c'est pris en charge) ;
  - parallaxe du jardin ;
  - bascule jour/nuit en fondu.
- Tout est coupé par `prefers-reduced-motion`. Les animations utilisent `transform` et `opacity`.

### Corrections découvertes en route

- De nuit, le texte des cartes de révision était sombre sur fond sombre (`--washi-ink`) : corrigé.
- Contrastes du rouge de nuit relevés ; boutons de compte du Profil (rôles d'onglet) et listes de réglages sans libellé : corrigés.

---

## Mission 3 : carnet de voyage (4 novembre 2026)

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
