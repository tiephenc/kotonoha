# KOTONOHA — architecture

État au 5 novembre 2026, après la mission 4 (refonte « izakaya », détaillée dans `KOTONOHA_REFONTE.md`).

## Vue d'ensemble

```
index.html            site complet (HTML, CSS, script classique, données pédagogiques) ~5,7 Mo
app/plus.css          styles des espaces complémentaires (+ correctifs de contraste du thème clair)
app/plus.js           noyau KX : registre de vues, crochets de rendu (KX.on, KX.onMatch), stockage local, KX.panzoom, utilitaires
app/theme.css         système visuel izakaya (chargé en dernier) : jetons jour/nuit, onglets en noren, séance, renard, espaces, mouvement
app/shell.js          coque : six onglets, sous-rubriques, ambiance selon l'heure et lanterne, reprise, transitions et parallaxe
app/fox.js           renard d'origine en six poses (KX.fox), remplace window.kitsune
app/home.js          Aujourd'hui : séance de 4 h (KX.seance), frise, jardin ; journal de la semaine (remplace heat et viewTodayAffiche)
app/kamon-data.js    24 fiches de kamon (dessins, textes, sources) — données rédigées
app/kamon.js         collection, migration des badges, révélation en sceau (remplace checkBadges et badgeGrid)
app/voyage-data.js   régions, destinations, trajets (coordonnées réelles projetées) — données rédigées
app/voyage.js        carte du Japon, points de voyage, trajets animés, souvenirs
app/focus.js         habillage du Focus (lanternes, retour à la séance), autour de focOpen/focClose/focRender
app/lecons.js        panneau « Prolonger la leçon » dans chaque unité
app/visu.js          visualisations de Progrès
app/jeux.js          quatre expériences de détente (étang, musique, pinceau, ricochets)
app/temps.js          temps actif, calendrier adaptatif, maîtrise
app/detente.js        salle de détente, registre des expériences, son (KX.detAudio)
app/lecture.js        espace Lire (textes du parcours, lectures personnelles, actualités)
app/atelier-data.js   contenus de l'atelier (sujets, scénarios) — données rédigées
app/atelier.js        rédaction et conversation
app/carte.js          carte du parcours
app/culture.js        calendrier culturel (les kamon sont passés dans app/kamon.js)
app/carnet.js         carnet personnel
sw.js                 service worker (hors connexion)
manifest.webmanifest, icon-*.png, sons/, vendor/sql-wasm.*   inchangés
firebase/, supabase/  règles de sécurité des comptes (inchangées)
tools/                serve.mjs, check.mjs, data-integrity.mjs (+ data-baseline.json)
tests/                tests Playwright (outils de développement, non chargés par le site)
```

`index.html` reste la source principale. Le README le décrivait comme « généré » (`build.py`, mentionné dans le code), mais aucun générateur n'existe dans le dépôt ni sur la machine. **Il est donc désormais modifié directement.** Si le générateur réapparaît, il faudra y reporter les modifications listées plus bas.

## Principe d'extension

Les nouvelles fonctionnalités vivent dans `app/*.js`, des scripts classiques chargés après le script principal. Ils ont accès à ses variables globales (`S`, `UNITS`, `save`, `esc`, `ruby`, `rubyW`, `dic`, `wordPop`…).

Le routeur de `index.html` (`route()`) délègue aux modules :
- `KX.view({ name, match(h), render(el, h), nav, title })` déclare un écran. Le routeur crée `<section id="v-x-NAME">` et y appelle `render`. `nav` choisit l'onglet surligné.
- `KX.on(ecran, fn)` est appelé après le rendu d'un écran existant (`entrainer`, `progres`, `aujourdhui`) pour y ajouter des tuiles (`KX.tile`).

- `KX.onMatch(regex, fn)` fait de même pour les écrans à paramètre (`unite-56`).
- `app/shell.js` enveloppe `KX.after` : après chaque rendu, il allume l'onglet (`tabOf`), ajoute la bande de sous-rubriques et mémorise la dernière activité. La navigation de `index.html` ne contient plus que les six onglets (`data-tab`).
- `themeOf` est remplacé : « auto » suit l'heure locale (nuit de 19 h à 7 h).
- Quelques fonctions globales du script principal sont remplacées par les modules (même nom, même rôle) : `kitsune`, `checkBadges`, `badgeGrid`, `heat`, `viewTodayAffiche`. `focOpen`, `focClose` et `focRender` sont enveloppées.

Ainsi les modifications de `index.html` restent minimes et localisées (refonte : une ligne de police et les balises `<link>`/`<script>` des nouveaux modules).

## Données

| Donnée | Où | Synchronisée (Firebase/Supabase) | Export |
|---|---|---|---|
| Progression existante (`S.units`, `S.srs`, `S.g`, `S.core`…) | `localStorage['kotonoha.progress.v1']` | oui | oui |
| Petites données nouvelles (`S.x` : temps actif, plan, calendrier, pauses ; `S.hes`) | même objet `S` | oui | oui |
| Mesures d'hésitation par carte (`S.srs[id].t`, `.hz`) | `S.srs` | **non** (le format compact des fragments Firestore ne les transporte pas) | oui |
| Textes longs (lectures, rédactions, brouillons, conversations, ressentis) | `localStorage['kotonoha.plus.v1']` via `KX.local` | non (sur l'appareil) | oui (`plus` dans le fichier d'export, fusion prudente à l'import) |
| Kamon obtenus (`S.g.kamon` : identifiant → date ; `S.g.kamonInit`) | `S.g` | oui | oui |
| Voyage (`S.x.voyage` : lieu actuel, lieux visités) | `S.x` | oui | oui |
| Séance du jour (`S.x.sess` : durée choisie, plan figé du jour) et dernière activité (`S.x.last`) | `S.x` | oui | oui |
| Préférences d'affichage (durée de pause, mode de conversation…) | `localStorage['kotonoha.detente.*']`, `kotonoha.atelier.*` | non | non |
| Corpus Anki importé | IndexedDB / `CORE`, `ANKID` (vides dans la version publique) | selon le code existant | inchangé |

Les points de voyage ne sont pas stockés : ils sont recalculés à partir des données existantes (révisions, étapes d'unités, maîtrise, examens, temps actif, écrits, conversations, lectures). Les anciens badges (`S.g.badges`) ne sont jamais modifiés par la migration vers les kamon.

Toutes les données importées ou synchronisées passent par `normTypes()` (dans `normState()`) : les champs numériques sont convertis en nombres. Rien n'est supprimé.

## Modifications apportées à `index.html` (103 lignes)

1. Chargement de `app/plus.css` et des modules `app/*.js`.
2. Routeur : branche `KX.match/KX.show`, appel `KX.after`. Premier rendu différé (`DOMContentLoaded` puis `setTimeout`) : un rendu synchrone faisait planter le moteur WebKit.
3. Révision : mesure du délai avant retournement (`CARD_RT`), hésitation (`hesitated`, réglage `S.hes`), message de fin de séance.
4. Dictionnaire :
   - entrées Core et JMdict dans `dic()` ;
   - déflexion `DEFL` / `deinflect()` ;
   - segmentation `Intl.Segmenter` (`JSEG`, `segEnds`) dans `linkW` ;
   - libellé de source et ajout à « Mes mots » pour ces entrées ; lien Jisho pour les mots absents.
5. Focus : lien « Salle de détente » pendant la pause.
6. Examens blancs : mention « pas une épreuve officielle ».
7. Sécurité :
   - `esc` échappe aussi l'apostrophe ;
   - `normTypes()` ;
   - échappements dans `renderHud`, la recherche, la fiche de mot et `vEnd` ;
   - balise CSP `object-src 'none'; base-uri 'none'` ;
   - `aria-label` sur les menus du test chronométré.
8. Export/import : champ `plus` (textes locaux).
9. Correctif : `mkeys` (`const` réassigné, ce qui empêchait le comptage des médias).

## Service worker

La version est `kotonoha-2026-11-05-izakaya`. La page et `app/*.js|css` sont servis réseau d'abord (avec copie de secours), pour que page et modules restent cohérents après une mise à jour. Les autres fichiers sont servis cache d'abord.

**À chaque publication, changer `VERSION` dans `sw.js`.**
