# Génération de `app/kamon-art.js`

1. Télécharger les SVG listés dans `LICENCES-KAMON.md` (Wikimedia Commons) dans un dossier vide, un fichier par kamon nommé `<id>.svg`.
2. `python -I kamon_conv.py <dossier> kamon-art.json` : ne garde que les formes (aucun script, lien ni image), retire le fond carré, noir → couleur du sceau, blanc → papier (`--kmp`).
3. `python -I kamon_build.py ../../app/kamon-art.js` (depuis ce dossier, avec `kamon-art.json` à côté) : ajoute les 5 redessins de `kamon_hand.js` et les crédits.

Les formes ne sont pas retouchées. Les couleurs « papier » passent par `style` car `var()` n'est pas appliqué dans un attribut SVG.
