# KOTONOHA · 言の葉

Site gratuit pour préparer le JLPT du N4 au N2, en français. Il comprend :

- un parcours de 210 unités ;
- la répétition espacée ;
- un vocabulaire classé par fréquence ;
- des examens blancs ;
- l'écriture des kanji et l'écoute.

Le site s'installe comme une application et fonctionne hors connexion.

Auteur : Titi (Tiéphen Chauvin), étudiant en LCSA à Aix-Marseille Université. Contact : tiephen.chauvin@etu.univ-amu.fr

Soutenir le projet : https://ko-fi.com/tiephenchauvin

## Contenu du dépôt

- `index.html` : le site complet. C'est un fichier généré.
- `sw.js`, `manifest.webmanifest` et `icon-*.png` : ce qui rend le site installable et utilisable hors connexion.
- `firebase/firestore.rules` : les règles de sécurité pour les comptes Firebase (option recommandée).
- `supabase/schema.sql` : l'équivalent pour Supabase (autre option).
- `.nojekyll` : indique à GitHub Pages de servir les fichiers tels quels.

## Publication

Dans le dépôt GitHub, ouvrir **Settings**, puis **Pages**. Choisir **Deploy from a branch**, la branche `main` et le dossier `/ (root)`.

## Licences

- **Textes, exercices, illustrations et code** : © Tiéphen Chauvin, tous droits réservés, sauf mention contraire ci-dessous.
- **Vocabulaire « Fréquence »** (constante `JMV` dans `index.html`) : extrait de JMdict, © Electronic Dictionary Research and Development Group, licence CC BY-SA 4.0. Il reste sous cette licence.
- **Tracés des kanji** (constante `KVG`) : KanjiVG, © Ulrich Apel, licence CC BY-SA 3.0. Ils restent sous cette licence.
- **Vérification des lectures et des sens** : JMdict et KANJIDIC (EDRDG), sous licence CC BY-SA 4.0.
- **Polices** : Google Fonts, sous licence SIL Open Font License 1.1.
- **Décompression zstd** : fzstd, © Arjun Barrett, sous licence MIT.

Kotonoha n'est affilié ni à la Japan Foundation ni au JEES, qui organisent le JLPT.
