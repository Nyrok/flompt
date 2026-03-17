---
title: "Pourquoi le prompt engineering fonctionne vraiment : les leçons du guide officiel d'Anthropic"
date: "2026-02-25"
excerpt: "Des instructions vagues donnent des réponses vagues. Voici ce que la recherche d'Anthropic dit sur l'écriture de prompts efficaces, et pourquoi la structure est le levier le plus puissant."
tags: ["prompt engineering", "Claude", "bonnes pratiques", "prompts structurés"]
color: "primary"
---

Mauvaise réponse ? Tu penses : "Claude n'est pas bon."

Faux. Ton prompt est faible.

[Guide Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) : l'écart vient du prompt, pas du modèle.

---

## Le modèle mental du "brillant nouvel employé"

Anthropic propose une analogie qui change tout :

> « Claude = employé brillant mais nouveau. Pas de contexte. Explique précisément ce que tu veux. Ça marche mieux. »

Claude n'est pas stupide. Il manque juste de contexte. Il ne sait pas ce que "bon" signifie pour toi. Ne sait pas ce que ton audience attend. Ne sait pas tes contraintes. Pas idée du format réel dont tu as besoin. Chaque information implicite = une supposition qu'il fait.

Meilleur modèle ? Non. Meilleur briefing ? Oui.

---

## Pourquoi la structure bat la longueur

Les gens écrivent plus pour de meilleurs résultats. Plus de mots. Plus de contexte. Un seul bloc.

Mais longueur sans structure = ambiguïté toujours.

Anthropic : balises XML = meilleur méthode pour structurer.

> « XML = analyse sans ambiguïté. Mélange = friction. Chaque type dans sa propre balise réduit les erreurs. »

**Mauvais :**
```
Tu es un expert. Écris-moi un résumé. Reste court. Voici le texte : [...]
```

Rôle + instruction + contrainte + entrée = bloc mélangé. Friction partout.

**Bon :**
```xml
<role>Analyste senior en rapports financiers</role>
<objective>Résumé exécutif du document ci-dessous</objective>
<constraints>Max 150 mots. Pas de jargon. Simple.</constraints>
<input>[ton document]</input>
```

Même information. Clarté totale. La structure signale l'intention.

---

## Les exemples : la technique à plus fort levier

Few-shot examples = recommandation la plus forte dans le guide Anthropic.

> « Les exemples = moyens les plus fiables. Guident le format. Guident le ton. Guident la structure. Quelques exemples = précision + cohérence. »

**Recommandation officielle :**
- 3 à 5 exemples
- Balises `<examples>`
- Couvre les cas limites
- Montre les bords à Claude

Pourquoi ça marche ? Les exemples contournent l'ambiguïté. Tu montres au lieu de décrire. Les modèles = excellents pour reconnaître les patterns. À partir de démonstrations concrètes.

---

## Le contexte n'est pas optionnel

Un insight du guide : explique *pourquoi* tu veux quelque chose. Pas juste le *quoi*.

> « Fournis le contexte. Fournis la motivation. Explique à Claude pourquoi c'est important. Claude comprend mieux. Réponses plus ciblées. »

**Mauvais :**
- ❌ `"N'utilisez JAMAIS de points de suspension"`

**Bon :**
- ✅ `"La réponse sera lue à voix haute par TTS. Le moteur ne saura pas prononcer les points de suspension."`

Claude généralise à partir du contexte. Comprend le raisonnement. L'applique aux cas limites. Rend les prompts robustes.

---

## L'ancrage documentaire : la bonne façon de fournir des sources

Pour les prompts qui impliquent du matériel de référence (un article, un contrat, un dataset), Anthropic recommande une structure XML spécifique :

```xml
<documents>
  <document index="1">
    <source>rapport_annuel_2025.pdf</source>
    <document_content>
      [texte du document ici]
    </document_content>
  </document>
</documents>
```

Ce n'est pas juste une convention. Claude est spécifiquement entraîné à parser ce format, le rendant plus fiable que coller du texte brut en espérant que le modèle l'identifie comme source. Les documents doivent toujours apparaître en premier dans votre prompt. Anthropic note que cela peut améliorer la qualité des réponses jusqu'à 30% pour les inputs complexes multi-documents.

---

## La pile du prompt engineering

Mis bout à bout, un prompt bien conçu a une structure claire :

1. **Documents**: matériel de référence, ancré dans des balises `<document>`
2. **Rôle**: qui est l'IA dans ce contexte
3. **Audience**: à qui s'adresse le résultat
4. **Contexte**: background et motivation
5. **Objectif**: la tâche spécifique (ce qu'il faut faire)
6. **Objectif final**: le but final et les critères de succès
7. **Entrée**: les données traitées
8. **Contraintes**: règles et limites
9. **Exemples**: démonstrations few-shot dans des balises `<examples>`
10. **Chaîne de raisonnement**: instructions de raisonnement étape par étape
11. **Format de sortie**: la structure de réponse attendue
12. **Style de réponse**: verbosité, ton, prose, markdown (interface structurée)

C'est exactement l'ordonnancement que flompt applique automatiquement. Pas parce que c'est une convention arbitraire, mais parce que cela suit les recommandations d'Anthropic sur la façon dont Claude traite l'information le plus efficacement.

---

## Pourquoi le visual building rend ça praticable

En lisant ce qui précède, vous pensez peut-être : "OK, mais qui va structurer chaque prompt comme ça manuellement ?" C'est légitime. Écrire des prompts structurés en texte brut, c'est comme écrire du HTML dans le Bloc-notes. On *peut*, mais la charge cognitive est élevée.

C'est le vide que flompt comble. Au lieu d'écrire chaque balise manuellement, vous construisez des blocs (Rôle, Contexte, Objectif, Exemples) et l'outil assemble le XML automatiquement, dans le bon ordre, avec le bon wrapping. La technique devient sans friction parce que la structure est imposée par l'interface.

Le prompt engineering fonctionne. La recherche le confirme. La seule question est de savoir comment le rendre suffisamment simple pour que vous le fassiez vraiment à chaque fois.

---

*Sources : [Guide de prompt engineering Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)*
