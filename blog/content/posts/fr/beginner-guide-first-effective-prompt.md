---
title: "Guide débutant : écrire son premier prompt efficace"
date: "2026-02-10"
excerpt: "Pas besoin d'être expert pour écrire des prompts qui marchent. Voici un guide pas-à-pas pour commencer du bon pied."
tags: ["débutant", "guide", "prompt engineering"]
---

## Vous n'avez pas besoin d'être expert

Le prompt engineering a l'air intimidant vu de l'extérieur. Des termes techniques, des frameworks complexes, des exemples qui ressemblent à du code. Mais la réalité est plus simple : un bon prompt, c'est une bonne instruction.

Ce guide va vous montrer comment passer de "ça marche parfois" à "ça marche à chaque fois" en 4 étapes.

## Étape 1 : Définir ce que vous voulez

Ça paraît évident, mais c'est la cause n°1 des mauvais résultats. Avant d'écrire quoi que ce soit, répondez à ces questions :

- **Quel est le livrable ?** (un email, du code, une analyse, un résumé...)
- **Pour qui ?** (vous, un client, une équipe technique...)
- **Quel format ?** (paragraphes, liste, tableau, JSON...)
- **Quelle longueur ?** (un tweet, un paragraphe, une page...)

Si vous ne pouvez pas répondre clairement, l'IA non plus.

## Étape 2 : Donner du contexte

L'IA n'a aucun contexte par défaut. Elle ne sait pas qui vous êtes, dans quelle situation vous êtes, ni pourquoi vous posez la question. Chaque information pertinente que vous ajoutez améliore le résultat.

**Avant :**
> Aide-moi à écrire une présentation.

**Après :**
> Je prépare une présentation de 10 minutes pour des investisseurs. Mon produit est un SaaS de gestion de projet pour les PME. L'audience n'est pas technique. Je veux convaincre, pas expliquer les features.

Le second prompt donne à l'IA tout ce dont elle a besoin pour être pertinente.

## Étape 3 : Être spécifique sur le format

Les LLMs sont très sensibles aux instructions de format. Utilisez-les à votre avantage :

```
Donne-moi 5 slogans pour une app de méditation.
Format : un slogan par ligne, max 8 mots chacun.
Ton : calme et inspirant, pas mystique.
```

C'est clair, c'est mesurable, c'est actionnable. L'IA sait exactement ce qu'elle doit produire.

## Étape 4 : Itérer

Votre premier prompt ne sera probablement pas parfait, et c'est normal. L'itération fait partie du processus :

1. Envoyez votre prompt
2. Lisez la réponse attentivement
3. Identifiez ce qui manque ou ce qui déborde
4. Ajoutez une précision ou une contrainte
5. Renvoyez

Chaque itération rapproche le résultat de ce que vous voulez. Après 2-3 tours, vous y êtes généralement.

## Le template de départ

Voici un template simple que vous pouvez utiliser comme point de départ pour n'importe quel prompt :

```
[CONTEXTE]
Je suis [votre rôle/situation]. Je travaille sur [projet/tâche].

[OBJECTIF]
J'ai besoin de [livrable précis].

[CONTRAINTES]
- Format : [format souhaité]
- Longueur : [indication de longueur]
- Ton : [style de communication]
- À éviter : [ce que vous ne voulez pas]
```

Ce template couvre 80% des cas d'usage. Adaptez-le à vos besoins.

## Les erreurs classiques à éviter

1. **Être trop vague** : "Aide-moi avec mon projet" → L'IA n'a rien pour travailler
2. **Être trop long** : Un prompt de 2000 mots noie l'essentiel → Restez concis
3. **Oublier le format** : Ne pas spécifier le format = résultat aléatoire
4. **Ne pas itérer** : Abandonner après un premier résultat décevant

## La suite

Une fois que vous maîtrisez ces bases, vous pouvez explorer des techniques avancées :
- Le **few-shot learning** (donner des exemples)
- Le **chain-of-thought** (raisonnement étape par étape)
- Le **role prompting** (assigner un rôle expert)

Mais commencez par les 4 étapes. Elles suffiront pour 80% de vos interactions avec l'IA.
