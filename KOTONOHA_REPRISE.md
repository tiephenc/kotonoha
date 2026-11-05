# KOTONOHA — reprise du travail

Pour une nouvelle session Claude Code. Ce document permet de reprendre sans refaire les audits déjà réalisés. Mis à jour le 5 novembre 2026, à la fin de la mission 4 (refonte « izakaya »).

## 1. Ouvrir la bonne session

- Ouvrir Claude Code **dans le dossier** `C:\Users\tieph\Documents\DEV\KOTONOHA\kotonoha`. Sinon, les agents `kotonoha-*`, les skills du projet et `CLAUDE.md` ne sont pas chargés.
- Lire dans l'ordre : `CLAUDE.md`, ce fichier, `KOTONOHA_ARCHITECTURE.md`, `KOTONOHA_REFONTE.md`, puis `KOTONOHA_FONCTIONNALITES.md`.

## 2. État Git et publication

- Mission 2 : branche `audit/pre-claude`, fusionnée dans `main` (PR n° 1, commit `edb9790`).
- Mission 3 : branche `refonte/carnet-de-voyage`, fusionnée en avance rapide dans `main` et poussée sans forçage, sur autorisation explicite de l'utilisateur. Le site public est https://tiephenc.github.io/kotonoha/ (GitHub Pages, branche `main`).
- Mission 4 : branche `refonte/izakaya`, fusionnée en avance rapide dans `main` et poussée sans forçage, sur demande explicite de l'utilisateur.
- Version du service worker : `kotonoha-2026-11-05-izakaya2`. **À changer à chaque publication.**
- Direction de design : `PRODUCT.md` et `DESIGN.md` (versionnés) ; le contrat de direction Impeccable reste local dans `.impeccable/` (ignoré par Git, pour ne pas être servi par GitHub Pages).
- Sauvegarde d'avant la mission 2, hors Git : `backups/2026-11-04-avant-mission2/` (fichiers d'origine, `SHA256SUMS.txt`, bundle Git complet).

## 3. Audits déjà faits (ne pas recommencer)

| Audit | Résultat | Où |
|---|---|---|
| Environnement (outils, MCP, plugins, Strix) | Fait | `KOTONOHA_OUTILS_ET_ENVIRONNEMENT.md` |
| Données : volumes et empreintes | Référence prise avant tout changement | `tools/data-baseline.json` ; vérifier avec `npm run check` |
| Sécurité (revue de code) | Corrigé ou documenté | `KOTONOHA_SECURITE.md` |
| Accessibilité (axe-core) | Aucune violation sur les écrans audités après la refonte | `KOTONOHA_TESTS.md` |
| Langue (atelier) | Relu par l'agent linguiste, corrections appliquées | `app/atelier-data.js` |
| Recherche sur les pauses | Faite | `KOTONOHA_PAUSES_ET_MINIJEUX.md` |
| Plantages WebKit sous Windows | Deux causes trouvées ; le reste est attribué au portage | `KOTONOHA_TESTS.md` |

## 4. Faits à connaître

- **Corpus Anki** (11 041 notes, 1 890 identifiants bloqués) : **absent du dépôt**. La version publique a `CORE` et `ANKID` vides ; l'utilisateur importe ses paquets dans le navigateur.
  - Le code d'import n'a pas été modifié ; seul l'affichage des identifiants est désormais échappé.
  - Pour vérifier le corpus lui-même, il faut le fichier `.apkg` ou un export (demander à l'utilisateur) et en calculer l'empreinte avant et après.
- **Générateur de `index.html`** : introuvable. `index.html` est donc la source.
- **Dictionnaire** : sans le Core importé, les mots N5 de base n'ont pas de définition. Le site propose alors un lien Jisho.
- **Correction et conversation libre par IA** : actives seulement dans un artefact claude.ai (`window.claude.complete`). Sinon, l'interface propose une consigne à copier.

## 5. Prochaines étapes conseillées (par priorité)

1. Tester sur un vrai Safari (iPhone, iPad ou Mac). Les tests WebKit sous Windows ne sont pas concluants.
2. Faire relire les fiches de kamon et de destinations par l'agent `kotonoha-linguiste` ou une personne compétente, et ajouter des sources institutionnelles (offices de tourisme, musées, bases héraldiques) à côté de Wikipédia.
3. Sécurité restante, côté consoles et hors dépôt :
   - App Check Firebase ;
   - restriction de la clé d'API par référent ;
   - typage `updated` et `size` dans les règles Firestore ;
   - flux PKCE pour Supabase avant de l'activer.
4. Audio : remplacer la synthèse vocale par de vrais enregistrements quand ils existeront (aucun audio inventé).
5. Envisager :
   - un test de positionnement adaptatif ;
   - la synchronisation des textes longs (aujourd'hui sur l'appareil, inclus dans l'export).
6. Si l'utilisateur fournit une clé et Docker : lancer Strix en local (voir `KOTONOHA_SECURITE.md`).

## 6. Commandes

```bash
npm run check
```
```bash
npm test
```
```bash
npm run serve
```
