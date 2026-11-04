# KOTONOHA — fonctionnalités

État réel au 4 novembre 2026.

Légende :
- ✅ **Opérationnel et testé** ;
- 🟡 **Partiel** : fonctionne, avec une limite précisée ;
- ⛔ **Dépend d'un service externe non configuré**.

Le nom des tests renvoie aux fichiers de `tests/` (Playwright).

## Fonctionnalités existantes, conservées

Ces fonctionnalités ont été conservées sans refonte :
- parcours de 210 unités, avec grammaire, entraînement, vocabulaire, kanji, lecture, écoute et test ;
- révisions SM-2, vocabulaire Core et JMdict (FSRS) ;
- examens blancs, diagnostic et tests chronométrés ;
- carnet d'erreurs ;
- écriture des kanji (KanjiVG) et laboratoire d'écoute ;
- XP et badges ;
- minuteur Focus (renard, ambiances, Spotify et YouTube sur demande) ;
- comptes Firebase et Supabase, sauvegarde, recherche Ctrl+K.

Vérification : `smoke.spec.js` parcourt 13 écrans et contrôle la persistance.

## Ajouts et améliorations

| Fonctionnalité | État | Fonctionnement | Limites | Tests |
|---|---|---|---|---|
| Temps actif | ✅ | Compté par tranches de 5 s si la page est visible, sur un écran d'apprentissage, avec une action dans la minute (ou une écoute en cours). La présence est comptée à part. | Mesure à partir du 4/11/2026 ; rien n'est rétroactif. | `temps.spec.js` |
| Calendrier adaptatif (`#calendrier`) | ✅ | Jours habituels, séance prévue / faite / en plus / non faite / reportée, repos, pauses ; rythme jusqu'à l'examen ; carte « Bon retour » après 7 jours d'absence. Aucun vocabulaire culpabilisant. | Une séance compte comme faite à partir de 10 min actives, 10 XP ou 10 révisions. | `temps.spec.js` |
| Maîtrise (`#maitrise`) | ✅ | Pour chaque unité : consultée, terminée, comprise (test ≥ 70 %), maîtrisée (80 % des cartes à 21 jours ou plus, sans oublis répétés). | Calculée sur les données existantes. | `temps.spec.js` |
| Hésitations en révision | ✅ | Délai avant de retourner la carte. Au-delà de 12 s (20 s pour la grammaire), « Bien » devient « Difficile » et « Facile » devient « Bien » pour l'intervalle. Désactivable. | Mesures non synchronisées en ligne. | `temps.spec.js` |
| Dictionnaire contextuel | 🟡 | Correspondance la plus longue sur le vocabulaire des unités, les paquets Anki, le Core importé et JMdict (8 188 mots, sens anglais), plus déflexion japonaise et segmentation ICU. Popup : lecture, sens, source, catégorie (JMdict), kanji, écoute, tracé, ajout aux révisions ou à « Mes mots ». | Version publique sans vocabulaire N5 de base (il vient du Core importé), donc 書く ou 見る restent sans définition (lien Jisho). Pas d'analyseur morphologique complet (MeCab, kuromoji). | `lecture.spec.js` |
| Lire (`#lire`) | ✅ | 157 textes du parcours classés N4, N3, N2 (lus ou non). Lectures personnelles : titre, source, date, adresse, texte collé, niveau estimé, vocabulaire et kanji, questions-guides, résumé et notes, historique. | Le niveau estimé est indicatif. Aucune question générée pour un texte externe. | `lecture.spec.js` |
| Actualités | 🟡 | Sources officielles (NHK NEWS WEB EASY, NHK NEWS WEB, MATCHA やさしい日本語) et marche à suivre ; l'extrait collé est traité comme une lecture « Actualité ». | KOTONOHA ne récupère aucun article (droits d'auteur, aucun serveur). Les résumés sont écrits par l'apprenant. | `lecture.spec.js` |
| Expression écrite (`#atelier`) | 🟡 | 12 sujets N4 à N2 (consigne, longueur, points visés reliés aux unités, aide facultative), brouillon automatique, historique. Vérifications de forme : longueur, registre, ponctuation, espaces, particule doublée, points visés, mots hors dictionnaire. | Correction détaillée ⛔ : par Claude seulement dans un artefact claude.ai (`window.claude.complete`) ; sinon, consigne prête à copier puis correction recollée et conservée. | `atelier.spec.js` |
| Conversation guidée | ✅ | 6 scénarios (restaurant, notes de cours, retard au travail, médecin, entretien d'embauche, débat), 4 tours chacun. Réponses proposées ou libres ; explications après chaque réplique (facultatives) ; bilan ; lecture à voix haute facultative ; dictée vocale si le navigateur la propose. | Contenu relu par l'agent linguiste. La dictée de Chrome envoie l'audio à Google (signalé dans l'interface). | `atelier.spec.js` |
| Conversation libre | ⛔ | Avec Claude dans un artefact claude.ai ; sinon, consigne de jeu de rôle à copier. | Aucune clé d'API dans le site. | `atelier.spec.js` (consigne) |
| Carte du parcours (`#carte`) | ✅ | Niveaux, modules et unités colorés par maîtrise, fil des prérequis. Vue d'une unité : grammaire et kanji (état des cartes, difficultés), unités avant et après, kanji partagés, contrastes tirés des notes de nuance. Version texte. | Contrastes repérés automatiquement dans les notes. | `carte-culture.spec.js` |
| Salle de détente (`#detente`) | ✅ | Durées au choix, 5 expériences (sable, carillon, rizières, lucioles, souffle), fin en trois choix, ressenti facultatif, aucun son automatique, renard discret. Accès par l'en-tête et pendant la pause Focus. | Voir `KOTONOHA_PAUSES_ET_MINIJEUX.md`. | `detente.spec.js` |
| Culture (`#culture`) | ✅ | Jours fériés calculés selon la loi (lundis mobiles, reports, jour chômé intercalé), équinoxes publiées, 8 coutumes avec sources ; annonce discrète sur l'Accueil. | Coutumes aux dates usuelles (お盆 varie selon les régions). Équinoxes renseignées jusqu'en 2028. | `carte-culture.spec.js` |
| Kamon historiques | ✅ | 6 blasons documentés (Takeda, Sanada, Hosokawa, Shimazu, Toki/Akechi, mitsudomoe), dessins simplifiés et sourcés, obtenus aux grandes étapes. Les blasons générés de Progrès sont signalés comme créations originales. | Dessins schématiques, pas des reproductions. | `carte-culture.spec.js` |
| Carnet (`#carnet`) | ✅ | Notes libres datées, étiquettes, recherche, modification, suppression confirmée ; tuile dans Profil. | Sur l'appareil (inclus dans l'export). | `carnet.spec.js` |
| Hors connexion | ✅ | Page et modules mis en cache par le service worker. | Non testable sous Firefox et WebKit avec Playwright. | `pwa-a11y.spec.js` |
| Accessibilité | 🟡 | Clavier partout dans les nouveaux espaces, focus visible, `prefers-reduced-motion`, version texte de la carte. Contrastes du thème clair corrigés. | Reste un contraste préexistant sur l'Accueil (`.bighead p`). | `pwa-a11y.spec.js` |

## Demandé mais non réalisé (ou partiel)

- **Tests de positionnement et évaluation adaptative :** l'existant propose un diagnostic, des examens blancs, des tests chronométrés et une estimation du niveau. Aucun test adaptatif item par item n'a été ajouté.
- **Explications grammaticales plus détaillées :** le contenu des 210 unités n'a pas été réécrit (consigne de protection des données pédagogiques). Champs déjà présents : `intro`, `expl`, `nuance`, exemples.
- **Audios humains :** l'écoute reste en synthèse vocale, ce qui est signalé dans le site. Aucun audio n'a été inventé.
