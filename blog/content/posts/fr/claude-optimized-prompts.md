---
title: "Comment écrire des prompts optimisés pour Claude : XML, documents et exemples structurés"
date: "2026-02-25"
excerpt: "Les meilleures pratiques officielles d'Anthropic, traduites en techniques concrètes, et comment flompt les applique automatiquement."
tags: ["Claude", "prompt engineering", "XML", "Anthropic", "meilleures pratiques"]
color: "primary"
---

## Claude est différent. Tes prompts devraient l'être aussi.

Claude n'est pas ChatGPT. Il a des forces uniques.

Anthropic a publié le guide officiel. Voici ce qui marche.

---

## 1. Le grounding par document avec `<document>` XML

Claude doit lire du contenu externe ?
Utilise le format XML de document.

```xml
<documents>
  <document index="1">
    <source>Rapport Q4</source>
    <document_content>[contenu]</document_content>
  </document>
</documents>
```

Dit à Claude : "Référence, pas instruction."
Résultat : +30% de précision.

**Dans flompt :** Le bloc **Document** gère ça automatiquement. Ajoute ton contenu. L'assembleur l'enveloppe dans le bon format XML, indexé, sourcé, prêt pour Claude.

---

## 2. Les exemples few-shot structurés

Few-shot puissant. Format critique.

Pas :
```
Exemple : [entrée] → [sortie]
```

Utilise XML :
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

Ce format est clair. Claude voit où l'exemple commence et finit. Pas d'ambiguïté. Pas de fuite entre exemples.

**Dans flompt :** Écris tes exemples avec `Input: [...]` puis `Output: [...]`. L'assembleur génère le XML automatiquement.

---

## 3. L'ordre des blocs compte

Anthropic : l'ordre affecte les performances de Claude.

**Ordre recommandé :**
1. **Documents** (grounding toujours d'abord)
2. **Rôle** (persona)
3. **Audience** (qui lit la réponse)
4. **Contexte** (background)
5. **Objectif** (la tâche)
6. **Objectif final** (but et succès)
7. **Entrée** (données)
8. **Contraintes** (règles)
9. **Exemples** (few-shot)
10. **Chaîne de raisonnement** (étapes)
11. **Sortie** (format de réponse)
12. **Langue** (en dernier)

Claude lit de haut en bas. Documents d'abord = contexte immediate. Instructions à la fin = plus difficiles à ignorer.

**Dans flompt :** Cet ordre est automatique. L'assembleur trie les blocs. Tu ne fais rien.

---

## 4. Utilise le Style de réponse

Le bloc **Style de réponse** gère : verbosité, ton, format prose, markdown, LaTeX.

Interface structurée. Pas d'écriture manuelle.

---

## Le prompt assemblé complet

Prompt bien structuré. Toutes les bonnes pratiques appliquées :

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

Construis toute cette structure dans flompt. Bloc par bloc. Assemble en un clic. Pas d'XML manuel.

---

## Commencer à construire

flompt applique les bonnes pratiques automatiquement. Ajoute tes blocs. Assemble. Obtiens un prompt optimisé pour Claude.

Prêt à coller. Directement. Partout.

[Ouvrir flompt →](/app)
