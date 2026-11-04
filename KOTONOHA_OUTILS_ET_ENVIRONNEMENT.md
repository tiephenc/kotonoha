# KOTONOHA — outils et environnement de développement

Mis à jour le 4 novembre 2026 (phase 0 de la mission 2). Complète [KOTONOHA_ENVIRONNEMENT.md](KOTONOHA_ENVIRONNEMENT.md) (mission 1).

## 1. Versions

| Composant | Version | Source |
|---|---|---|
| Claude Code | 2.1.317 | anthropic.com |
| Node.js / npm | 24.22.0 / 11.19.1 | nodejs.org |
| Python | 3.12.10 (sert de serveur local) | python.org |
| uv | 0.13.7 | astral.sh |
| Git | 2.56.0 | git-scm.com |
| @playwright/test | 1.64.1 (devDependency du projet) | github.com/microsoft/playwright |
| @axe-core/playwright | 4.14.0 (devDependency) | github.com/dequelabs/axe-core-npm |
| Navigateurs Playwright | Chromium 1248, Firefox 1555, WebKit 2370 | téléchargés par Playwright |
| Navigateurs installés | Google Chrome, Microsoft Edge, Mozilla Firefox | Windows |
| Docker | **absent** | — |
| GitHub CLI (`gh`) | **absent** | — |

## 2. Tableau de synthèse

| Outil | Catégorie | État initial | Action réalisée | État final |
|---|---|---|---|---|
| Impeccable 4.8.0 | Design / UX | Installé (skill, 4 agents, hooks) | Vérifié (`impeccable context`) | Opérationnel |
| Frontend Design | Design | Installé (mission 1) | — | Activé |
| ui-ux-pro-max, design, design-system, ui-styling, web-design-guidelines, frontend-ui-engineering | Design / UX / a11y | Installés (skills utilisateur) | — | Disponibles (Impeccable reste la référence) |
| Superpowers 7.0.0 | Méthode (plans, TDD, débogage, revue) | Installé (mission 1) | — | Activé |
| Context7 | Documentation | MCP utilisateur opérationnel | Utilisé pour Playwright | Opérationnel |
| Playwright MCP | Navigateur piloté | MCP utilisateur opérationnel | — | Opérationnel |
| Playwright Test + axe-core | Tests E2E, multi-navigateurs, accessibilité | Absent du projet | `package.json`, `playwright.config.js`, `tests/` | Opérationnel (7 projets) |
| `/code-review`, `/simplify`, `/security-review` | Revue, simplification, sécurité | Intégrés à Claude Code | — | Disponibles |
| Security Guidance 2.0.17 | Sécurité (alertes + revue LLM) | Installé (mission 1) | — | Activé |
| Skills Strix (8 skills) | Pentest guidé | Installées | — | Inutilisables sans la CLI Strix |
| **Strix (CLI)** | Pentest automatisé | Absent | **Non installé** : Docker et clé API LLM requis (§ 5) | En attente de votre accord |
| Hook `check-index-js.mjs` | Qualité | Créé (mission 1) | — | Actif |
| `tools/data-integrity.mjs` | Intégrité des données | Absent | Créé + référence `tools/data-baseline.json` | Opérationnel |
| `tools/serve.mjs`, `tools/check.mjs` | Serveur local sûr, contrôle avant publication | Absents | Créés (`npm run serve`, `npm run check`) | Opérationnels |
| Agents `kotonoha-*` (6) | Spécialistes | Absents | Créés dans `.claude/agents/` | Disponibles |
| TypeScript / Pyright LSP | Analyse statique | Absents | Non installés (pas de TS ni de Python) | Non applicable |
| GitHub MCP | Dépôt distant | Absent | Non installé (jeton GitHub requis) | En attente de votre accord |
| Figma MCP | Design | Absent | Non installé : aucun fichier Figma, le design se fait dans le code | Non justifié |
| Supabase MCP | Base de données | Absent | Non installé : option secondaire, aucun projet Supabase actif identifié | Non justifié |
| Firebase (plugin officiel) | Base de données / Auth | Absent | Non installé : connexion à votre compte Firebase requise | Optionnel, sur accord |
| Cloudflare MCP | Hébergement | Absent | Non installé : site sur GitHub Pages | Non justifié |
| Chrome DevTools MCP | Débogage navigateur | Absent | Non installé : Playwright couvre le besoin | Non justifié |

## 3. MCP actifs

| Serveur | Type | Provenance | Usage pour KOTONOHA |
|---|---|---|---|
| context7 | HTTP, clé dans `~/.claude.json` (hors dépôt) | Upstash | Documentation à jour (Playwright, Firebase, Web APIs) |
| playwright | stdio `npx @playwright/mcp@latest` | Microsoft | Inspection visuelle interactive |
| caveman | stdio local | outil personnel | Compression de contexte (non lié au projet) |
| Claude Docs, Google Drive | claude.ai | Anthropic / Google | Non utilisés pour le projet |
| huggingface-skills | HTTP | plugin synchronisé | Non authentifié, sans usage ici |

## 4. Agents disponibles

| Agent | Rôles couverts (demande initiale) | Droits |
|---|---|---|
| `Plan` (intégré) | Software Architect | lecture |
| `Explore` (intégré) | recherche dans le code | lecture |
| Fil principal + skills design + agents Impeccable | Frontend Developer, UI/UX Designer, Motion | écriture (fil principal seulement) |
| `impeccable-finish-reviewer`, `impeccable-documenter` | revue visuelle, documentation du design system | lecture / doc |
| `kotonoha-linguiste` | Japanese Language Specialist, JLPT Curriculum (contenu) | lecture + web |
| `kotonoha-pedagogue` | Learning Experience Designer, Japanese Pedagogy, UX Researcher, psychologie cognitive de l'apprentissage | lecture + web |
| `kotonoha-detente` | Game Designer, Cognitive Psychology Researcher (pauses) | lecture + web |
| `kotonoha-qa` | QA Engineer, Accessibility Specialist, Performance Engineer | écrit uniquement dans `tests/` |
| `kotonoha-securite` | Security Auditor | lecture |
| `kotonoha-integrite-donnees` | Data Integrity Specialist | lecture |
| Fil principal | Documentation Specialist, coordination, intégration | écriture |

Les 16 rôles demandés sont regroupés en 6 agents projet pour éviter les doublons. Seul le fil principal modifie `index.html` : aucun agent n'écrit en parallèle dans le même fichier.

## 5. Strix : examen et décision

- Dépôt officiel `usestrix/strix` : licence Apache-2.0, très actif (~960 commits, ~74 k étoiles), paquet `strix-agent` (pipx/uv/pip) ou script `curl … | bash`.
- **Prérequis** : Docker en fonctionnement (les agents s'exécutent dans un bac à sable conteneurisé) **et** une clé d'API d'un fournisseur de modèles (`STRIX_LLM`, `LLM_API_KEY`), ou un modèle local via `LLM_API_BASE`. Windows n'est pas mentionné : il faut passer par Docker Desktop (WSL 2).
- **Coûts** : l'outil est gratuit, mais chaque analyse consomme des jetons chez le fournisseur choisi (payant). Strix Cloud (app.strix.ai) demande un compte.
- **Risques** : les analyses sont dynamiques (de vraies requêtes envoyées à la cible). À limiter au serveur local `http://127.0.0.1:8765` et au dépôt ; jamais Firebase, Supabase ni GitHub Pages sans autorisation écrite.
- **Décision** : non installé, faute de Docker et de clé API. Pour l'activer : (1) installer Docker Desktop, (2) choisir un fournisseur et me confirmer la dépense, (3) `uv tool install strix-agent`, puis `strix --target ./` et `strix --target http://127.0.0.1:8765` en mode non destructif.
- En attendant, l'audit de sécurité s'appuie sur Security Guidance, `/security-review`, l'agent `kotonoha-securite`, `npm audit` et des tests Playwright d'injection en local.

## 6. Commandes

```bash
npm test
```
```bash
npx playwright test --project=chromium
```
```bash
node tools/data-integrity.mjs
```
```bash
npm run serve
```

Projets Playwright par défaut : `chromium`, `firefox`, `chrome`, `edge`, `mobile` (Pixel 7), `tablette-chromium` (Galaxy Tab S4). Sur demande (`WEBKIT=1`) : `webkit` et `tablette` (iPad), moteur de Safari, instables sous Windows.

## 7. Incompatibilités et limites connues

1. **WebKit sous Windows** : le moteur de Safari fourni par Playwright plante sur ce site. Deux causes sont isolées : le premier rendu synchrone (corrigé dans le site par un rendu différé) et la synthèse vocale (contournée dans les tests). D'autres plantages aléatoires subsistent : les résultats sont non concluants (voir `KOTONOHA_TESTS.md`). Ce moteur n'est pas Safari : **aucun test sur un vrai Safari ou un vrai iPhone n'est possible ici**.
1 bis. **Agents du projet** : ils ne sont chargés que si la session Claude Code est ouverte dans le dossier du projet. Depuis une autre session, on les utilise via un agent généraliste à qui l'on fait lire leur définition (`.claude/agents/*.md`).
2. La synthèse vocale est remplacée par un faux objet dans les tests WebKit ; la lecture audio n'est donc pas vérifiée sur ce moteur.
3. `index.html` est un fichier généré dont le générateur est absent : désormais, il est traité comme la source (voir `KOTONOHA_ARCHITECTURE.md`).
3 bis. Ne pas servir le site avec `python -m http.server` : il expose `.git` et `backups/`. Utiliser `npm run serve`.
4. Le corpus Anki personnel (11 041 notes, 1 890 identifiants bloqués) **n'est pas dans le dépôt** : la version publique a `publicBuild: true`, `CORE` vide et `ANKID` vide ; l'utilisateur importe ses paquets dans le navigateur. Les empreintes de référence couvrent donc les données réellement présentes (UNITS, SORT, JMV, KVG…).
5. Security Guidance lance une revue LLM à chaque fin de tour (consomme du quota) ; on peut la désactiver avec `ENABLE_CODE_SECURITY_REVIEW=0`.

## 8. Permissions et garde-fous

- `.claude/settings.json` : confirmation demandée pour `git commit/push/reset/rebase/checkout --` et `firebase deploy` ; lecture interdite des `.env` et des clés de service.
- Les tests bloquent tout réseau autre que `127.0.0.1` : aucun appel à Firebase, Supabase ni aux services tiers.
- Sauvegarde avant travaux : `backups/2026-11-04-avant-mission2/` (copie des fichiers, `SHA256SUMS.txt`, bundle Git complet), hors Git.
