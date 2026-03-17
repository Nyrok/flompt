---
title: "Flompt + Make.com : automatisez vos workflows IA sans une ligne de code"
date: "2026-03-14"
excerpt: "Flompt peut maintenant envoyer vos prompts assemblés directement vers Make.com via webhook. Déclenchez n'importe quelle automatisation, Notion, Slack, Airtable, email, dès que votre prompt est prêt. Une contribution de @Refaltor77."
tags: ["make.com", "automatisation", "workflow", "webhook", "communauté", "open-source"]
color: "primary"
---

## Du prompt au workflow

Construire un bon prompt IA = une chose. Utiliser le résultat = une autre.

Flompt s'arrêtait au bouton "Copier". Tu assembles ton prompt. Copies. Colles dans ChatGPT ou Claude. Obtiens une réponse. Puis router manuellement : Notion. Slack. Airtable. Google Sheet.

[**@Refaltor77**](https://github.com/Refaltor77) a changé ça.

## L'intégration Make.com

Le nouveau bouton **Envoyer vers Make.com** dans le panneau de résultat de flompt. Envoie ton prompt assemblé. Vers un webhook Make.com. Un clic.

Make.com = plateforme d'automatisation visuelle. 2 000+ connecteurs. Quand flompt envoie un prompt, Make le route partout : module IA. Base de données. Notification Slack. Page Notion. N'importe quel workflow multi-étapes.

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

C'est tout. Pas d'auth. Pas d'API. Pas de configuration. Juste un copier-coller de ton webhook.

## Comment configurer

**Dans Make.com :**
1. Crée un nouveau scénario
2. Ajoute un déclencheur **Webhooks → Custom webhook**
3. Copie l'URL webhook

**Dans flompt :**
1. Assemble ton prompt (blocs + Compiler)
2. Clique sur **Envoyer vers Make.com**
3. Colle ton URL webhook. Flompt valide. Sauvegarde.
4. Clique sur **Tester** pour vérifier la connexion
5. Clique sur **Envoyer** : ton prompt arrive dans Make

Ton scénario Make prend le relais. Connecte-le à Claude AI. Ou ChatGPT. Ou n'importe quel module LLM. Traite. Route partout.

## Cas d'usage concrets

**Pipeline de contenu** : Prompt blog dans flompt → Make → Claude → Notion → Slack.

**Support client** : Template réponse dans flompt → Make → IA → brouillon Zendesk.

**Enrichissement de données** : Prompt analyse dans flompt → Make → GPT → Airtable.

**Rapports hebdomadaires** : Make récupère les données. Injecte dans flompt via webhook. Traite avec l'IA. Envoie par email automatiquement.

## L'historique des envois

Chaque envoi = loggé dans le panneau **Envois récents**. Horodatage. Nombre de blocs. Format. Statut (succès/erreur). Tu vois toujours ce qui a été envoyé. Quand. Sans quitter l'outil.

## Pas de backend, pas de compte

Intégration entière locale. L'URL webhook = `localStorage`. Rien ne passe par les serveurs de flompt. Tu cliques sur Envoyer. Ton navigateur = requête POST. Directe vers Make. Rapide. Privé. Zéro infrastructure.

## Encore une contribution de @Refaltor77

Deuxième fonctionnalité majeure de @Refaltor77. Après la [bibliothèque de 100+ templates](/blog/fr/template-library). Même philosophie : réduire la friction. Entre construire un bon prompt. Et l'exploiter concrètement.

Make = disponible maintenant sur [flompt.dev](https://flompt.dev).

## La suite

Make = première étape. Vers une **couche d'automatisation** plus large pour flompt. Vision : flompt = front-end pour n'importe quel pipeline IA. Make. Zapier. n8n. Backend custom.

**Prochaines étapes :**
- **Zapier** : même logique. Écosystème plus large.
- **n8n** : setups d'automatisation auto-hébergés.
- **Variables de prompt** : valeurs dynamiques dans les blocs.
- **Envois planifiés** : déclenche pipelines flompt → Make depuis l'app.

Construis quelque chose d'intéressant avec flompt + Make ? Partage-le sur [GitHub](https://github.com/Nyrok/flompt).

---

[**Essayer maintenant →**](https://flompt.dev/app) · [**Docs webhook Make.com**](https://www.make.com/en/help/tools/webhooks) · [**Star sur GitHub**](https://github.com/Nyrok/flompt)
