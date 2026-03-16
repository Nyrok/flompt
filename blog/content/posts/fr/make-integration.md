---
title: "Flompt + Make.com : automatisez vos workflows IA sans une ligne de code"
date: "2026-03-14"
excerpt: "Flompt peut maintenant envoyer vos prompts assemblés directement vers Make.com via webhook. Déclenchez n'importe quelle automatisation, Notion, Slack, Airtable, email, dès que votre prompt est prêt. Une contribution de @Refaltor77."
tags: ["make.com", "automatisation", "workflow", "webhook", "communauté", "open-source"]
---

## Du prompt au workflow

Construire un bon prompt IA, c'est une chose. Faire quelque chose d'utile avec le résultat, c'en est une autre.

Jusqu'à présent, le travail de flompt s'arrêtait au bouton "Copier". Vous assembliez votre prompt structuré, le copiez, le colliez dans ChatGPT ou Claude, obteniez une réponse, puis vous deviez manuellement router ce résultat là où il devait aller, une page Notion, un message Slack, une ligne Airtable, un Google Sheet.

[**@Refaltor77**](https://github.com/Refaltor77) a changé ça.

## L'intégration Make.com

Le nouveau bouton **Envoyer vers Make.com** dans le panneau de résultat de flompt vous permet d'envoyer votre prompt assemblé directement vers un webhook Make.com en un seul clic.

Make.com (anciennement Integromat) est une plateforme d'automatisation visuelle avec plus de 2 000 connecteurs d'applications. Quand flompt envoie un prompt à votre webhook, Make peut le router n'importe où : le passer dans un module IA, stocker le résultat dans une base de données, envoyer une notification Slack, créer une page Notion, ou déclencher n'importe quel workflow multi-étapes que vous avez construit.

**Ce que flompt envoie à Make :**

```json
{
  "prompt": "<votre prompt XML assemblé>",
  "format": "claude",
  "blockCount": 6,
  "source": "flompt",
  "sentAt": "2026-03-13T10:42:00.000Z"
}
```

C'est tout. Pas d'auth, pas de clés API, pas de configuration au-delà d'un copier-coller de votre URL webhook.

## Comment configurer

**Dans Make.com :**
1. Créer un nouveau scénario
2. Ajouter un déclencheur **Webhooks → Custom webhook**
3. Copier l'URL webhook que Make vous donne

**Dans flompt :**
1. Assembler votre prompt (construire vos blocs, cliquer sur Compiler)
2. Cliquer sur **Envoyer vers Make.com** dans le panneau de résultat
3. Coller votre URL webhook, flompt la valide et la sauvegarde
4. Cliquer sur **Tester** pour vérifier la connexion
5. Cliquer sur **Envoyer** : votre prompt arrive dans Make instantanément

À partir de là, votre scénario Make prend le relais. Connectez-le à Claude AI, ChatGPT ou n'importe quel module LLM dans Make, traitez la réponse et routez-la où vous en avez besoin.

## Cas d'usage concrets

**Pipeline de contenu** : Construire un prompt d'article de blog dans flompt → envoyer à Make → Make le passe dans Claude → stocke le résultat dans Notion → notifie votre équipe dans Slack.

**Automatisation du support client** : Construire un template de réponse dans flompt avec des blocs de contexte client → envoyer à Make → Make traite avec l'IA → poste une réponse en brouillon dans Zendesk.

**Enrichissement de données** : Construire un prompt d'analyse de données dans flompt avec des blocs de variables → envoyer à Make → Make passe dans GPT → écrit les résultats dans Airtable.

**Rapports hebdomadaires** : Planifier un scénario Make pour récupérer des données, les injecter dans un prompt flompt via webhook, les traiter avec l'IA, et envoyer le rapport par email automatiquement.

## L'historique des envois

Chaque envoi est loggé dans le panneau **Envois récents** à l'intérieur de flompt. Horodatage, nombre de blocs, format et statut (succès/erreur). Vous savez toujours ce qui a été envoyé et quand, sans quitter l'outil.

## Pas de backend, pas de compte

L'intégration entière est locale. L'URL webhook est sauvegardée dans le `localStorage`, rien ne passe par les serveurs de flompt. Quand vous cliquez sur Envoyer, votre navigateur fait la requête POST directement vers le endpoint webhook de Make. Rapide, privé, et zéro infrastructure de notre côté.

## Encore une contribution de @Refaltor77

C'est la deuxième fonctionnalité majeure que @Refaltor77 a livrée pour flompt en peu de temps, après la [bibliothèque de 100+ templates](/blog/fr/template-library) qu'il a contribuée précédemment. Les deux fonctionnalités suivent la même philosophie : réduire la friction entre la construction d'un bon prompt et l'exploitation concrète du résultat.

L'intégration Make est disponible dès maintenant sur [flompt.dev](https://flompt.dev).

## La suite

L'intégration Make.com est la première étape vers une **couche d'automatisation** plus large pour flompt. La vision : flompt devient le front-end de construction de prompts pour n'importe quel pipeline IA, que ce soit Make, Zapier, n8n ou un backend custom.

La prochaine étape :
- **Intégration Zapier** : même logique, écosystème plus large
- **Support n8n** : pour les setups d'automatisation auto-hébergés
- **Variables de prompt** : injecter des valeurs dynamiques dans les blocs avant l'envoi
- **Envois planifiés** : déclencher des pipelines flompt → Make depuis l'app directement

Si vous construisez quelque chose d'intéressant avec flompt + Make, partagez-le sur [GitHub](https://github.com/Nyrok/flompt).

---

[**Essayer maintenant →**](https://flompt.dev/app) · [**Docs webhook Make.com**](https://www.make.com/en/help/tools/webhooks) · [**Star sur GitHub**](https://github.com/Nyrok/flompt)
