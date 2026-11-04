# KOTONOHA · 言の葉

Site gratuit pour préparer le JLPT du N4 au N2, en français. Il comprend :

- un parcours de 210 unités ;
- la répétition espacée ;
- un vocabulaire classé par fréquence ;
- des examens blancs ;
- l'écriture des kanji et l'écoute ;
- un espace Lire (textes gradués, vos lectures et actualités, dictionnaire contextuel) ;
- un atelier d'expression écrite et de conversation ;
- un calendrier adaptatif, le temps d'étude actif et la maîtrise réelle de chaque unité ;
- une carte du parcours, un calendrier culturel japonais et un carnet ;
- un carnet de voyage illustré : voyage au Japon débloqué par l'activité réelle, collection de kamon documentés, journal de la semaine ;
- une salle de détente (huit expériences sans japonais, sans score).

Le site s'installe comme une application et fonctionne hors connexion.

Auteur : Titi (Tiéphen Chauvin), étudiant en LCSA à Aix-Marseille Université. Contact : tiephen.chauvin@etu.univ-amu.fr

Soutenir le projet : https://ko-fi.com/tiephenchauvin

## Contenu du dépôt

- `index.html` : le site (contenu, styles, script principal, données). Il est désormais modifié directement (voir `KOTONOHA_ARCHITECTURE.md`).
- `app/` : les espaces complémentaires et la refonte visuelle (thème, renard, accueil, voyage, kamon, focus, détente, lire, atelier, calendrier, carte, culture, carnet).
- `sw.js`, `manifest.webmanifest` et `icon-*.png` : ce qui rend le site installable et utilisable hors connexion.
- `firebase/firestore.rules` : les règles de sécurité pour les comptes Firebase (option recommandée).
- `supabase/schema.sql` : l'équivalent pour Supabase (autre option).
- `.nojekyll` : indique à GitHub Pages de servir les fichiers tels quels.
- `tests/`, `tools/`, `package.json`, `playwright.config.js` : outils de développement (tests Playwright, serveur local, contrôle des données). Ils ne sont pas chargés par le site.

## Développement

- `npm install` puis `npm run serve` : site local sur http://127.0.0.1:8765/
- `npm run check` : syntaxe et intégrité des données ; `npm test` : tests navigateurs.
- Documentation : `KOTONOHA_ARCHITECTURE.md`, `KOTONOHA_FONCTIONNALITES.md`, `KOTONOHA_TESTS.md`, `KOTONOHA_SECURITE.md`, `KOTONOHA_PAUSES_ET_MINIJEUX.md`, `KOTONOHA_REFONTE.md`, `KOTONOHA_REPRISE.md`.

## Publication

Avant de publier, changer `VERSION` dans `sw.js` pour que les appareils déjà installés récupèrent la nouvelle version.

Dans le dépôt GitHub, ouvrir **Settings**, puis **Pages**. Choisir **Deploy from a branch**, la branche `main` et le dossier `/ (root)`.

## Licences

- **Textes, exercices, illustrations et code** : © Tiéphen Chauvin, tous droits réservés, sauf mention contraire ci-dessous.
- **Vocabulaire « Fréquence »** (constante `JMV` dans `index.html`) : extrait de JMdict, © Electronic Dictionary Research and Development Group, licence CC BY-SA 4.0. Il reste sous cette licence.
- **Tracés des kanji** (constante `KVG`) : KanjiVG, © Ulrich Apel, licence CC BY-SA 3.0. Ils restent sous cette licence.
- **Vérification des lectures et des sens** : JMdict et KANJIDIC (EDRDG), sous licence CC BY-SA 4.0.
- **Polices** : Google Fonts, sous licence SIL Open Font License 1.1.
- **Décompression zstd** : fzstd, © Arjun Barrett, sous licence MIT.
- **Lecture des paquets Anki** (`vendor/sql-wasm.*`) : sql.js, sous licence MIT.
- **Jours fériés japonais** : règles du Cabinet Office ; équinoxes publiées par l'Observatoire astronomique national (国立天文台). **Kamon historiques** : dessins simplifiés réalisés pour KOTONOHA, sources citées dans le site.

Kotonoha n'est affilié ni à la Japan Foundation ni au JEES, qui organisent le JLPT.
