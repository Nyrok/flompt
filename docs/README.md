# Welcome to flompt

**flompt** is a Visual AI Prompt Builder — a free, open-source tool that transforms how you craft prompts for AI models. Instead of writing monolithic blocks of text, flompt lets you decompose, visually edit, and assemble prompts into structured XML output — ready to inject into any LLM.

🔗 Live at: [https://flompt.dev](https://flompt.dev)

---

## What is flompt?

The name comes from **flow + prompt**. It reflects the core idea: prompt engineering as a visual flow, not a wall of text.

Think of it as **Figma for Prompts** — visual, structured, and modular.

## The three-step workflow

1. **Decompose** — Paste any raw prompt. flompt's AI (Claude) automatically breaks it into semantic blocks.
2. **Edit visually** — Drag, connect, and edit blocks on an interactive canvas powered by React Flow.
3. **Assemble** — Generate a structured XML prompt from your visual flow — 100% local, instant, ready to inject into any LLM.

> No sign-up required. Free forever. Self-hostable under MIT license.

## Template Library

**100+ ready-to-use prompt templates** across 10 categories — code, writing, marketing, productivity, design, education, sales, data, creative, personal. One click loads a complete structured canvas. No blank page.

→ [Template Library documentation](./template-library.md)

## Projects

Manage multiple independent workspaces. Each project saves its own canvas, prompt, and output to localStorage — switch between them instantly. Export and import projects as JSON files to share with teammates or back up your work.

→ [Projects documentation](./projects.md)

## Make.com Integration

Send your assembled prompt to a Make.com webhook with one click. Trigger any automation — Claude, GPT, Notion, Slack, Airtable — the moment your prompt is ready. No backend, no API key, fully client-side.

→ [Make.com integration documentation](./make-integration.md)

## Browser Extension

flompt is available as a **browser extension** for Chrome and Firefox — a sidebar that opens directly inside ChatGPT, Claude, or Gemini. Build your prompt visually, click "Send to AI", and it's injected into the chat input. No tab switching, no copy-pasting.

Supported platforms: ChatGPT · Claude · Gemini

→ [Chrome](https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc) · [Firefox](https://addons.mozilla.org/addon/flompt-visual-prompt-builder/) · [Install instructions](./chrome-extension.md)

## Privacy

No account. No data retention. Everything stays in your browser. The backend only receives prompt text during the Decompose step — and discards it immediately.

→ [Privacy & Data Retention](./privacy.md)
