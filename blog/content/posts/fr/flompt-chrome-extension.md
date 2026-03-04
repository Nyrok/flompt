---
title: "L'extension Flompt : construis tes prompts sans quitter ChatGPT — sur Chrome & Firefox"
date: "2026-02-25"
excerpt: "Flompt est maintenant disponible en extension Chrome & Firefox. Construis des prompts structurés en XML directement depuis la sidebar de ChatGPT, Claude ou Gemini. Sans copier-coller."
tags: ["extension chrome", "extension firefox", "flompt", "prompt engineering", "productivité"]
---

## Le problème du contexte

Quand tu travailles avec une IA, tu as deux onglets ouverts. Celui de ton outil de prompting. Celui de ChatGPT ou Claude. Tu écris, tu copies, tu colles, tu reviens, tu ajustes, tu recopies.

Ce va-et-vient est invisible dans les tutoriels mais constant dans la pratique. C'est du temps perdu, de la friction ajoutée, et une source d'erreurs : mauvaise version collée, contexte oublié, modification perdue.

L'extension Flompt supprime ce problème — disponible sur Chrome et Firefox.

## Ce que fait l'extension

Une sidebar s'ouvre directement dans l'interface de ChatGPT, Claude ou Gemini. À droite de la page. Sans nouvel onglet. Tu construis ton prompt visuellement dans la sidebar, et d'un clic, il est injecté dans la zone de saisie de l'IA.

Pas de copier-coller. Pas de changement de contexte. Ton flow visuel et ta conversation IA au même endroit.

## Le format XML : pourquoi ça change tout

Quand tu assembles tes blocs, Flompt génère un prompt en XML structuré :

```xml
<prompt>
  <role>
    Tu es un expert en développement Python.
  </role>
  <objective>
    Révise le code suivant pour détecter les bugs et problèmes de performance.
  </objective>
  <constraints>
    Sois concis. Priorise les problèmes critiques. Une phrase par problème.
  </constraints>
  <output_format>
    Liste numérotée.
  </output_format>
</prompt>
```

Ce format n'est pas arbitraire. Les LLMs modernes (GPT-4, Claude, Gemini) sont entraînés sur des quantités massives de XML. Les balises agissent comme des **délimiteurs sémantiques explicites** : le modèle sait exactement où commence le rôle, où finit l'objectif, ce qui constitue une contrainte.

Résultat concret : moins d'ambiguïté, moins d'hallucinations sur la structure, meilleure isolation des sections. Anthropic recommande d'ailleurs l'usage de balises XML dans ses guidelines de prompt engineering.

## L'assemblage est 100% local

Aucun appel API à la compilation. Le prompt XML est généré directement dans ton navigateur, à partir de tes blocs. Instantané, hors-ligne capable, et tes données ne quittent jamais ta machine.

L'ordre des blocs dans le prompt final suit la topologie du canvas : si tu as connecté tes blocs entre eux, Flompt respecte cet ordre (tri topologique). Sinon, il trie par position verticale : les blocs en haut du canvas arrivent en premier.

## Compatible ChatGPT, Claude, Gemini

L'extension détecte automatiquement la plateforme active et adapte l'injection. Le bouton Flompt s'intègre dans la barre d'outils native de chaque interface.

Si pour une raison quelconque la barre d'outils est introuvable (mise à jour de l'interface, DOM modifié), un bouton flottant apparaît en bas à droite comme fallback.

## Comment l'installer

Installe directement depuis le Chrome Web Store ou Firefox Add-ons. Un clic, aucun mode développeur requis :

→ [**Ajouter à Chrome**](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc)

→ [**Ajouter à Firefox**](https://addons.mozilla.org/addon/flompt-visual-prompt-builder/)

Une fois installée, ouvre ChatGPT, Claude ou Gemini. Le bouton **✦ flompt** apparaît directement dans la barre d'outils de saisie.

Pas de compte requis. Pas de clé API. Gratuit et open-source sous licence MIT.

## Ce que ça change dans la pratique

La friction entre "construire un bon prompt" et "l'utiliser" disparaît. Tu peux itérer rapidement : modifier un bloc, réassembler, injecter, tester la réponse, ajuster. Le tout sans quitter l'onglet.

Et comme le flow est sauvegardé automatiquement entre les sessions, tu reprends exactement là où tu t'étais arrêté.

---

[**Ajouter à Chrome →**](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc) · [**Ajouter à Firefox →**](https://addons.mozilla.org/addon/flompt-visual-prompt-builder/) · [Essayer l'app web](https://flompt.dev/app)
