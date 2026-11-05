# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Un apprenant francophone (l'auteur, étudiant en LCSA à Aix-Marseille Université, et d'autres apprenants autonomes) qui prépare le JLPT du N4 au N2 seul, en longues séances quotidiennes (environ 4 heures), sur ordinateur, tablette et téléphone. En ouvrant le site, il doit savoir immédiatement quoi étudier pendant la séance à venir et pouvoir la reprendre là où il l'a laissée.

## Product Purpose

Site gratuit et installable (PWA, hors connexion) qui organise tout le travail JLPT : parcours de 210 unités, répétition espacée, vocabulaire, kanji, écoute, lecture, expression, examens blancs. Le succès : des séances régulières et sereines, une maîtrise réelle mesurée honnêtement, sans pression.

## Positioning

Une séance du jour construite à partir des données réelles de l'apprenant (cartes dues, prochaine section du parcours, compétence la plus fragile), dans un univers chaleureux qui récompense l'effort par un voyage et des kamon documentés, sans jamais confondre ces récompenses avec le niveau de japonais.

## Operating Context

- Séance quotidienne d'environ 4 heures, réglable, découpée en trois étapes (Réviser, Avancer, Défi et pratique) avec des pauses prévues ; minuteur Focus et reprise de séance.
- Navigation en six onglets : Aujourd'hui, Apprendre (parcours, unités, vocabulaire, Lire), Pratiquer (Réviser, S'entraîner, atelier, examens blancs), Voyager (carte, kamon, culture), Détente, Profil (progrès, maîtrise, calendrier, carnet, réglages). Les anciennes adresses (#revision, #progres…) restent valides.
- Pauses dans une salle de détente sans japonais, de 30 s à 9 min.

## Capabilities and Constraints

- Site statique : `index.html` (≈ 5,7 Mo, script et données inline, modifié directement, générateur introuvable) et modules `app/*.js|css` ; GitHub Pages (https://tiephenc.github.io/kotonoha/) ; service worker à versionner à chaque publication.
- Données pédagogiques intouchables : 210 unités, 628 points de grammaire, vocabulaire, kanji, JMdict, KanjiVG (contrôle : `npm run check`). Le corpus Anki de l'utilisateur (11 041 notes, 1 890 identifiants bloqués) vit dans son navigateur : aucune suppression, fusion, déduplication ni modification destructive.
- Progression dans `localStorage` (`S`), synchronisable via Firebase/Supabase ; toute migration est additive.
- Points de voyage calculés sur l'activité réelle, distincts de la maîtrise ; rien de pédagogique n'est bloqué ; aucun malus pour une pause.
- Sons jamais automatiques. Mini-jeux sans score, classement, série ni pénalité.

## Brand Commitments

- Nom KOTONOHA · 言の葉. Mascotte : Kitsune, le renard guide ; la version d'origine (masque géométrique, marques rouges, vagues seigaiha, `kitsune()` dans `index.html`) est la référence de style voulue : expressif, dessiné, mature, pas kawaii.
- Les trois emblèmes d'étapes d'origine (`hanaArt` : cartes pour Réviser, torii et soleil pour Avancer, éclair pour le Défi) sont à conserver.
- Kamon à la place des badges, chacun documenté et sourcé ; faits, traditions et interprétations distingués ; rien d'inventé.
- Ton : bienveillant, sans culpabilisation, honnête sur ce qui est mesuré.

## Evidence on Hand

- Fiches de kamon et de destinations sourcées dans `app/kamon-data.js` et `app/voyage-data.js`.
- Sons d'ambiance dans `sons/` (pluie, oiseaux, ruisseau, feu, vent, vagues, nuit d'été, orage, café).
- Aucun audio humain, aucune illustration d'artiste, aucun témoignage : ne pas en inventer.

## Product Principles

1. Ouvrir le site, c'est savoir quoi faire pendant les prochaines heures.
2. Mesurer honnêtement : la maîtrise réelle d'un côté, les récompenses de l'autre.
3. Le repos fait partie du travail ; jamais de pression ni de culpabilité.
4. Ne jamais perdre une donnée de l'apprenant.
5. Une application d'étude, pas un jeu de rôle ni un site vitrine.

## Accessibility & Inclusion

WCAG 2 AA (contrôlé par axe-core), clavier partout, `prefers-reduced-motion` respecté, lecture longue confortable de jour comme de nuit, performances mobiles.
