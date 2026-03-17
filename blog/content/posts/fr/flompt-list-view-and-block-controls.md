---
title: "Fini le canvas par défaut : la vue liste de Flompt construit tes prompts plus vite"
date: "2026-03-16"
excerpt: "Flompt propose maintenant une vue liste comme interface par défaut : pas de drag, pas de coordonnées, juste des cartes empilées que tu édites, masques, réordonnes et compiles instantanément. Le canvas est toujours là quand tu en as besoin."
tags: ["flompt", "vue liste", "ux", "prompt building", "release", "clavier"]
color: "primary"
---

## Le canvas est puissant. C'est aussi une surcharge.

Canvas = vue spatiale de tes blocs. Vois comment les pièces s'articulent. Déplace-les. Connecte-les visuellement. Prompts complexes avec beaucoup de blocs = utile.

Mais la plupart des prompts : tu n'as pas besoin de spatial. Tu as besoin d'écrire. Éditer. Compiler. Le canvas = cibles drag, zoom, coordonnées. Complique ce qui est simple.

La vue liste enlève tout ça.

## Un interface plus simple

Vue liste = interface par défaut quand tu ouvres Flompt. Les blocs = cartes empilées. Layout vertical. Développe ou réduis. Édite le contenu directement. Aperçu quand réduit.

Pas de canvas. Pas de coordonnées. Pas de drag.

## Une toolbar unifiée, tout ce dont tu as besoin

Toolbar unifiée en haut. Trois sections.

**Gauche :** Actions. Effacer. Annuler. Refaire. Compiler bouton = assemble + panneau sortie. Pas besoin du canvas pour compiler.

**Centre :** Chaque type de bloc = bouton d'ajout. Role. Context. Objective. Constraints. Un clic = ajoute bloc en bas.

**Droite :** Sélecteur de vue. Bascule entre liste et canvas. Tes blocs = mêmes partout. Modifier en liste = reflète dans canvas. Vice versa.

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
