---
name: kotonoha-contenu-japonais
description: Vérifier, relire ou rédiger du contenu japonais de KOTONOHA (phrases d'exemple, furigana, lectures, sens français, niveau JLPT, vocabulaire, kanji). À utiliser avant toute modification des données pédagogiques de index.html (UNITS, SORT, JMV, KVG, paquets de vocabulaire) ou pour auditer leur qualité.
---

# Qualité du contenu japonais — KOTONOHA

## Règle d'or

Les données pédagogiques sont le cœur du site. **Ne jamais les modifier sans demande explicite de l'utilisateur.** En mode audit, produire une liste de constats (emplacement, problème, correction proposée, source) et attendre la validation.

## Où sont les données (index.html)

- `const UNITS = {` (l. ~1108) : 210 unités. Chaque unité : `intro`, `grammar[]` (`id`, `pat`, `form`, `mean`, `expl`, `ex: [[japonais, français], …]`), etc.
- `const SORT` (l. ~9119) : exercices de remise en ordre, une seule ligne d'environ 200 ko.
- `window.JMV` (l. ~9513) : vocabulaire extrait de JMdict (CC BY-SA 4.0) : ne pas réécrire à la main, ne pas retirer la source.
- `const KVG` (l. ~9523) : tracés KanjiVG (CC BY-SA 3.0) : ne jamais éditer à la main.
- Lire avec Grep puis Read `offset`/`limit` : jamais le fichier entier.

## Format des furigana

`漢字{かな}` : la lecture entre accolades suit **immédiatement** le bloc de kanji qu'elle couvre (`毎日{まいにち}`, `帰{かえ}ります`). Vérifier :
1. chaque accolade suit un kanji (pas de kana nu avant `{`) ;
2. la lecture est en hiragana (katakana seulement pour une lecture on présentée comme telle) ;
3. l'okurigana reste hors des accolades (`食{た}べる`, pas `食べる{たべる}`) ;
4. les lectures spéciales (jukujikun : 今日{きょう}, 一人{ひとり}, 大人{おとな}) couvrent le mot entier ;
5. accolades équilibrées, pas d'espace parasite.

## Liste de contrôle d'une phrase

- **Exactitude** : lecture et sens conformes à JMdict / KANJIDIC (via Context7 ou la source EDRDG, jamais de mémoire seule pour un cas douteux).
- **Niveau** : vocabulaire et grammaire compatibles avec le niveau de l'unité (N4 : unités 1–55, N3 : 56–129, N2 : 130–210). Signaler un kanji ou un point de grammaire hors niveau.
- **Naturel** : phrase qu'un locuteur natif dirait ; registre cohérent (です/ます vs forme neutre) dans une même phrase.
- **Ponctuation japonaise** : 「」, 。, 、, espace idéographique `　` uniquement là où elle sépare des éléments listés.
- **Traduction française** : fidèle mais idiomatique ; typographie française (espace insécable avant `: ; ? !`, guillemets « », heures « 19 h ») ; pas de calque.
- **Explication** : exacte, sans surgénéralisation ; mentionner les exceptions courantes.
- **Cohérence** : même terme grammatical partout (groupe 1/2/3, transitif/intransitif…).

## Rapport attendu

| Emplacement (unité / id / ligne) | Problème | Proposition | Source / certitude |

Classer : erreur factuelle > niveau inadapté > manque de naturel > typographie.
