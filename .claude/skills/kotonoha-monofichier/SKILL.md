---
name: kotonoha-monofichier
description: Naviguer et modifier sans risque le site monofichier de KOTONOHA (index.html de ~5,7 Mo, un seul script classique, données intégrées), le service worker et la PWA. À utiliser avant toute modification de code, de CSS ou de structure dans index.html, sw.js ou manifest.webmanifest, et pour vérifier un changement dans le navigateur.
---

# Travailler dans le monofichier KOTONOHA

## Avant de modifier

1. **Source** : le générateur d'origine est introuvable, `index.html` est modifié directement. Toute nouvelle fonctionnalité va de préférence dans `app/*.js` (registre `KX.view`, crochets `KX.on`) ; n'éditer `index.html` que pour ce qui lui appartient (routeur, révision, dictionnaire…) et le noter dans KOTONOHA_ARCHITECTURE.md.
2. **Ne jamais lire le fichier entier.** Repérer avec Grep (`-n`, motifs précis : `function nom(`, `const NOM=`, une classe CSS), puis Read avec `offset`/`limit` (≤ 200 lignes). Les lignes ~9119, ~9513 et ~9523 font de 0,2 à 1,7 Mo : ne jamais les afficher ; utiliser `grep -o` avec une fenêtre courte.
3. Repères : CSS dans `<style>` en tête ; script unique à partir de la ligne ~923 ; `RAILS` (l. ~10234) = navigation principale ; `EXCFG` = configuration des examens blancs ; `SUPA`/`SB*` = Supabase ; appels REST Firebase vers `identitytoolkit`, `securetoken`, `firestore.googleapis.com`.

## Modifier

- Edit ciblé avec un `old_string` court et unique ; jamais de Write complet de `index.html`.
- Script **classique** partagé : pas de `import`/`export`, attention aux collisions de noms globaux (beaucoup de noms courts : `KW`, `CD`, `SB`…). Vérifier avec Grep qu'un nouveau nom est libre.
- Le hook projet `check-index-js.mjs` compile le script après chaque Edit : corriger immédiatement toute erreur signalée.
- Sécurité : contenu utilisateur ou distant inséré dans le DOM → `textContent` ou échappement, pas d'`innerHTML` brut ; ne pas élargir les règles Firestore/Supabase.

## Publication hors ligne

- Toute modification publiée de `index.html` ou des fichiers de `SHELL` nécessite de changer `VERSION` dans `sw.js`, sinon les utilisateurs gardent l'ancienne version en cache.
- Ne pas mettre en cache les requêtes de comptes (Firebase, Supabase), Ko-fi ni Spotify/YouTube.

## Vérifier dans le navigateur

1. Dans le dossier du projet : `npm run serve` (en arrière-plan), ou directement `npm test` (le serveur démarre seul).
2. MCP Playwright : `browser_navigate` vers `http://127.0.0.1:8765/`, `browser_console_messages` (niveau error), `browser_resize` 375×812 puis 1280×800, `browser_take_screenshot`.
3. Vérifier le parcours touché (ex. #aujourdhui, #parcours, #vocab, #revision) et l'absence de défilement horizontal sur mobile.
4. Arrêter le serveur à la fin.
