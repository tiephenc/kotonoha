---
name: KOTONOHA · 言の葉
description: Un vieil izakaya de campagne teint au pochoir, où la séance d'étude du japonais se présente comme un noren de trois pans.
colors:
  bg: "#ECE2CB"
  paper: "#F7F0E0"
  paper-2: "#E8DBC0"
  paper-3: "#D8C6A3"
  ink: "#22180F"
  ink-2: "#47372A"
  ink-3: "#66523D"
  accent: "#A3302A"
  accent-text: "#92271F"
  accent-ink: "#FBF3E4"
  kaki: "#7A4220"
  noren: "#5E331C"
  noren-2: "#4B2814"
  rsv: "#F4EAD6"
  ai: "#2A3E63"
  matcha: "#4F6B2F"
  matcha-text: "#3F5726"
  sakura: "#C98C7E"
  gold: "#B47718"
  warn: "#7E5409"
  lamp: "#E59A2E"
  sea: "#3D6A64"
  dye-defi: "#3F5726"
  dye-fait: "#6E5A44"
  beam-light: "#B8895A"
  beam-mid: "#7A5230"
  beam-dark: "#5A3A20"
  bg-nuit: "#15100C"
  paper-nuit: "#201811"
  paper-2-nuit: "#2A2018"
  paper-3-nuit: "#3A2C1F"
  ink-nuit: "#F2E5CB"
  ink-2-nuit: "#DCCBA9"
  ink-3-nuit: "#B9A684"
  accent-nuit: "#F0705F"
  accent-text-nuit: "#F28B78"
  accent-ink-nuit: "#1A0E0A"
  kaki-nuit: "#D28A52"
  noren-nuit: "#1B2640"
  noren-2-nuit: "#141C31"
  rsv-nuit: "#F3E2C0"
  ai-nuit: "#9DB2DA"
  matcha-nuit: "#9EBB72"
  matcha-text-nuit: "#B3CC8B"
  sakura-nuit: "#E3A497"
  gold-nuit: "#F2B04F"
  lamp-nuit: "#F6B451"
  sea-nuit: "#89BDB2"
  dye-lecon-nuit: "#7E2620"
  dye-defi-nuit: "#2F421D"
  dye-fait-nuit: "#3A2E22"
typography:
  monumental-kanji:
    fontFamily: "Dela Gothic One, Shippori Mincho B1, serif"
    fontSize: "clamp(48px, 6.6vw, 92px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  monumental-latin:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(18px, 1.9vw, 26px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.14em"
  duration:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "1.75em"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Shippori Mincho B1, Hiragino Mincho ProN, Yu Mincho, serif"
    fontSize: "clamp(30px, 4.4vw, 50px)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "0"
  title:
    fontFamily: "Shippori Mincho B1, Hiragino Mincho ProN, Yu Mincho, serif"
    fontSize: "clamp(19px, 2.1vw, 24px)"
    fontWeight: 800
    lineHeight: 1.3
  subtitle:
    fontFamily: "Shippori Mincho B1, Hiragino Mincho ProN, Yu Mincho, serif"
    fontSize: "17px"
    fontWeight: 700
  body:
    fontFamily: "Zen Kaku Gothic New, Hiragino Sans, Yu Gothic, system-ui, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.7
  meta:
    fontFamily: "Zen Kaku Gothic New, Hiragino Sans, Yu Gothic, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0"
  label:
    fontFamily: "Zen Kaku Gothic New, Hiragino Sans, Yu Gothic, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 700
rounded:
  tissu: "2px"
  pli: "3px"
  sm: "4px"
  r: "6px"
  rond: "50%"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "22px"
  xl: "26px"
  section: "44px"
  wrap: "1180px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pli}"
    padding: "10px 20px"
  button-primary-big:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pli}"
    padding: "13px 26px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pli}"
    padding: "10px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
  button-tool:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.rond}"
    size: "38px"
  button-focus:
    backgroundColor: "{colors.noren}"
    textColor: "{colors.rsv}"
    rounded: "{rounded.pli}"
    padding: "8px 16px"
  noren-head:
    backgroundColor: "{colors.noren}"
    textColor: "{colors.rsv}"
    typography: "{typography.monumental-kanji}"
    padding: "18px 190px 18px 26px"
  noren-pane:
    backgroundColor: "{colors.noren}"
    textColor: "{colors.rsv}"
    rounded: "{rounded.pli}"
    padding: "22px 22px 22px"
  noren-pane-lecon:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.rsv}"
  noren-pane-defi:
    backgroundColor: "{colors.dye-defi}"
    textColor: "{colors.rsv}"
  noren-pane-fait:
    backgroundColor: "{colors.dye-fait}"
    textColor: "{colors.rsv}"
  pane-go:
    backgroundColor: "{colors.rsv}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tissu}"
    padding: "11px 14px"
  timer:
    backgroundColor: "{colors.lamp}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tissu}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    padding: "22px 24px"
  tag-n3:
    backgroundColor: "rgba(42, 62, 99, .1)"
    textColor: "{colors.ai}"
    typography: "{typography.label}"
    rounded: "{rounded.tissu}"
    padding: "2px 8px"
  tab-current:
    backgroundColor: "{colors.noren}"
    textColor: "{colors.rsv}"
    padding: "8px 14px 11px"
  kamon-own:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.rsv}"
    rounded: "{rounded.pli}"
    padding: "12px 8px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pli}"
    padding: "5px 8px"
---

# Design System: KOTONOHA · 言の葉

## Overview

**Creative North Star: "Le noren teint au pochoir"**

KOTONOHA est un vieil izakaya de campagne vu à travers sa teinture : des aplats teints au katazome (kakishibu brun, rouge garance, vert mousse, indigo la nuit) d'où ressortent des filets et motifs **réservés en blanc**, comme les ponts d'un pochoir. Le tissu porte la structure (tête de noren, pans de séance, onglet courant, toasts), le papier écru porte la lecture. Les surfaces de lecture restent unies ; le décor vit sur les bandes, jamais sous le texte.

Le même lieu existe à deux heures. Le jour : coton écru, bois clair, mousse, kakishibu. La nuit (19 h à 7 h par défaut, ou forcée par la lanterne de l'en-tête) : bois sombre, toile indigo-noir, lanternes ambrées, rouge profond. Tous les jetons ont leur équivalent de nuit ; aucun composant ne code une seule ambiance.

La typographie fait l'interface : un kanji monumental en Dela Gothic One, une ligne latine en Anton et des durées en Anton donnent la hiérarchie sans icônes ni cartes de statistiques. Le mouvement est celui d'un tissu pendu : les pans se déroulent, ondulent au survol, l'étape en cours descend d'un cran ; tout s'arrête sous `prefers-reduced-motion`.

**Key Characteristics:**
- Aplats teints avec bande de réserve blanche (feuilles de « kotonoha » et crosses de fougère) sur les tissus.
- Deux ambiances complètes, jour et nuit, contrastes WCAG AA vérifiés sur chaque fond.
- Coins nets de tissu et de bois : rayons de 2 à 6 px.
- Grain de cloth (bruit fractal) sur les teintures, grain de bois sur le fond.
- Monumental réservé aux grandes tailles ; mincho pour les titres et petits kanji ; gothique pour le corps.

## Colors

Une palette de teinturier : quatre teintures saturées et profondes sur un coton écru, plus une lumière de lanterne ambrée.

### Primary
- **Rouge garance** (accent / accent-nuit) : bouton principal, pan « Leçon », trait de l'onglet secondaire courant, kamon obtenu, barre de progression par défaut. Le texte rouge utilise toujours `accent-text`, plus sombre le jour et plus clair la nuit, pour tenir l'AA.
- **Kakishibu** (noren, noren-2 ; kaki) : la teinture du lieu. Tête de noren, pan « Réviser », onglet courant, bouton Focus, toasts, barre d'onglets mobile ; `kaki` pour la lisière de la poutre d'en-tête. La nuit, le noren devient **indigo** (noren-nuit).

### Secondary
- **Vert mousse** (matcha, matcha-text, dye-defi) : pan « Défi et pratique », niveau N4, état « fait », jardin.
- **Indigo ai** (ai) : niveau N3, plans, jour courant du journal, contrôles de carte.

### Tertiary
- **Lumière de lanterne** (lamp) : anneau de focus (3 px), lanterne allumée par étape faite, étiquette d'état de l'étape en cours, minuteur, ligne latine monumentale, curseur « maintenant » de la frise. Jamais en texte sur papier clair.
- **Or, sakura, mer** (gold, warn, sakura, sea) : états du journal et étiquettes de nature des fiches de kamon (fait, tradition, légende, interprétation) ; usage local, en fond adouci `*-soft`.

### Neutral
- **Coton écru** (bg, paper, paper-2, paper-3) : fond de page avec grain de bois, surfaces de lecture, fonds secondaires, pistes de barres.
- **Encre de suie** (ink, ink-2, ink-3) : texte, texte secondaire, métadonnées. Filets en `rgba` de l'encre à 16 % et 32 % (`--line`, `--line-2`).
- **Réserve** (rsv, rsv-2 à 78 %) : tout ce qui est écrit ou dessiné sur une teinture ; c'est le blanc du pochoir, jamais un blanc pur.
- **Bois de la perche** (beam-light, beam-mid, beam-dark ; nuit `#5C4128`, `#3A2817`, `#26190D`) : dégradé de la poutre qui porte les pans.

### Named Rules
**La règle de la réserve.** Sur une teinture, le texte et les motifs sont en `rsv`/`rsv-2`, jamais en blanc pur ni en couleur ; seules la lanterne (`lamp`) et ses dérivés font exception.

**La règle des deux heures.** Toute nouvelle couleur se déclare deux fois, dans `:root` et dans `:root[data-theme="nuit"]` ; une teinte de pan change de teinture la nuit (rouge garance vers `#7E2620`, mousse vers `#2F421D`), elle ne s'éclaircit pas.

**La règle du texte rouge.** Le rouge en texte passe par `accent-text`, jamais par `accent`.

## Typography

**Monumental kanji :** Dela Gothic One (repli Shippori Mincho B1)
**Monumental latin et durées :** Anton (repli Arial Narrow)
**Titres :** Shippori Mincho B1 (repli Hiragino Mincho ProN, Yu Mincho)
**Corps :** Zen Kaku Gothic New (repli Hiragino Sans, Yu Gothic, system-ui)

**Character :** une enseigne peinte (Dela, Anton) au-dessus d'un registre manuscrit soigné (mincho) et d'un corps gothique net, lisible sur de longues séances.

### Hierarchy
- **Monumental kanji** (Dela 400, clamp(48px, 6.6vw, 92px), 0.92, -0.02em ; 38 px au plus petit) : titre de séance dans la tête de noren, grand caractère d'onglet en filigrane (clamp(160px, 24vw, 340px), opacité 0.055, 0.07 la nuit, masqué sous 760 px).
- **Monumental latin** (Anton 400, clamp(18px, 1.9vw, 26px), 0.14em, capitales, couleur lanterne) : sous-titre latin de la séance.
- **Durées** (Anton 400, 1.75em dans les titres de pan ; 17 px pour le total de frise ; numéros d'étape 30 px) : toute durée en minutes, chiffres tabulaires.
- **Headline** (Shippori 800, clamp(30px, 4.4vw, 50px), 1.12) : h1 de page, sans capitales ni filet décoratif.
- **Title** (Shippori 800, clamp(19px, 2.1vw, 24px), 1.3) : h2 ; dans les pans, clamp(21px, 2.2vw, 27px) en réserve.
- **Subtitle** (Shippori 700, 17 px) : h3.
- **Body** (Zen Kaku 400, 16.5 px, 1.7) : texte courant ; phrases d'accueil limitées à 60ch. Petit texte 13.5 px.
- **Meta** (Zen Kaku 700, 13 px, 1.4, ink-3, casse de phrase) : ligne de métadonnées `xmeta`.
- **Label** (Zen Kaku 700, 11.5 à 12.5 px) : tags de niveau ; les étiquettes d'état sur tissu passent en capitales espacées (0.04 à 0.08em).

### Named Rules
**La règle du monumental.** Dela Gothic One ne sert qu'au-delà de ~38 px. Les petits kanji (onglets, marque, emblèmes de pan, sceau de reprise, 済) sont en Shippori Mincho 800.

**La règle des durées.** Une durée s'écrit en Anton, alignée à droite, et les durées d'une séance totalisent exactement la séance.

## Layout

Colonne centrale de 1180 px (`.wrap`). L'en-tête est collant, sur le fond, posé sur une poutre de 5 px (dégradé kaki vers noren-2). Sous l'en-tête : la bande de sous-rubriques, puis le contenu. La page Aujourd'hui empile la tête de noren, la perche, trois pans en grille 3 colonnes (gouttière 10 px), la frise horaire (barre de 14 px puis liste en colonnes de 240 px minimum, 34 px d'écart), la lisière du jardin (150 px, 96 px sur mobile), puis « après la séance » (44 px au-dessus, grille 1fr/2fr).

Rythme observé : 6, 10, 14, 18, 22, 26, 44 px. Cartes à 22 × 24 px de rembourrage, pans à 22 px.

Points de rupture : 1080 px (onglets resserrés, kanji d'onglet masqué), 960 px (pans en une colonne, l'étape en cours ne descend plus), 760 px (onglets en barre fixe en bas, 6 colonnes, filigrane masqué), 560 px (tête de noren compacte, phrase d'accueil masquée, sous-rubriques défilantes), 400 px.

## Elevation & Depth

Hybride : le papier repose sur des ombres douces et basses ; le tissu pend avec une ombre portée plus longue et plus chaude. Pas de flou de verre dans l'en-tête ; la profondeur vient de la superposition poutre, tissu, papier, et des trois couches du jardin en parallaxe.

### Shadow Vocabulary
- **Papier** (`0 1px 0 rgba(34,24,15,.07), 0 12px 24px -16px rgba(60,35,15,.45)` ; nuit `0 1px 0 rgba(0,0,0,.35), 0 14px 30px -16px rgba(0,0,0,.75)`) : cartes, lectures, unités, bouton Focus.
- **Papier soulevé** (`0 2px 0 rgba(34,24,15,.07), 0 22px 36px -18px rgba(60,35,15,.55)` ; nuit `0 2px 0 rgba(0,0,0,.35), 0 24px 44px -18px rgba(0,0,0,.85)`) : survol des stations et kamon, cartes retournées, toasts.
- **Tissu pendu** (`0 16px 26px -18px rgba(30,15,5,.8)`, étape en cours `0 26px 36px -18px rgba(30,15,5,.85)`) : pans et tête de noren.
- **Poutre** (`0 6px 10px -6px rgba(40,20,5,.7)`) : la perche de bois.
- **Ourlet** (`inset 0 -3px 0 rgba(0,0,0,.18)`) : bas du pan d'onglet courant.
- **Halo de lanterne** (`drop-shadow(0 0 8px var(--lamp))`) : lanternes allumées et lanterne du jardin, la nuit ; route active de la carte (`drop-shadow(0 0 6px rgba(242,196,106,.9))`).

### Named Rules
**La règle de ce qui est allumé.** Un halo ne marque que ce qui est allumé : lanternes et lanterne de pierre la nuit, route active et lieux ouverts sur la carte. Rien d'éteint ni de purement décoratif ne rayonne.

## Shapes

Le tissu et le bois ont des coins nets. Rayons de 2 px (tissu fin, étiquettes, bouton de pan, minuteur), 3 px (boutons, champs, ourlet des pans, kamon), 4 px (unités, options), 6 px (cartes, panneaux, carte du Japon, salle de détente, Focus). Le cercle est réservé aux outils ronds de l'en-tête (38 px), au point de lanterne de l'onglet courant et du curseur de frise, aux compteurs en pastille. Les pans ont le haut droit (ils pendent) et seulement le bas adouci (0 0 3px 3px). Puces en losange (6 px tourné à 45°) dans les pans. La perche est un cylindre (rayon 7 px sur 14 px de haut).

## Components

### Tête de noren
Bande teinte tendue en haut de la séance, sans rayon : grille titre monumental / colonne de métadonnées, motif de réserve en bas (bande de 14 px, motif 28 px), renard d'origine assis à droite (132 px, 100 px, 76 px). Contient la date, la ligne de séance, la phrase d'accueil en mincho 700 16.5 px, le minuteur (fond lanterne) et la reprise (sceau mincho sur carré de réserve, 30 px).

### Perche et pans de noren
Une poutre de bois (14 px) porte trois pans teints : Réviser (kakishibu, indigo la nuit), Leçon (garance), Défi et pratique (mousse). Chaque pan : bande de réserve en haut (16 px, motif 32 px), emblème d'origine dans un cadre de réserve (58 × 66 px, bord 2 px rsv-2, rayon 2 px), numéro et durée en Anton, puces en losange, chaîne d'activités en filets pointillés de réserve, barre de progression de 6 px (piste noire à 28 %, remplissage lanterne), bouton de réserve qui glisse de 3 px vers la droite au survol.
- **États :** étape en cours descendue de 10 px, ombre allongée, étiquette d'état sur fond lanterne ; étape faite reteinte en brun éteint (dye-fait), activités faites barrées avec 済 en lanterne.
- **Mouvement :** déroulé à l'entrée (scaleY depuis 0.2, 0.9 s, décalé de 80 ms), ondulation au survol (skewX -1.6° puis 1°, 1.6 s).

### Lanternes d'étape
Une lanterne SVG de 18 px pend au-dessus de chaque pan ; elle s'allume (corps lanterne) quand l'étape est finie. La nuit, corps éteint brun sombre, allumée avec halo et lueur lente (3 s).

### Onglets (noren d'onglet)
Six onglets en texte gothique 700 14 px, ink-2, précédés d'un petit kanji mincho en rouge texte. L'onglet courant reçoit un pan de noren teint qui se déroule depuis la poutre (scaleY, 0.45 s), texte en réserve, point de lanterne de 5 px en bas. Sous 760 px : barre fixe en bas, teinte noren-2, lisière kaki de 3 px, onglet courant en garance.

### Bande de sous-rubriques
Liens gothique 700 14 px sur un filet `line-2` ; la rubrique courante passe en encre avec un trait garance de 3 px posé sur le filet. Défilement horizontal sans barre sous 560 px.

### Ligne de métadonnées (xmeta)
Ligne factuelle au-dessus d'un h1 (activité, niveau, unité, registre, séparés par « · ») en meta ink-3, casse de phrase, sans espacement de lettres. Elle porte des données, jamais un slogan ni un surtitre inventé.

### Boutons
- **Principal :** garance, rayon 3 px, 700, ombre teintée `0 10px 18px -12px` de l'accent ; survol +8 % de luminosité et -1 px ; appui +1 px et 0.985.
- **Secondaire :** transparent, bord encre 1.5 px ; survol en encre pleine.
- **Outils ronds :** 38 px, bord `line-2` 1.5 px ; survol en encre pleine. La lanterne d'en-tête bascule jour et nuit.
- **Focus :** tissu noren avec grain, réserve, rayon 3 px ; actif en garance.

### Cartes et champs
Papier, bord `line` 1 px, rayon 6 px, ombre papier. Stations : soulevées de 3 px au survol ; leur emblème est un carré teint de 56 px (couleur tournante noren, garance, mousse, kaki) avec double filet intérieur de réserve. Champs : rayon 3 px, bord `line-2` 1.5 px, papier ; caret et accent garance.

### Kamon
Chaque kamon obtenu est un **sceau de réserve sur carré teint** : carré garance avec grain, rayon 3 px, motif en `rsv`. Non obtenu : transparent, bord pointillé, motif à 28 %. Révélation : sceau qui frappe (scale 1.8 et -14° vers repos, 0.7 s).

### Frise horaire
Barre segmentée (3 px d'écart) aux couleurs des pans, pauses en hachures de papier ; curseur « maintenant » en trait d'encre avec tête lanterne. Liste horaire en colonnes, heures en ink-3 et chiffres tabulaires, durées à droite, total en Anton sous un filet d'encre de 2 px.

### Lisière du jardin
Trois couches SVG (colline pâle, cèdres, mousse et fougères) avec une lanterne de pierre, en parallaxe verticale légère (profondeurs 0.05, 0.1, 0.18 ; 36 px maximum). La nuit, couches sombres et lanterne de pierre allumée. Décorative, `aria-hidden`, désactivée sous mouvement réduit.

### Kitsune
Le renard d'origine, masque géométrique crème, marques vermillon (`#C8263A`, `#E0473F` la nuit), col teint à vagues seigaiha en réserve. Six poses qui ne changent que regard, oreilles, inclinaison et objet : accueil, étude (pinceau), focus (lanterne), repos (thé), sommeil, célébration. Respiration, clignement et balancement seulement si le mouvement est permis ; immobile dans la marque.

### Mouvement global
Courbe unique `cubic-bezier(.16, 1, .3, 1)`. Changement d'onglet par View Transitions (sortie 0.28 s vers le haut, entrée 0.5 s depuis 14 px), en-tête exclu. Bascule jour et nuit en fondu de 0.6 s. Apparitions au défilement dans « après la séance » quand `animation-timeline` existe. Sous `prefers-reduced-motion: reduce`, transitions, déroulés, ondulations, parallaxe, lueurs et animations du renard sont coupés.

## Do's and Don'ts

### Do:
- **Do** poser le texte d'un tissu en réserve (`rsv`, `rsv-2`) et recouvrir chaque teinture du grain `--cloth`.
- **Do** déclarer chaque jeton et chaque teinture de pan pour le jour et pour la nuit.
- **Do** garder les rayons entre 2 et 6 px ; cercles uniquement pour les outils ronds, points et pastilles.
- **Do** écrire les durées en Anton, alignées à droite, avec un total exact.
- **Do** réserver Dela Gothic One aux tailles de ~38 px et plus ; mincho 800 pour les petits kanji.
- **Do** couper toute animation décorative sous `prefers-reduced-motion: reduce`.
- **Do** utiliser la ligne `xmeta` pour des métadonnées réelles, en casse de phrase.

### Don't:
- **Don't** mettre de motif ni de grain sous un texte de lecture : le décor vit sur les bandes de tissu.
- **Don't** écrire en `accent` ou en `lamp` sur papier clair ; passer par `accent-text`.
- **Don't** ajouter de surtitre en capitales espacées au-dessus d'un titre ; la classe héritée `.eyebrow` est neutralisée en ligne de métadonnées.
- **Don't** arrondir les panneaux au-delà de 6 px.
- **Don't** utiliser Dela Gothic One en petite taille.
- **Don't** donner de halo à un élément éteint ou purement décoratif.
