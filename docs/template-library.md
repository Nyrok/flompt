# Template Library

**100+ templates** across 10 categories. One click. No blank page.

---

## Opening the Library

Click the **book icon** (Library) in the left sidebar. The panel slides in over the canvas.

From there you can:
- Browse templates by **category** tab
- Scroll the full list within a category
- Select a **response language** before loading
- Click **Use** to load any template into the canvas

---

## Categories

| Category | Description | Count |
|---|---|---|
| **Code** | Code review, refactoring, documentation, debugging, test generation | 10 |
| **Writing** | Blog posts, essays, cover letters, creative fiction | 10 |
| **Marketing** | Ad copy, product descriptions, email campaigns, landing pages | 10 |
| **Productivity** | Meeting summaries, task prioritization, weekly planning | 10 |
| **Design** | UI feedback, design briefs, UX analysis, A/B tests | 8 |
| **Education** | Lesson plans, quiz generation, concept explanations | 7 |
| **Sales** | Cold outreach, pitch decks, objection handling | 8 |
| **Data** | SQL generation, data analysis, report summaries | 6 |
| **Creative** | Storytelling, worldbuilding, character development | 8 |
| **Personal** | Career advice, habit tracking, reflection prompts | 7 |

---

## Response Language Selector

Before loading a template, select the language Claude should respond in. flompt automatically appends a `<language>` block to the canvas.

This is useful when your team works in a language different from the template's source language — the template structure stays the same, the output language changes.

---

## How Templates Work Under the Hood

Templates are stored as individual JSON files in `app/templates/<category>/<id>.json`. The format is intentionally minimal:

```json
{
  "id": "blog-post",
  "category": "writing",
  "i18n": {
    "en": {
      "name": "Blog Post",
      "description": "Write a structured, SEO-friendly blog post on any topic."
    },
    "fr": {
      "name": "Article de blog",
      "description": "Rédigez un article de blog structuré et optimisé SEO."
    }
  },
  "blocks": [
    { "type": "role", "content": "You are an expert content writer..." },
    { "type": "objective", "content": "Write a complete, engaging blog post..." }
  ]
}
```

**No positions, no IDs, no React Flow internals** — just block types and content. The loader (`app/src/lib/templates.ts`) hydrates each JSON file into full `FlomptNode` objects at build time using `import.meta.glob`. Zero runtime I/O.

---

## Contributing a Template

Adding a template is a simple JSON contribution — no TypeScript knowledge required.

1. Fork the repository
2. Create a new file: `app/templates/<category>/<your-id>.json`
3. Follow the schema above — required fields: `id`, `category`, `i18n.en`, `i18n.fr`, `blocks[]`
4. Each block needs `type` (one of the 13 block types) and `content` (string)
5. Open a pull request

**Rules:**
- `id` must be unique across all templates (use `kebab-case`)
- `category` must be one of the 10 existing categories
- At minimum, provide `en` and `fr` translations
- Don't include positions, node IDs, or React Flow metadata — the loader handles those

> The template library was originally contributed by [@Refaltor77](https://github.com/Refaltor77). The goal is an open marketplace where anyone can publish, fork, and remix prompt flows.

---

## Loading a Template

When you click **Use**, the loader:

1. Maps each `blocks[]` entry to a `FlomptNode` with `type: 'block'`
2. Auto-positions nodes vertically (60px start, 185px gap)
3. Replaces the current canvas state with the template nodes
4. Opens the canvas, ready to edit

Templates do not auto-connect blocks — you can connect them manually or run **Decompose** to let the AI infer the optimal flow.
