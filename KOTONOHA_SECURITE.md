# KOTONOHA — sécurité

Audit du 4 novembre 2026. **Ce document ne déclare pas le site « sécurisé » :** il décrit ce qui a été vérifié, ce qui a été corrigé et ce qui reste.

## Périmètre et méthode

- **Revue de code** en lecture seule par un agent dédié, suivant la définition `.claude/agents/kotonoha-securite.md`. Elle a porté sur :
  - les modules `app/*.js` ;
  - dans `index.html` : l'import de sauvegarde, l'import `.apkg`, le dictionnaire, la recherche, Focus (YouTube, Spotify), les appels Firebase et Supabase, les liens externes ;
  - `sw.js`, `tools/serve.mjs`, `firebase/firestore.rules`, `supabase/schema.sql`.
- **Alertes automatiques** du plugin Security Guidance pendant le développement.
- **`npm audit`** : 0 vulnérabilité, sur les seuls outils de développement.
- **Tests dynamiques locaux** (Playwright, `tests/securite.spec.js`, `lecture.spec.js`, `atelier.spec.js`, `carnet.spec.js`) : injection de HTML et de scripts par les champs de saisie, par une sauvegarde piégée et par une adresse `javascript:`.
- **Aucun test** contre Firebase, Supabase, GitHub Pages ni un autre service tiers.
- **Strix non utilisé** : il demande Docker et une clé d'API payante (voir `KOTONOHA_OUTILS_ET_ENVIRONNEMENT.md`).

## Corrigé

| Gravité | Problème | Correctif | Vérification |
|---|---|---|---|
| Élevée | **XSS stocké par import de sauvegarde.** Un fichier piégé injectait du HTML via des champs numériques (XP, scores, réglages). Le code s'exécutait sur tous les appareils du compte après synchronisation et pouvait lire les jetons Firebase. | `normTypes()` dans `normState()` convertit en nombres tous les champs numériques, qu'ils viennent d'un import ou du cloud, sans rien supprimer. Échappement ajouté aux points d'insertion (`renderHud`, `vEnd`, modules). `KX.importLocal` valide la forme des éléments (identifiants, nombres, adresses http(s)). | `securite.spec.js` |
| Moyenne | **Import `.apkg`** : les identifiants SQLite étaient insérés sans échappement (recherche, fiche de mot, bilan). | `esc()` sur `w.id`, `w.nid`, `w.cid`, `x.id`. L'import du corpus n'est pas modifié. | revue |
| Faible | Une adresse de lecture importée pouvait être `javascript:`. | `KX.safeUrl` à l'affichage et à l'import. | `securite.spec.js`, `lecture.spec.js` |
| Faible | **Serveur de test** : le filtre était sensible à la casse sous Windows (`/.GIT/config` servi) et l'en-tête `Host` n'était pas vérifié. | Filtre insensible à la casse ; vérification de l'hôte (réponse 421 sinon). | vérifié avec `curl` |
| Info | `esc` n'échappait pas l'apostrophe. | Échappée. | — |
| Info | Aucune politique CSP. | `<meta>` CSP `object-src 'none'; base-uri 'none'`. Un CSP strict est impossible tant que le script et les styles sont en ligne. | `securite.spec.js` |

## Bonnes pratiques vérifiées

- Les liens externes `target="_blank"` ont `rel="noopener"`.
- YouTube et Spotify sont reconstruits à partir d'identifiants filtrés.
- `wordPop`, la recherche, `ruby` et `rubyW` échappent leurs données.
- Les textes collés par l'utilisateur (lectures, rédactions, conversation, carnet) sont toujours échappés.
- Les réponses de `window.claude.complete` sont échappées.
- Aucune clé secrète dans le site. La clé Firebase côté client est publique par conception : la protection repose sur les règles.
- **Firestore** : chaque utilisateur ne lit et n'écrit que son document (`hasOnly`, type chaîne, taille inférieure à 1 Mo).
- **Supabase** : RLS sur les quatre opérations ; `delete_my_account` sécurisée.
- **Service worker** : rien d'authentifié n'est mis en cache.

## Risques restants, non corrigés

1. **Jetons de compte dans `localStorage`** (`kotonoha.compte`). C'est inhérent à un site statique : toute faille XSS future donnerait accès au compte. La déconnexion ne révoque pas le jeton de rafraîchissement.
2. **Inscription Firebase ouverte sans App Check.** À configurer dans la console : App Check et restriction de la clé d'API par référent. Non vérifiable depuis le dépôt.
3. **Supabase (inactif)** : l'URL de retour accepte n'importe quel `#access_token=`, ce qui permet de connecter quelqu'un au compte d'un attaquant. À passer en flux PKCE avant d'activer Supabase.
4. **Règles Firestore** : `updated` et `size` ne sont pas typés (`is int`).
5. **Dépendances embarquées** non auditées (CVE) : `vendor/sql-wasm.*` (sql.js) et fzstd 0.1.1.
6. **Parties de `index.html` non relues ligne à ligne** : carnet d'erreurs, laboratoire d'écoute, recommandations.
7. **Dictée vocale (Chrome)** : l'audio part chez l'éditeur du navigateur, ce qui est signalé dans l'interface.

## Pour aller plus loin

- **Strix**, une fois Docker et une clé d'API disponibles : sur le dépôt (`strix --target ./`), puis sur le serveur local (`strix --target http://127.0.0.1:8765`), en mode non destructif.
- Une revue manuelle complète des parties restantes de `index.html`.
