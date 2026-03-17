---
title: "L'extension Flompt : construis tes prompts sans quitter ChatGPT, sur Chrome et Firefox"
date: "2026-02-25"
excerpt: "Flompt est maintenant disponible en extension Chrome & Firefox. Construis des prompts structurés en XML directement depuis la sidebar de ChatGPT, Claude ou Gemini. Sans copier-coller."
tags: ["extension chrome", "extension firefox", "flompt", "prompt engineering", "productivité"]
color: "primary"
---

## Le problème du contexte

Tu travailles avec une IA. Deux onglets. Celui de ton outil. Celui de ChatGPT ou Claude.

Écris. Copie. Colle. Reviens. Ajuste. Recopie.

Va-et-vient constant. Temps perdu. Friction partout. Erreurs : mauvaise version. Contexte oublié. Modification perdue.

L'extension Flompt supprime ce problème. Chrome et Firefox.

## Ce que fait l'extension

Sidebar directe. ChatGPT. Claude. Gemini. À droite de la page. Pas de nouvel onglet.

Construis ton prompt dans la sidebar. Un clic : injecté dans la zone de saisie IA.

Pas de copier-coller. Pas de changement de contexte. Flow visuel + conversation IA. Même endroit.

## Le format XML : pourquoi ça change tout

Assemblage = prompt XML structuré.

```xml
<prompt>
  <role>
    Tu es expert en développement Python.
  </role>
  <objective>
    Révise le code pour détecter bugs.
  </objective>
  <constraints>
    Concis. Priorise les critiques. Une phrase par bug.
  </constraints>
  <output_format>
    Liste numérotée.
  </output_format>
</prompt>
```

Ce format n'est pas arbitraire. Les LLMs = entraînés sur massif XML. Les balises = délimiteurs sémantiques explicites. Le modèle sait où commence le rôle. Où finit l'objectif. Ce qu'est une contrainte.

Résultat : moins d'ambiguïté. Moins d'hallucinations. Meilleure isolation. Anthropic recommande XML dans ses guidelines.

## L'assemblage est 100% local

Pas d'appel API. Le prompt XML = généré dans ton navigateur. À partir de tes blocs. Instantané. Hors-ligne capable. Tes données restent sur ta machine.

L'ordre des blocs : suit la topologie du canvas. Blocs connectés = ordre respecté (tri topologique). Sinon : trie par position verticale. Haut du canvas = en premier.

## Compatible ChatGPT, Claude, Gemini

L'extension détecte la plateforme active. Adapte l'injection. Le bouton Flompt s'intègre dans la barre d'outils native.

Si la barre d'outils n'est pas trouvée (mise à jour). Un bouton flottant apparaît en bas à droite. Fallback automatique.

## Comment l'installer

Chrome Web Store ou Firefox Add-ons. Un clic. Pas de mode développeur.

→ [**Ajouter à Chrome**](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc)
→ [**Ajouter à Firefox**](https://addons.mozilla.org/addon/flompt-visual-prompt-builder/)

Ouvre ChatGPT, Claude, ou Gemini. Le bouton **✦ flompt** s'affiche dans la barre d'outils.

Pas de compte. Pas d'API. Gratuit. MIT.

## Ce que ça change dans la pratique

La friction disparaît. Construire un prompt. L'utiliser. Même endroit. Itère rapidement : modifie. Réassemble. Injecte. Teste. Ajuste. Pas de changement d'onglet.

Le flow se sauvegarde automatiquement. Reprends exactement là où tu t'étais arrêté.

---

[**Ajouter à Chrome →**](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc) · [**Ajouter à Firefox →**](https://addons.mozilla.org/addon/flompt-visual-prompt-builder/) · [Essayer l'app web](https://flompt.dev/app)
