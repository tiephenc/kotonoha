# KOTONOHA — architecture

État au 4 novembre 2026, après la mission 2.

## Vue d'ensemble

```
index.html            site complet (HTML, CSS, script classique, données pédagogiques) ~5,7 Mo
app/plus.css          styles des espaces complémentaires (+ correctifs de contraste du thème clair)
app/plus.js           noyau KX : registre de vues, crochets de rendu, stockage local, utilitaires
app/temps.js          temps actif, calendrier adaptatif, maîtrise
app/detente.js        salle de détente et cinq expériences
app/lecture.js        espace Lire (textes du parcours, lectures personnelles, actualités)
app/atelier-data.js   contenus de l'atelier (sujets, scénarios) — données rédigées
app/atelier.js        rédaction et conversation
app/carte.js          carte du parcours
app/culture.js        calendrier culturel et kamon historiques
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

Ainsi les modifications de `index.html` restent minimes et localisées.

## Données

| Donnée | Où | Synchronisée (Firebase/Supabase) | Export |
|---|---|---|---|
| Progression existante (`S.units`, `S.srs`, `S.g`, `S.core`…) | `localStorage['kotonoha.progress.v1']` | oui | oui |
| Petites données nouvelles (`S.x` : temps actif, plan, calendrier, pauses ; `S.hes`) | même objet `S` | oui | oui |
| Mesures d'hésitation par carte (`S.srs[id].t`, `.hz`) | `S.srs` | **non** (le format compact des fragments Firestore ne les transporte pas) | oui |
| Textes longs (lectures, rédactions, brouillons, conversations, ressentis) | `localStorage['kotonoha.plus.v1']` via `KX.local` | non (sur l'appareil) | oui (`plus` dans le fichier d'export, fusion prudente à l'import) |
| Préférences d'affichage (durée de pause, mode de conversation…) | `localStorage['kotonoha.detente.*']`, `kotonoha.atelier.*` | non | non |
| Corpus Anki importé | IndexedDB / `CORE`, `ANKID` (vides dans la version publique) | selon le code existant | inchangé |

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

La version est `kotonoha-2026-11-04-plus`. La page et `app/*.js|css` sont servis réseau d'abord (avec copie de secours), pour que page et modules restent cohérents après une mise à jour. Les autres fichiers sont servis cache d'abord.

**À chaque publication, changer `VERSION` dans `sw.js`.**
