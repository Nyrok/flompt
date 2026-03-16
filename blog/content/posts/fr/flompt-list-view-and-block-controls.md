---
title: "Fini le canvas par défaut : la vue liste de Flompt construit tes prompts plus vite"
date: "2026-03-16"
excerpt: "Flompt propose maintenant une vue liste comme interface par défaut : pas de drag, pas de coordonnées, juste des cartes empilées que tu édites, masques, réordonnes et compiles instantanément. Le canvas est toujours là quand tu en as besoin."
tags: ["flompt", "vue liste", "ux", "prompt building", "release", "clavier"]
color: "primary"
---

## Le canvas est puissant. C'est aussi une surcharge.

La vue canvas de Flompt te donne une vue spatiale de tes blocs de prompt. Tu vois comment les pièces s'articulent, tu peux les déplacer, les connecter visuellement. Pour les prompts complexes avec beaucoup de blocs et de dépendances, c'est vraiment utile.

Mais pour la plupart des prompts, la plupart du temps, tu n'as pas besoin de raisonnement spatial. Tu as besoin d'écrire, d'éditer et de compiler. Le canvas introduit des cibles de drag, des niveaux de zoom et un système de coordonnées qui complique ce qui devrait être simple.

La nouvelle vue liste enlève tout ça.

## Un défaut plus simple

La vue liste est maintenant l'interface par défaut à l'ouverture de Flompt. Les blocs apparaissent comme des cartes empilées dans une mise en page verticale propre. Tu peux développer ou réduire n'importe quelle carte. Tu peux éditer le contenu directement dans le textarea de la carte. Tu vois un aperçu du contenu quand la carte est réduite.

Pas de canvas, pas de coordonnées, pas de poignées de déplacement.

## Une toolbar unifiée, tout ce dont tu as besoin

Une toolbar unifiée est positionnée en haut de la vue liste avec trois sections.

À gauche : les actions de contrôle. Effacer tous les blocs, annuler, refaire, et un bouton compiler qui assemble ton prompt et t'emmène directement au panneau de sortie. Pas besoin de passer en vue canvas pour compiler.

Au centre : chaque type de bloc en bouton d'ajout en un clic. Role, Context, Objective, Constraints et plus encore. Un clic pour ajouter un bloc en bas de ta liste.

À droite : le sélecteur de vue. Bascule entre la vue liste et la vue canvas à tout moment. Tes blocs sont les mêmes dans les deux vues. Modifier en vue liste se répercute immédiatement dans le canvas, et vice versa.

## Masquer des blocs sans les supprimer

Chaque bloc a maintenant un bouton de visibilité : une icône d'oeil sur la gauche de la carte (et dans l'en-tête du bloc canvas).

Clique dessus pour masquer un bloc. Les blocs masqués restent dans ton workspace mais sont exclus du prompt assemblé. La carte passe à 40% d'opacité pour que tu saches qu'elle est là mais inactive.

C'est utile quand tu expérimentes. Tu peux construire un bloc, tester le prompt sans lui, et le restaurer plus tard sans rien réécrire.

## Réorganisation au clavier

Quand une carte est en focus, quatre raccourcis clavier contrôlent tout :

- `FlècheGauche` déplace le bloc d'une position vers le bas
- `FlècheDroite` le déplace vers le haut
- `-` réduit la carte
- `+` la développe

Tu peux aussi utiliser les boutons chevron sur chaque carte pour déplacer les blocs vers le haut ou le bas. Les boutons se désactivent automatiquement quand un bloc est déjà en tête ou en queue de liste.

## Dupliquer n'importe quel bloc

Un bouton copie sur chaque carte crée un duplicata exact du bloc, ajouté à la liste avec un identifiant unique. Utile quand tu veux créer une variation d'un bloc existant ou t'en servir comme point de départ pour un nouveau.

## Deux vues, un seul jeu de données

Basculer entre vue liste et vue canvas est instantané. Les deux vues lisent et écrivent dans le même store. Pas de sync, pas de conversion, pas de délai.

Si tu construis un prompt en vue liste et que tu passes au canvas, chaque bloc est exactement où il devrait être. Si tu édites le contenu d'un bloc en vue canvas et que tu reviens en vue liste, le changement est déjà là.

Les deux vues sont deux interfaces vers les mêmes données.

[**Essayer maintenant**](https://flompt.dev/app) | [**Star sur GitHub**](https://github.com/Nyrok/flompt)
