# Environnement Claude Code de KOTONOHA

Audit et préparation du 4 novembre 2026 (mission 1). Aucune modification du site ni des données pédagogiques.

## 1. Le projet en bref

- Site statique **monofichier** : `index.html` (~5,7 Mo) = HTML + CSS + un script JS classique + toutes les données. Fichier **généré** : le générateur n'est pas dans ce dépôt (à localiser).
- PWA hors connexion (`sw.js`, `manifest.webmanifest`), publiée sur GitHub Pages (`tiephenc/kotonoha`, branche `main`).
- Comptes : Firebase (Auth + Firestore via REST), Supabase en option. Pas de `package.json`, pas de TypeScript, pas de Python, pas de tests automatisés.

## 2. Plugin, MCP, skill : qui fait quoi

| Notion | Rôle | Exemple ici |
|---|---|---|
| **Skill** | Instructions (et parfois scripts) chargées quand la tâche s'y prête ou via `/nom` | `impeccable`, `kotonoha-contenu-japonais` |
| **MCP** | Serveur qui donne à Claude de nouveaux outils (navigateur, documentation…) | `playwright`, `context7` |
| **Plugin** | Paquet installable qui regroupe skills, agents, commandes, hooks et/ou MCP | `superpowers`, `security-guidance` |
| **Hook** | Commande lancée automatiquement à un moment précis (après une modification, à la fin d'un tour…) | vérification du JS de `index.html` |
| **Agent** | Sous-agent spécialisé lancé par Claude | `code-simplifier`, agents Impeccable |

Un plugin peut donc *fournir* un MCP (ex. plugin Context7) : installer le plugin **et** garder une configuration MCP manuelle crée un doublon.

## 3. Inventaire

| Élément | Version / état |
|---|---|
| Claude Code | 2.1.317 (canal `latest`) |
| Node.js / npm | 24.22.0 / 11.19.1 |
| Python | 3.12.10 |
| Git | 2.56.0 · `gh` (GitHub CLI) **absent** |
| Marketplaces | `claude-plugins-official` (GitHub anthropics), Anthropic Directory (claude.ai) |
| MCP opérationnels | context7 (HTTP, clé dans `~/.claude.json`), playwright (`@playwright/mcp@latest`), caveman, Claude Docs et Google Drive (claude.ai) |
| MCP non opérationnel | `huggingface-skills` (plugin synchronisé depuis claude.ai) : demande une authentification ; sans rapport avec KOTONOHA |
| Skills utilisateur | ~55 dans `~/.claude/skills` (Impeccable, série « agent-skills » : TDD, débogage, revue, sécurité, performance, docs… ; Strix ; 21st ; ui-ux-pro-max ; graphify) |
| Agents utilisateur | 4 agents Impeccable |
| Hooks utilisateur | caveman (tous événements), Impeccable (début de session, après Edit/Write, fin de tour) |

## 4. Bilan des outils

| Outil | Présent avant | Action | État final |
|---|---|---|---|
| Frontend Design | Non | Plugin officiel installé (utilisateur) | Activé |
| Superpowers | Non | Plugin officiel installé (utilisateur) | Activé |
| Context7 | Oui (MCP utilisateur, clé API) | Aucune : le plugin aurait créé un doublon | Opérationnel, testé (résolution « Firebase ») |
| Playwright | Oui (MCP utilisateur) | Aucune : le plugin officiel lance le même paquet | Opérationnel, testé (navigation, capture, console sur le site local) |
| Claude Code Setup | Non | Plugin officiel installé (utilisateur) | Activé |
| Security Guidance | Non | Plugin officiel installé (utilisateur) | Activé (voir § 7) |
| Code Review | Oui (commande intégrée `/code-review` + skill `code-review-and-quality`) | Plugin non installé (doublon) | Disponible |
| Code Simplifier | Oui (commande intégrée `/simplify` + skill `code-simplification`) | Plugin non installé (doublon) | Disponible |
| Impeccable | Oui (v4.8.0, skill + 4 agents + hooks) | Vérifié : `impeccable context` fonctionne sur `index.html` | Opérationnel ; `PRODUCT.md` à créer (`/impeccable init`) |
| TypeScript LSP | Non | Non installé : pas de TS, JS intégré dans du HTML (non analysé par le LSP) | Non applicable |
| Pyright LSP | Non | Non installé : pas de Python | Non applicable |
| GitHub MCP | Non | Non installé : nécessite un jeton GitHub (votre accord) | En attente de décision |
| Supabase MCP | Non | Non installé : Supabase n'est qu'une option côté client | Non justifié |
| Cloudflare MCP | Non | Non installé : aucun usage de Cloudflare | Non justifié |

## 5. Configuration du projet (fichiers créés)

| Fichier | Partagé (Git) | Contenu |
|---|---|---|
| `CLAUDE.md` | Oui | Architecture, règles (données pédagogiques, DA, typographie, licences, pas de commit/push sans accord), vérification |
| `.claude/settings.json` | Oui | Confirmation demandée pour `git commit/push/reset/rebase/checkout --` et `firebase deploy` ; lecture interdite des `.env` et clés de service Firebase ; hook de vérification |
| `.claude/hooks/check-index-js.mjs` | Oui | Après chaque Edit/Write de `index.html`, compile le script intégré (≈ 0,2 s) et signale toute erreur de syntaxe |
| `.claude/skills/kotonoha-monofichier/` | Oui | Naviguer et modifier le fichier de 5,7 Mo sans risque, `VERSION` du service worker, test navigateur |
| `.claude/skills/kotonoha-contenu-japonais/` | Oui | Contrôle des furigana `漢字{かな}`, lectures, niveau JLPT, naturel, traduction et typographie française |
| `.claude/skills/kotonoha-conception-pedagogique/` | Oui | Principes d'apprentissage, compatibilité des progrès, accessibilité |
| `KOTONOHA_ENVIRONNEMENT.md` | Oui | Ce document |

Inchangés : `.claude/settings.local.json` et `.impeccable/config.local.json` (personnels, déjà ignorés par Git). Pas de `.mcp.json` : tous les MCP utiles sont au niveau utilisateur, aucun secret dans le dépôt.

Couverture des domaines demandés : frontend/UX/UI (Impeccable en priorité, frontend-design), accessibilité et responsive (Impeccable, `web-design-guidelines`, `frontend-ui-engineering`), performance (`performance-optimization`), tests navigateur (Playwright), débogage et TDD (Superpowers, `debugging-and-error-recovery`, `test-driven-development`), revue (`/code-review`), sécurité (Security Guidance, `security-and-hardening`, Strix), architecture et docs (`api-and-interface-design`, `documentation-and-adrs`), données, pédagogie, internationalisation et japonais (skills `kotonoha-*`).

## 6. Commandes utiles

- `/impeccable audit index.html`, `/impeccable critique`, `/impeccable polish` · `/impeccable init` pour créer `PRODUCT.md`
- `/superpowers:brainstorming`, `/superpowers:writing-plans`, `/superpowers:executing-plans`, `/superpowers:systematic-debugging` (ces skills se déclenchent aussi d'elles-mêmes)
- `/code-review` (revue du diff), `/simplify` (simplification), `/security-review`
- `/claude-code-setup:claude-automation-recommender` (recommandations de skills, MCP, hooks et agents)
- `/kotonoha-contenu-japonais`, `/kotonoha-monofichier`, `/kotonoha-conception-pedagogique`
- `/mcp` (état des MCP), `/plugin` (plugins), `/agents`, `/hooks` (depuis un terminal `claude`)
- Test local : `python -m http.server 8765 --bind 127.0.0.1` puis demander à Claude de tester avec Playwright

## 7. Points d'attention

1. **Générateur de `index.html` introuvable** : à localiser avant la mission 2, sinon toute modification sera écrasée.
2. **Security Guidance** : en plus des avertissements instantanés, il lance une revue par Opus à chaque fin de tour et à chaque commit, ce qui consomme votre quota. Pour ne garder que les avertissements instantanés : variable d'environnement `ENABLE_CODE_SECURITY_REVIEW=0`. Sous Windows, la revue des commits peut demander `SG_AGENTIC_CLI_PATH` (chemin de `claude.exe`).
3. **Skills de design redondantes** : Impeccable, frontend-design, ui-ux-pro-max, design, ui-styling, design-system, banner-design, brand et 21st-* se recouvrent. Recommandation : Impeccable comme référence pour KOTONOHA ; envisager de désactiver les autres.
4. **`huggingface-skills`** (synchronisé depuis claude.ai) : MCP non authentifié et sans usage ici ; à désactiver depuis claude.ai si inutile.
5. **MCP `21st`** activé dans `settings.local.json` mais défini nulle part : sans effet.
6. **Playwright MCP** en `@latest` (non épinglé) : peut changer sans prévenir.
7. **Constat UI** (pour la mission 2, rien n'a été corrigé) : barre de défilement horizontal visible sur l'accueil à ~930 px de large.
8. `gh` (GitHub CLI) absent ; la skill `browser-testing-with-devtools` suppose un MCP Chrome DevTools non configuré (Playwright suffit).

## 8. Actions qui vous reviennent

- [ ] Indiquer où se trouve le générateur de `index.html`.
- [ ] GitHub MCP : souhaitez-vous l'installer ? (plugin officiel `github`, nécessite un jeton GitHub ; lecture seule recommandée).
- [ ] Optionnel : plugin officiel `firebase` (gestion Firestore/Auth) si vous voulez que Claude consulte votre projet Firebase (connexion Firebase requise).
- [ ] Décider du réglage de Security Guidance (§ 7.2) et du ménage des skills de design (§ 7.3).
- [ ] Redémarrer Claude Code pour que les nouveaux plugins soient chargés partout.
