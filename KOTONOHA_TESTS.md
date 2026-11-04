# KOTONOHA — tests

Dernière campagne : 4 novembre 2026. Outils : Playwright 1.64.1, axe-core 4.14, serveur local `tools/serve.mjs` (port 8765).

## Lancer

```bash
npm run check
```
```bash
npm test
```
```bash
npx playwright test --project=chromium
```
```bash
WEBKIT=1 npx playwright test --project=webkit
```

- `npm run check` : syntaxe de `index.html`, des modules et de `sw.js`, plus l'intégrité des données.
- Tous les tests bloquent le réseau autre que `127.0.0.1` : aucun appel à Firebase, Supabase ou aux services tiers.
- Le service worker est bloqué, sauf dans le test hors connexion.

## Contenu

| Fichier | Vérifie |
|---|---|
| `smoke.spec.js` | Accueil, 13 écrans existants sans erreur JS ni défilement horizontal, persistance au rechargement |
| `temps.spec.js` | Temps actif (horloge simulée), calendrier (jours, pause, repos, persistance), maîtrise, hésitation en révision |
| `detente.spec.js` | Salon, 5 expériences, fin de pause et ses 3 choix, prolongation, ressenti, retour à la séance, rizières toujours solubles, clavier, aucun son sans action |
| `lecture.spec.js` | Textes du parcours, lecture personnelle (analyse, mot conjugué → forme de dictionnaire, popup, résumé, persistance, suppression), injections |
| `atelier.spec.js` | Sujets, vérifications de forme, brouillon, correction collée, conversation guidée complète, réponse libre (registre, échappement) |
| `carte-culture.spec.js` | Carte (toutes les unités, accès par Progrès), vue d'une unité (grammaire, kanji, avant/après, popup), jours fériés 2026–2027 (reports, jour chômé intercalé), sources, kamon |
| `carnet.spec.js` | Ajout, recherche, modification, suppression, persistance, échappement |
| `securite.spec.js` | Sauvegarde piégée importée par l'interface (aucune exécution, types normalisés, adresse neutralisée), en-tête CSP |
| `pwa-a11y.spec.js` | Hors connexion (service worker, réseau coupé), audit axe-core WCAG 2 A/AA sur 17 écrans |

## Résultats

Campagne finale (4 novembre 2026) : 6 configurations × 30 tests, avec une nouvelle tentative autorisée.

| Configuration | Moteur | Résultat |
|---|---|---|
| chromium | Chromium (bureau) | tout réussi |
| chrome | Google Chrome installé | tout réussi |
| edge | Microsoft Edge installé | tout réussi |
| firefox | Firefox (Playwright) | tout réussi, sauf le test hors connexion (sauté, voir limites) |
| mobile | Chromium, émulation Pixel 7 | tout réussi |
| tablette-chromium | Chromium, émulation Galaxy Tab S4 | tout réussi |

**Bilan :** 179 réussis, 1 sauté, 0 échec, 0 instable. Le test « fin de durée » (détente), qui repose sur une horloge simulée, a pu échouer sous forte charge parallèle lors d'une campagne précédente.

**Accessibilité (axe-core) :**
- Plus aucune violation dans les nouveaux espaces.
- Une violation préexistante reste : le contraste d'un paragraphe de l'en-tête de l'Accueil (`.bighead p`).
- Les contrastes du thème clair ont été corrigés : plusieurs centaines d'éléments en défaut auparavant.

**Données :** `tools/data-integrity.mjs` confirme des empreintes identiques à la référence prise avant tout changement :
- 210 unités, 628 points de grammaire, 1 884 exemples ;
- 2 355 mots et 785 kanji d'unités ;
- 1 884 exercices de remise en ordre ;
- 8 188 notes JMdict (identifiants uniques) ;
- 2 189 tracés KanjiVG.

## Limites (ce qui n'a pas pu être testé)

- **Safari et iPhone/iPad réels : non testés.** Aucun appareil Apple n'est disponible.
- **WebKit sous Windows (Playwright) : résultats non concluants.** Ce portage, qui n'est pas Safari, plante de façon aléatoire sur ce site (« Target crashed »).
  - Deux causes ont été trouvées et traitées :
    - le premier rendu synchrone, corrigé dans le site ;
    - la synthèse vocale, contournée dans les tests uniquement.
  - D'autres plantages demeurent, même sur du code minimal (vue carte, parfois dès l'accueil). Ils n'ont pas été reproduits hors de ce portage.
  - La vérification sur un vrai Safari reste à faire.
- **Hors connexion sous Firefox** : Firefox piloté par Playwright ne laisse pas le service worker répondre quand le réseau est coupé (`NS_ERROR_OFFLINE`).
- **Synthèse et dictée vocales** : non vérifiées automatiquement (la voix dépend du système).
- **Comptes Firebase et Supabase** : non testés, pour ne pas écrire dans des services réels.
- **Performance** : pas de mesure Lighthouse. Le chargement est dominé par `index.html` (5,7 Mo), et les modules ajoutent environ 190 Ko non compressés.
- **Défilement horizontal** vu en mission 1 vers 930 px : non reproduit (largeurs testées de 360 à 1 280 px). Il venait du cadre du navigateur de test.
