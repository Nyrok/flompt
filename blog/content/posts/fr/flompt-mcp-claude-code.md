---
title: "flompt est maintenant un outil natif de Claude Code"
date: "2026-02-26"
excerpt: "flompt intègre un serveur MCP. Ajoutez une ligne à la config de votre projet et decompose_prompt, compile_prompt deviennent des outils que Claude Code peut appeler directement. Sans installation, sans compte."
tags: ["claude code", "MCP", "outils développeur", "intégration"]
color: "primary"
---

## Le problème des prompts dans les workflows agentiques

Claude Code = code n'est pas difficile. Les prompts sont difficiles. Chaque tâche = un prompt qui pilote. Bon system prompt. Description précise. Contraintes bien délimitées. C'est là que se joue la qualité.

Jusqu'ici = pas de façon structurée de faire ça depuis un workflow agentique. Tu écrivais dans un fichier texte. Itérais manuellement. Espérais que ça tienne.

flompt change ça.

## Ce que MCP rend possible

MCP = expose des outils personnalisés à Claude Code. N'importe quel serveur = outil de premier ordre dans la boîte à outils.

flompt = serveur MCP hébergé sur `https://flompt.dev/mcp/`. Ajoute-le à ton projet. Claude Code gagne trois nouveaux outils :

- **`decompose_prompt`**: prend un prompt brut. Le découpe en blocs typés (role, objective, constraints, output format…).
- **`compile_prompt`**: prend une liste de blocs. Retourne un prompt XML optimisé pour Claude.
- **`list_block_types`**: décrit les 12 types de blocs. L'ordre canonique recommandé.

Pas d'installation. Pas d'API. Pas de compte. Serveur hébergé. Prêt à l'emploi.

## Setup : une seule commande

**Via CLI :**

```bash
claude mcp add --transport http --scope user flompt https://flompt.dev/mcp/
```

**Ou via `~/.claude.json` :**

```json
{
  "mcpServers": {
    "flompt": {
      "type": "http",
      "url": "https://flompt.dev/mcp/"
    }
  }
}
```

C'est tout. Dès la session suivante, `decompose_prompt`, `compile_prompt` et `list_block_types` sont disponibles.

## Ce que ça donne en pratique

Imaginons que vous construisiez une tâche Claude Code qui génère de la documentation. Au lieu de coder le prompt en dur, votre agent peut :

1. Appeler `list_block_types` pour comprendre ce qui est disponible
2. Appeler `decompose_prompt` sur un prompt existant pour en extraire la structure
3. Ajuster les blocs programmatiquement (changer l'objectif, ajouter une contrainte)
4. Appeler `compile_prompt` pour produire le XML final optimisé

Le résultat est le même XML structuré et optimisé pour Claude que celui produit par l'application web flompt : ordonné canoniquement, correctement balisé, utilisable immédiatement.

## Pourquoi le XML reste pertinent

La sortie de compilation ressemble à ça :

```xml
<prompt>
  <role>
    Tu es un rédacteur technique senior spécialisé dans la documentation développeur.
  </role>
  <objective>
    Rédige une documentation API claire et concise pour l'endpoint décrit ci-dessous.
  </objective>
  <constraints>
    Utilise le présent. Pas de langage marketing. Audience : développeurs backend.
  </constraints>
  <output_format>
    Markdown. Inclure : description, tableau des paramètres, exemple de requête, exemple de réponse.
  </output_format>
</prompt>
```

Les LLMs modernes analysent les balises XML comme des délimiteurs sémantiques. Le modèle sait exactement où le rôle se termine, où les contraintes commencent. Moins d'ambiguïté, meilleure isolation entre les sections, résultats plus cohérents.

Les guidelines de prompt engineering d'Anthropic recommandent ce format pour Claude. Flompt le rend automatique.

## Stateless par conception

Le serveur MCP est entièrement sans état. Chaque appel à `decompose_prompt` ou `compile_prompt` est indépendant : pas de session, pas d'état stocké, pas d'effets de bord. Sûr à appeler depuis n'importe quel agent, n'importe quel workflow, autant de fois que nécessaire.

---

[**Lire le guide d'intégration →**](/docs/claude-code) · [Essayer l'application web](https://flompt.dev/app)
