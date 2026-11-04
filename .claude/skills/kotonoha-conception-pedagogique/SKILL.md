---
name: kotonoha-conception-pedagogique
description: Concevoir ou évaluer une fonctionnalité d'apprentissage de KOTONOHA (parcours de 210 unités, répétition espacée, exercices, examens blancs JLPT, kanji, écoute, objectifs XP, minuteur Focus). À utiliser quand une demande touche à la manière dont l'élève apprend, révise ou est évalué, avant d'écrire du code.
---

# Conception pédagogique — KOTONOHA

## Public et promesse

Francophones qui préparent le JLPT du N4 au N2, en autonomie, gratuitement, souvent sur mobile et parfois hors connexion. Parcours : N4 = unités 1–55, N3 = 56–129, N2 = 130–210. Objectifs quotidiens : 20 / 40 / 80 XP.

## Principes à respecter

1. **Rappel actif avant reconnaissance** : préférer produire (sens → japonais, écriture, remise en ordre) à simplement reconnaître, sans décourager un débutant.
2. **Répétition espacée** : ne pas casser la planification existante des révisions ; toute modification de l'algorithme ou du format de sauvegarde doit rester compatible avec les progrès déjà enregistrés (local, Firebase, Supabase, sauvegardes importées).
3. **Charge cognitive** : une notion par écran, exemples courts, furigana au niveau de l'élève, explication en français clair.
4. **Rétroaction immédiate et explicative** : dire pourquoi une réponse est fausse, pas seulement qu'elle l'est.
5. **Fidélité au JLPT** : formats d'examen, sections (言語知識・読解, 聴解), durées et seuils cohérents avec `EXCFG` ; rappeler que la date de l'examen se vérifie sur jlpt.jp.
6. **Motivation sans manipulation** : XP et séries encouragent, sans culpabiliser ni pousser à des sessions excessives.
7. **Accessibilité** : utilisable au clavier et au lecteur d'écran, contrastes suffisants, `lang="ja"` sur le texte japonais, alternatives à l'audio.

## Avant d'implémenter

- Formuler l'objectif d'apprentissage et la mesure de réussite.
- Identifier les données de progression touchées et prévoir la migration (jamais de perte de progrès).
- Vérifier le contenu japonais avec la skill `kotonoha-contenu-japonais`.
- Proposer un plan court à l'utilisateur ; ne pas modifier les données pédagogiques sans son accord.
