# KOTONOHA — pauses et mini-jeux

Recherche préalable et principes de conception de la salle de détente (`app/detente.js`, route `#detente`). Rédigé le 4 novembre 2026.

## 1. Ce que dit la littérature

### Résultats établis (avec leurs chiffres)

**Albulescu et al. (2022)**, « Give me a break! », *PLOS ONE* 17(8), e0272460 — [doi:10.1371/journal.pone.0272460](https://doi.org/10.1371/journal.pone.0272460).
Revue systématique et méta-analyse (PRISMA, PROSPERO CRD42021242961), 22 échantillons, N = 2 335. Micro-pause : interruption de **10 minutes au plus** (de 8 s à 10 min dans les études).
- Vitalité ressentie : d = 0,36 [0,16 ; 0,55] (9 études).
- Fatigue ressentie (diminution) : d = 0,35 [0,19 ; 0,50] (9 études).
- Performance : d = 0,16 [−0,04 ; 0,37], **non significatif** (15 études).

### Résultats qui dépendent du contexte

- Albulescu et al. : l'effet sur la performance varie selon la tâche. Il est nul après une tâche cognitive (d = −0,09), positif après une tâche créative (d = 0,38) ou administrative (d = 0,56, deux études seulement). Il augmente avec la durée de la pause (méta-régression, b = 0,07).
- **Schumann et al. (2022)**, « Restoration of Attention by Rest in a Multitasking World », *Frontiers in Psychology* — [PMC9010884](https://pmc.ncbi.nlm.nih.gov/articles/PMC9010884/). Revue théorique et méthodologique.
  - La synthèse distingue pauses longues (30–60 min), courtes (3–10 min) et micro (moins de 3 min).
  - Le repos améliore ou stabilise en général la performance par rapport au travail continu.
  - Une étude citée (Helton et Russell, 2015) place le repos pur devant les activités de « changement ».
  - Une autre (Scholz et al., 2017) suggère que le fait de faire une pause compte davantage que sa forme exacte.
- **Li, Hew et Du (2024)**, *Educational Technology Research and Development* 72(2), 765–796 — [doi:10.1007/s11423-023-10337-7](https://doi.org/10.1007/s11423-023-10337-7).
  - Méta-analyse de 35 interventions (environ 2 500 participants) : la ludification a un effet faible mais significatif sur la motivation intrinsèque (g ≈ 0,26).
  - Elle améliore le sentiment d'autonomie et de lien social, et a peu d'effet sur le sentiment de compétence.
- **Sheldon et Filak (2008)**, *British Journal of Social Psychology* 47(2), 267–283 — [doi:10.1348/014466607X238797](https://doi.org/10.1348/014466607X238797).
  - Plan factoriel 2 × 2 × 2 dans une tâche ludique d'apprentissage : soutenir ou contrarier l'autonomie, la compétence et la relation agit sur la motivation et le plaisir.
  - **Contrarier un besoin pèse plus lourd que le soutenir.**

### Cadres théoriques mobilisés

- **Théorie de l'autodétermination** (Ryan et Deci, 2000, *American Psychologist* 55(1), 68–78) : la motivation intrinsèque se nourrit d'autonomie, de compétence et de relation.
- **Effet des récompenses** (Deci, Koestner et Ryan, 1999, *Psychological Bulletin* 125(6), 627–668) : les récompenses tangibles et conditionnées à la tâche tendent à réduire la motivation intrinsèque.
- **Attention Restoration Theory** (Kaplan, 1995, *Journal of Environmental Psychology* 15, 169–182) : les environnements qui captent l'attention sans effort (« fascination douce »), qui offrent un sentiment d'ailleurs et qui sont cohérents favoriseraient la récupération de l'attention dirigée.
- **Expériences de récupération** (Sonnentag et Fritz, 2007, *Journal of Occupational Health Psychology* 12(3), 204–221) : détachement psychologique, relaxation, maîtrise (défi léger) et contrôle sur l'activité.

### Limites méthodologiques

- Albulescu et al. : peu d'études par critère, des mesures de bien-être toutes auto-déclarées, un risque de biais souvent incertain (4 études sur 22 à faible risque) et un biais de publication possible pour la performance. Le type d'activité pendant la pause n'a pas pu être analysé.
- Schumann et al. :
  - des théories souvent trop vagues pour être testées, des mesures de performance hétérogènes et des études de terrain fondées sur des auto-évaluations ;
  - l'Attention Restoration Theory est difficile à tester sur des durées courtes et souvent mal appliquée ;
  - les effets d'apprentissage brouillent les comparaisons.
- Li et al. : il s'agit de la ludification de l'apprentissage, pas de pauses ludiques. Le transfert vers une salle de détente est une hypothèse.
- Sheldon et Filak : d'autres auteurs relèvent que les besoins y étaient manipulés hors du jeu lui-même (Peng et al., 2012).

## 2. Hypothèses de conception (non démontrées)

1. Une pause est plus reposante si elle **change de registre** : aucune activité de japonais (ni vocabulaire, ni kanji, ni grammaire), sinon ce n'est qu'une autre séance.
2. Les ingrédients de l'Attention Restoration Theory (fascination douce, ailleurs, cohérence) peuvent se traduire en expériences contemplatives : sable, lucioles, souffle.
3. Les besoins de la théorie de l'autodétermination se traduisent ainsi :
   - **autonomie** : durée, expérience et sortie au choix ;
   - **compétence** : défi léger et toujours soluble (rizières, avec coup de pouce) ;
   - **contrôle** : pas de chrono imposé, pause du chrono quand l'onglet est caché.
4. Puisque contrarier un besoin pèse plus lourd que le soutenir, on **retire toute pression** : pas de score, de classement, de série, de pénalité, de récompense ni de notification.

## 3. Principes appliqués dans `app/detente.js`

| Principe | Mise en œuvre |
|---|---|
| Durée choisie | 30 s–1 min, 2–3 min, 4–6 min, 7–9 min (mémorisée sur l'appareil) |
| Chrono indicatif | Anneau discret ; il ne s'arrête pas à zéro : rien ne se ferme |
| Sortie à tout moment | Bouton « Quitter », touche Échap, navigation normale |
| Fin de pause | « Retour à la séance » (écran d'avant), « Prolonger la pause », « Quitter » |
| Ressenti | Trois boutons facultatifs, mention explicite « ce n'est pas une mesure », stockés sur l'appareil |
| Aucun son automatique | Contexte audio créé au premier geste ; son coupé par défaut (sauf carillon, qui ne sonne qu'au toucher) ; vérifié par un test automatisé |
| Pas d'exercice déguisé | Aucune donnée pédagogique utilisée ; les kanji des cartes sont purement décoratifs |
| Renard discret | Kitsune endormi dans un coin du salon, absent des expériences |
| Accessibilité | Clavier partout (flèches, Entrée, chiffres), focus visible, `prefers-reduced-motion` respecté |

## 4. Les expériences

| Expérience | Registre | Durées conseillées | Description |
|---|---|---|---|
| Jardin de sable | Contemplation, création | toutes | Râteau à cinq dents, pierres avec cercles concentriques, « Lisser » pour recommencer |
| Étang aux koi | Contemplation | toutes | Ronds dans l'eau, granulés ; les carpes viennent doucement |
| Atelier musical | Création musicale | 30 s – 9 min | Boucle de cloches pentatoniques et de taiko, toutes les notes s'accordent ; lecture seulement sur demande |
| Pinceau | Dessin | toutes | Encres, lavis, ensō, sceau ; l'image peut être enregistrée (PNG) |
| Ricochets | Adresse douce | 30 s – 6 min | Galets lancés sur un lac, rebonds comptés pour le plaisir, rien n'est conservé |
| Rizières | Logique légère | 2 – 9 min | Grilles 4×4 à 6×6 toujours solubles (arbre couvrant), sans compteur ; « Un coup de pouce » |
| Lucioles | Exploration, adresse douce | toutes | Une lanterne attire les lucioles quand on reste immobile |
| Souffle | Détente | 30 s – 6 min | Cercle 4·4, 4·6, 5·5 ou carré ; « ce n'est pas un exercice médical » |

## 5. Ce que l'espace ne promet pas

Aucun mini-jeu n'est présenté comme améliorant la mémoire, l'attention ou les performances. La seule affirmation affichée reprend Albulescu et al. : un peu plus de vitalité et un peu moins de fatigue ressenties, et pas d'effet démontré sur la performance en général.

## 6. Pistes non retenues

- Mesurer « l'efficacité » des pauses : un ressenti déclaratif sans protocole ne prouve rien, d'où la mention explicite.
- Débloquer des jeux en échange de séances : ce serait une récompense conditionnée, contraire aux principes ci-dessus.
