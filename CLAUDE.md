# KOTONOHA · 言の葉 — consignes pour Claude Code

Site gratuit de préparation au JLPT (N4 → N2) en français. PWA hors connexion, publiée sur GitHub Pages (`main`, racine).
**Pour reprendre le travail : lire d'abord [KOTONOHA_REPRISE.md](KOTONOHA_REPRISE.md).** Architecture : [KOTONOHA_ARCHITECTURE.md](KOTONOHA_ARCHITECTURE.md). Outils : [KOTONOHA_OUTILS_ET_ENVIRONNEMENT.md](KOTONOHA_OUTILS_ET_ENVIRONNEMENT.md).

## Architecture (à connaître avant toute modification)

- **Site monofichier** : `index.html` (~5,7 Mo, ~11 700 lignes) contient le HTML, le CSS, **un seul `<script>` classique** (à partir de la ligne ~923, pas de module, pas de bundler) et toutes les données.
- `index.html` était généré (`build.py`), mais le générateur est introuvable : il est **désormais modifié directement**. Modifications minimes ; les nouvelles fonctionnalités vont dans `app/*.js` (registre `KX.view` / `KX.on`, voir KOTONOHA_ARCHITECTURE.md).
- Le site n'a aucune dépendance npm. `package.json` ne sert qu'aux outils de développement (Playwright, axe-core). Pas de TypeScript, pas de Python.
- Très grosses lignes de données : `const SORT` (~200 ko, l. ~9119), `window.JMV` (JMdict, ~1,7 Mo, l. ~9513), `const KVG` (KanjiVG, ~1,6 Mo, l. ~9523). **Ne jamais lire `index.html` en entier** : utiliser Grep, puis Read avec `offset`/`limit`.
- Hors ligne : `sw.js` (constante `VERSION` à changer à chaque publication pour invalider le cache), `manifest.webmanifest`, `icon-*.png`.
- Comptes : Firebase (Auth + Firestore via REST, règles dans `firebase/firestore.rules`) ou Supabase en option (`supabase/schema.sql`). Les clés Firebase/Supabase côté client sont publiques par conception ; la sécurité repose sur les règles.
- `vendor/sql-wasm.*` : sql.js pour lire les paquets Anki. `sons/` : ambiances du minuteur Focus.

## Règles

- **Données pédagogiques** (unités, exercices, vocabulaire, lectures, sens, tracés) : ne rien modifier sans demande explicite. Voir la skill `kotonoha-contenu-japonais`.
- Respecter la direction artistique existante (rouge `#D2233F`, papier `#F2E8D8`, Shippori Mincho / Zen Kaku Gothic New). Pas de refonte non demandée.
- Interface en français : typographie française (espace insécable avant `: ; ? !`, guillemets « »), ton sobre.
- Licences : JMV reste CC BY-SA 4.0, KVG reste CC BY-SA 3.0 ; conserver les mentions.
- Pas de commit, push, ni déploiement sans accord explicite (les commandes git sensibles demandent confirmation).
- Aucun secret dans le dépôt.

## Vérifier

- Un hook vérifie après chaque modification que le JavaScript de `index.html` compile encore.
- `npm run check` : syntaxe (index.html, app/, sw.js) et intégrité des données (`tools/data-integrity.mjs`, référence `tools/data-baseline.json` : ne la réécrire qu'après validation explicite).
- `npm test` : tests Playwright (Chromium, Firefox, Chrome, Edge, mobile, tablette). WebKit sous Windows est instable : `WEBKIT=1` pour le lancer.
- Servir localement : `npm run serve` (`tools/serve.mjs`, 127.0.0.1:8765). Ne pas utiliser `python -m http.server`, qui expose `.git` et les sauvegardes.
- Publication : changer `VERSION` dans `sw.js`.
