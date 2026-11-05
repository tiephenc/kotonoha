# KOTONOHA — refontes visuelles

## Mission 8 : carte du Japon en 2D, chemin aux couleurs du site, accueil (5 novembre 2026)

- **Carte du Japon** : carte d'aventure en 2D stylisée, aux couleurs du site de jour comme de nuit. La perspective 3D, la rotation et l'inclinaison sont retirées ; le zoom, le déplacement, « Où suis-je » et « Vue entière » restent. On y voit :
  - des îles en plateau, avec un dessus de mousse et des falaises teintes ;
  - des forêts, des cerisiers, des montagnes et le Fuji enneigé ;
  - des repères près des destinations (torii, pagodes, temples, châteaux, onsen, pins) ;
  - les trajets ouverts lumineux, les autres en pointillé ;
  - la brume qui dérive sur les zones inexplorées ;
  - les destinations en anneaux : dorée et cochée une fois visitée, cerclée de rouge et pulsante si elle est accessible, « ? » si elle est encore inexplorée ;
  - le renard sur la destination actuelle.
  Les étiquettes n'apparaissent qu'au survol, au focus, à la sélection, et là où vous êtes.
- **Le chemin** : le paysage, le bandeau, la brume et les étapes suivent les couleurs du site (écru, mousse, kakishibu et lanternes le jour ; bois sombre, indigo et lanternes la nuit). Le paysage se redessine quand on change d'ambiance.
- **Accueil** : le bloc d'appel est supprimé. « KOTONOHA » tient sur une ligne, entièrement lisible ; le renard est en dessous et flotte doucement (animation coupée par `prefers-reduced-motion`).

## Mission 7 : le chemin, cartes à jouer, ouverture sur grand écran (5 novembre 2026)

- **Le chemin** (`#chemin`, onglet Apprendre) : carte de progression nocturne en pixel art, du N4 au N2, avec une étape par module et un petit voyageur noir. XP de parcours sans double comptage. Détails, architecture et barème : `KOTONOHA_CHEMIN.md`.
- **Étapes de la séance** : les anciens emblèmes deviennent de grandes cartes à jouer inclinées, avec le numéro aux deux coins.
- **Ouverture à 1920 × 800** :
  - le motif de kamon couvre toute la largeur (le calque du motif était limité à la colonne centrale de la grille) ;
  - le renard est décalé pour ne plus masquer le logo ;
  - le bloc d'appel est compact.
- **Sécurité** : les données de la salle lofi (volume, tempo, accords, boucles) sont normalisées avant d'être affichées ou jouées, et un test vérifie qu'une sauvegarde piégée n'injecte rien.

## Mission 6 : salle lofi, carte plus lisible, grand écran (5 novembre 2026)

- **Salle lofi** (`app/lofi.js`) : c'est désormais l'écran principal de Détente (`#detente`).
  - Scène en pixel art : un izakaya perdu dans la campagne.
    - Le décor : rizières en terrasses, montagnes, cèdres, guirlande de lanternes, noren, tonneaux de saké, cheminée qui fume.
    - De jour : nuages et oiseaux. De nuit : étoiles, lucioles, portes éclairées.
    - Pluie en option.
    - Les lanternes battent la mesure quand la musique joue.
  - Atelier de composition : séquenceur de 16 pas.
    - Pistes : mélodie pentatonique sur 8 lignes, accords, basse, grosse caisse, caisse claire, charleston.
    - Accords choisis pour chacune des 4 mesures ; tempo et swing réglables.
    - Pluie et crépitement de vinyle en option, 3 emplacements de sauvegarde.
    - Tout le son est synthétisé par Web Audio ; rien ne démarre sans un geste.
    - La musique, la pluie et le vinyle s'arrêtent quand on quitte la salle.
- **Jeux** (`#detente-jeux`) : un simple hub, sans choix de durée, sans chronomètre ni fin imposée ; « Retour à la séance » reste visible dans chaque jeu.
- **Décor de fond retiré** : le filigrane d'izakaya derrière le site est supprimé (`app/decor.js` retiré). L'ouverture animée KOTO/NOHA est conservée.
- **Carte du Japon plus lisible** (méthodes ui-ux-pro-max et Impeccable) :
  - pleine largeur, panneau d'information et itinéraire en dessous ;
  - contours d'encre plus épais, noms de régions agrandis, repères et étiquettes plus grands ;
  - boutons de caméra de 44 px avec icônes et libellés accessibles.
- **Grand écran** :
  - l'ouverture débordait horizontalement, parce que `100vw` compte la barre de défilement ; la largeur de cette barre est désormais retranchée ;
  - le texte d'appel est posé sur une carte pleine, lisible même par-dessus les lettres ;
  - vérifié à 1920 × 928.
- **Tests** : la vérification du défilement horizontal mesure la mise en page réelle, même quand la page coupe le débordement. Elle a révélé un débordement de l'atelier lofi sur mobile, corrigé.

## Mission 5 : ouverture, décor, carte en relief (5 novembre 2026)

- **Page d'ouverture** (Aujourd'hui), inspirée d'une affiche :
  - champ teint semé de kamon pochoirés ;
  - « KOTO / NOHA » monumental derrière le grand renard d'origine, 言の葉 en vertical ;
  - bandeau de faits réels : séance prévue, cartes dues, unités validées, compte à rebours JLPT, lieu du voyage ;
  - un bouton descend vers la séance du jour.
  Parallaxe au défilement (titre, renard, motif) ; animations coupées par `prefers-reduced-motion`.
- **Décor de fond** (`app/decor.js`) : l'intérieur d'un izakaya en pixel art, dessiné dans un canvas de 320 × 200 agrandi sans lissage, fixe derrière le site, à 6 % d'opacité le jour et 10 % la nuit. On y voit :
  - les poutres, les lanternes et les tablettes du menu ;
  - le noren de l'entrée, les bouteilles, le comptoir et la marmite fumante ;
  - par la fenêtre, le satoyama de jour, le village et la pluie la nuit.
  L'animation tourne à 6 images/s ; elle s'arrête si l'onglet est caché ou si l'utilisateur réduit les animations.
- **Carte du Japon en relief** :
  - le plan incliné en perspective CSS 3D, îles extrudées ;
  - les destinations, le Fuji et les sommets sont des éléments debout qui font toujours face à la caméra (lanterne : accessible, tampon : visitée, cadenas : à débloquer, renard : vous êtes ici) ;
  - des nuages en altitude ;
  - une caméra pilotable : pivoter, incliner, rapprocher, « Où suis-je », « Vue entière » ; glisser pour déplacer, Maj + glisser pour pivoter, molette, flèches du clavier ;
  - une vue 2D au choix, mémorisée ;
  - un bandeau de progression et un itinéraire cliquable qui recentre la caméra.
- **Carte mentale** (carte du parcours) : boutons et gestes de zoom retirés.
- **Accessibilité** : le fond de carte n'est plus masqué aux lecteurs d'écran (les régions y sont activables) ; le bandeau de faits ne s'anime plus en opacité.

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

## Mission 9 : itinéraire unique, éphéméride (5 novembre 2026)

- **Voyager** : la carte à zoom est remplacée par un itinéraire unique, sans zoom. Les 14 étapes se suivent dans l'ordre des points requis, assez espacées pour que rien ne se chevauche (serpentin de trois rangées sur ordinateur, colonne en zigzag sous 700 px). Une étape s'ouvre quand les points sont atteints et que la précédente a été visitée. Dans la ville où l'on se trouve, trois points d'intérêt réels (une phrase factuelle chacun) : s'y arrêter est mémorisé dans `S.x.voyage.poi`, avec un lien de recherche Wikipédia. La silhouette du Japon reste en fond, très atténuée.
- **Culture** : un éphéméride à pages détachables. La première page est le jour même avec le prochain rendez-vous ; « Arracher la page » fait tomber la page (animation désactivée si mouvement réduit) et montre la fête ou coutume suivante. La liste de l'année reste disponible, sources comprises.
- **Kamon** : les vrais blasons remplacent les schémas. 19 dessins viennent de fichiers SVG de Wikimedia Commons (série « Japanese Crest »), formes inchangées, couleurs adaptées au thème jour/nuit, fond carré retiré ; auteur et licence (CC BY-SA 3.0/4.0 ou domaine public) sont cités sur chaque fiche et dans `LICENCES-KAMON.md`. Kikyō, mitsuboshi, takanoha, tsuru et rindō, sans fichier libre fidèle, sont redessinés d'après le motif traditionnel et signalés comme tels. Données des fiches et migration des badges inchangées. Génération : `tools/kamon-art/`.
- Tests : `refonte.spec.js` (crédit des dessins, aucun contenu actif dans les SVG ; itinéraire unique, pas de zoom, arrêt à un point d'intérêt persistant) et `carte-culture.spec.js` (pages arrachées et retour).
