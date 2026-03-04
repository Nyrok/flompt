---
title: "Pourquoi on a retiré le Prompt Guard"
date: "2026-03-04"
excerpt: "On avait intégré Llama Guard pour filtrer les prompts dangereux. Puis on a regardé ce que ça faisait à la conversion. On l'a retiré entièrement."
tags: ["transparence", "produit", "ux", "open source"]
---

Quand on a lancé la fonctionnalité de décomposition de Flompt — tu colles un prompt, l'IA le découpe en blocs structurés — on a ajouté une couche de sécurité appelée Prompt Guard.

L'idée était raisonnable : faire passer chaque prompt par Llama Guard 4 (via Groq) avant de l'envoyer au LLM. Détecter le contenu dangereux. Rejeter ce qui est flagué.

On l'a déployé. On a observé. Puis on l'a retiré entièrement.

Voilà pourquoi.

---

## Ce que le Prompt Guard était censé faire

Llama Guard est un modèle Meta entraîné sur une taxonomie de risques (S1–S13 : crimes violents, discours de haine, contenu sexuel, etc.). Donné un prompt, il retourne un verdict de sécurité : `safe` ou `unsafe`, avec la liste des catégories violées.

En théorie : propre. Avant que l'inférence réelle tourne, on filtre l'entrée. On bloque tout ce qui paraît suspect.

En pratique : c'était le mauvais outil pour ce cas d'usage.

---

## Problème 1 : Trop de faux positifs

Les prompt engineers travaillent par définition avec des entrées inhabituelles. Ils écrivent des prompts *sur* la violence pour de la fiction. Ils simulent des personnages dangereux pour tester les garde-fous des IA. Ils construisent des exemples adversariaux pour étudier le comportement des modèles. Ils produisent du contenu pour la recherche en cybersécurité, des contextes juridiques, de la documentation médicale.

Llama Guard est entraîné sur une taxonomie de risques large — ce qui signifie qu'il flagge large. Un prompt sur *l'écriture* d'une scène de thriller avec un conflit : bloqué. Un prompt testant la résistance aux jailbreaks : bloqué. Un prompt pour un chatbot médical mentionnant des "seuils de surdosage" : bloqué.

Ce ne sont pas des cas limites pour les prompt engineers. Ce sont des cas d'usage centraux.

Chaque faux positif était un échec silencieux. L'utilisateur collait un prompt légitime, cliquait sur décomposer, et obtenait un message d'erreur disant que son contenu était "non sécurisé." Sans explication. Sans recours. Juste un mur.

---

## Problème 2 : Gâchis d'UX

Au-delà des faux positifs, le garde ajoutait une phase au flux.

Avant : coller le prompt → décomposer → terminé.

Après : coller le prompt → *analyse en cours…* → décomposer → terminé.

Cette phase d'`analyse` était une attente obligatoire — inférence Groq sur un modèle 12B — avant que le vrai travail commence. Un bon jour, ça ajoutait environ une seconde. Un mauvais jour (cold start, rate limit, latence réseau), trois à cinq secondes.

Ça paraît petit. Ce ne l'est pas. **Le spinner "analyse en cours" était le premier feedback que l'utilisateur voyait.** Avant même que la décomposition ait démarré, on lui disait déjà : *attends, on inspecte ton prompt.*

C'est une mauvaise première impression. Ça signale de la méfiance. Ça ajoute de la friction au moment exact où l'utilisateur évalue si cet outil est rapide et réactif.

---

## Problème 3 : Barrière à la conversion

Celui-là, il est brutal.

Les outils gratuits vivent et meurent dans les premières secondes de l'expérience utilisateur. Le chemin de "je vais essayer" à "je reste" est court. La moindre friction dans cette fenêtre — surtout une friction qui ressemble à un rejet — pousse les gens vers la sortie.

On rejetait littéralement des utilisateurs lors de leur première tentative de décomposition.

Pas parce que leurs prompts étaient malveillants. Parce qu'un modèle de sécurité généraliste, calibré pour la détection large de risques, sur-déclenchait sur du contenu spécialisé. Et quand la première interaction de quelqu'un avec ton produit c'est une erreur de blocage, il ne réessaie pas avec un prompt différent. Il ferme l'onglet.

---

## Pourquoi on l'a gardé désactivé avant de le supprimer

`PROMPT_GUARD_ENABLED=false` a traîné dans notre `.env` pendant des semaines avant qu'on supprime le code.

En partie par inertie. En partie avec l'idée qu'on en aurait peut-être besoin "plus tard." En partie en se disant que le problème était une question de calibration — avec un modèle différent, des seuils différents, une autre configuration, ça marcherait.

Mais plus on regardait, plus on réalisait : **le Prompt Guard résolvait un problème qu'on n'a pas vraiment.**

Flompt est un outil gratuit et open source. Pas de système de comptes. Le contenu généré ne va nulle part — la réponse de l'IA s'affiche dans l'interface de chat de l'utilisateur, sur son écran, avec sa propre session. On n'est pas une plateforme de contenu. On n'héberge et n'amplifie rien.

Faire tourner un filtre de sécurité sur les entrées d'un outil de construction de prompts, c'est de la sécurité cargo cult : l'apparence de la protection sans réduction de risque réelle.

---

## Ce qui l'a remplacé

Rien, et c'est le but.

Le backend passe maintenant directement de `queued` → `processing` → `done`. Plus de phase d'analyse. Plus d'état bloqué. Plus de faux positifs.

Si la modération devient un jour vraiment nécessaire — pour un cas d'usage spécifique, à l'échelle, avec la bonne calibration — elle appartient à la couche applicative, pas comme filtre global sur chaque requête de décomposition.

D'ici là : on fait confiance à nos utilisateurs pour savoir ce qu'ils construisent.

---

*Le changement complet est [open source](https://github.com/Nyrok/flompt) et documenté dans l'historique des commits.*
