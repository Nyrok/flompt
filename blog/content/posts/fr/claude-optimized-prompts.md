---
title: "Comment écrire des prompts optimisés pour Claude : XML, documents et exemples structurés"
date: "2026-02-25"
excerpt: "Les meilleures pratiques officielles d'Anthropic, traduites en techniques concrètes — et comment flompt les applique automatiquement."
tags: ["Claude", "prompt engineering", "XML", "Anthropic", "meilleures pratiques"]
---

## Claude est différent — tes prompts devraient l'être aussi

La plupart des guides de prompt engineering traitent tous les LLMs de la même façon. Mais Claude a des comportements spécifiques, des patterns d'entraînement particuliers et des capacités de parsing XML qui rendent les prompts bien structurés **mesurément plus efficaces**.

Anthropic a publié des recommandations détaillées à ce sujet. Voici ce qui compte vraiment — et comment flompt l'applique automatiquement.

---

## 1. Le grounding par document avec `<document>` XML

Quand tu veux que Claude raisonne sur du contenu externe — un article, un fichier de code, un contrat — la meilleure façon de le fournir n'est pas de le coller en ligne. C'est d'utiliser le format XML document d'Anthropic :

```xml
<documents>
  <document index="1">
    <source>Rapport Q4</source>
    <document_content>
      [ton contenu ici]
    </document_content>
  </document>
</documents>
```

Cette structure indique à Claude : *c'est un document de référence, pas une instruction*. Il le traite différemment — avec plus de précision, une meilleure attribution des sources, et moins de risque d'injection d'instructions malveillantes.

Anthropic rapporte jusqu'à **30% d'amélioration de précision** sur les tâches basées sur des documents, par rapport à l'injection en texte brut.

**Dans flompt :** Le bloc **Document** gère ça automatiquement. Ajoute ton contenu, et l'assembleur l'enveloppe dans le bon format XML — indexé, sourcé, prêt pour Claude.

---

## 2. Les exemples few-shot structurés

Les exemples few-shot sont l'une des techniques de prompting les plus puissantes. Mais le format compte plus que la plupart des gens ne le réalisent.

Au lieu de :
```
Exemple : [entrée] → [sortie]
```

Utilise le format XML structuré :
```xml
<examples>
  <example>
    <user_input>Analyse ce code pour les bugs</user_input>
    <ideal_response>
      2 problèmes trouvés :
      1. Erreur off-by-one ligne 12
      2. Déréférencement de pointeur nul ligne 28
    </ideal_response>
  </example>
</examples>
```

Ce format est non ambigu — Claude sait exactement où l'exemple commence et se termine, quelle est l'entrée et à quoi ressemble la réponse idéale. Pas de fuite accidentelle entre les exemples.

**Dans flompt :** Écris tes exemples sous la forme `Input: [...]\nOutput: [...]` dans le bloc **Exemples**. L'assembleur les parse et génère le XML approprié automatiquement.

---

## 3. L'ordre des blocs compte

Les recherches d'Anthropic montrent que l'ordre des sections de ton prompt affecte les performances de Claude. L'ordre recommandé est :

1. **Documents** (grounding en premier — toujours)
2. **Rôle** (persona)
3. **Audience** (à qui s'adresse le résultat)
4. **Contexte** (background)
5. **Objectif** (tâche principale — ce qu'il faut faire)
6. **Objectif final** (but final et critères de succès)
7. **Entrée** (données à traiter)
8. **Contraintes** (règles)
9. **Exemples** (few-shot)
10. **Chaîne de raisonnement** (instructions de raisonnement)
11. **Sortie** (structure de la réponse)
12. **Langue** (en dernier)

La logique : Claude lit les prompts de haut en bas. Placer les documents en premier donne à Claude le contexte dont il a besoin pour interpréter correctement tout ce qui suit. Les instructions à la fin sont plus difficiles à ignorer et donc plus fiables.

**Dans flompt :** Cet ordre est automatique. Peu importe comment tu arranges les blocs sur le canvas, l'assembleur les trie de façon optimale avant de générer ton prompt.

---

## 4. Utilise le Style de réponse pour les directives de formatage

Le bloc **Style de réponse** gère toutes les directives de style spécifiques à Claude — verbosité, ton, format de prose, markdown, LaTeX — via une interface structurée. Plus besoin d'écrire manuellement des instructions de formatage.

---

## Le prompt assemblé complet

Voici à quoi ressemble un prompt bien structuré quand toutes les bonnes pratiques sont appliquées :

```xml
<prompt>
  <documents>
    <document index="1">
      <source>Code utilisateur</source>
      <document_content>
        [code ici]
      </document_content>
    </document>
  </documents>
  <role>
    Développeur Python senior spécialisé en revue de code
  </role>
  <audience>
    Ingénieurs mid-level qui vont trier et corriger les problèmes
  </audience>
  <objective>
    Revoir le code fourni pour les bugs, les problèmes de performance et les violations de style
  </objective>
  <goal>
    Aider l'équipe à prioriser ce qu'il faut corriger en premier. Faire ressortir les problèmes critiques clairement pour que le reviewer puisse agir en moins de 5 minutes.
  </goal>
  <constraints>
    Concentre-toi sur les problèmes critiques. Ignore le formatage cosmétique.
  </constraints>
  <examples>
    <example>
      <user_input>def foo(x): return x*2</user_input>
      <ideal_response>Aucun problème trouvé. Simple, correct, lisible.</ideal_response>
    </example>
  </examples>
  <thinking>
    Réfléchis étape par étape. D'abord identifie le type de problème, puis évalue la sévérité, puis suggère un correctif.
  </thinking>
  <output_format>
    Liste numérotée. Un problème par ligne. Sévérité : [critique/avertissement/info].
  </output_format>
  <language>Français</language>
</prompt>
```

Tu peux construire toute cette structure dans flompt — visuellement, bloc par bloc — et l'assembler en un clic. Pas d'écriture XML manuelle requise.

---

## Commencer à construire

flompt applique toutes ces bonnes pratiques automatiquement. Ajoute tes blocs, assemble, et obtiens un prompt optimisé pour Claude — prêt à coller directement dans n'importe quelle interface Claude ou appel API.

[Ouvrir flompt →](/app)
