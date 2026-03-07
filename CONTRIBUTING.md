# Contributing to flompt

Thanks for wanting to contribute! flompt is open-source and MIT licensed — PRs, bug reports, and feature ideas are all welcome.

## Table of Contents

- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Development workflow](#development-workflow)
- [Code style](#code-style)
- [Adding a block type](#adding-a-block-type)
- [Adding a language](#adding-a-language)
- [Submitting a PR](#submitting-a-pr)

---

## Getting started

**Requirements:** Node.js 18+, Python 3.12+

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/flompt.git
cd flompt

# 2. Start the backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # optional: add your Anthropic/OpenAI key
uvicorn app.main:app --reload --port 8000

# 3. Start the frontend (new terminal)
cd app
npm install
npm run dev             # → http://localhost:5173
```

The heuristic decomposer works without an API key — you don't need one to develop most features.

---

## Project structure

```
flompt/
├── app/          # React 18 + Vite frontend (TypeScript)
│   └── src/
│       ├── components/   # UI components
│       ├── i18n/         # 10 locale JSON files
│       ├── lib/          # assemblePrompt, analytics, platform
│       ├── services/     # HTTP client (axios)
│       ├── store/        # Zustand state
│       └── types/        # TypeScript types (blocks.ts)
├── backend/      # FastAPI backend (Python)
│   └── app/
│       ├── routers/      # decompose, compile
│       └── services/     # ai_service, compiler, decomposer
├── blog/         # Next.js blog (static export)
├── extension/    # Chrome / Firefox / Safari MV3 extension
├── docs/         # GitBook documentation
└── landing/      # Static landing page
```

For a deeper dive, read [`CLAUDE.md`](CLAUDE.md) — it covers design rules, block ordering, CSS conventions, and deployment architecture.

---

## Development workflow

1. **Create a branch** from `master`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** — keep commits focused and atomic.

3. **Test locally** before opening a PR:
   - Frontend: `npm run build` in `app/` should succeed with no errors
   - Backend: your new route/service should handle edge cases gracefully
   - If you touched the extension: test on at least one browser

4. **Open a PR** — the template will guide you.

---

## Code style

- **TypeScript everywhere** in the frontend. New types go in `app/src/types/blocks.ts`.
- **No inline styles** — use CSS classes. New design tokens go in `:root` in `app/src/styles.css`.
- **No `console.log`** in production code paths.
- **English only** in source code (comments, variable names, function names). UI strings live in i18n JSON files.
- Backend: we use **Ruff** for linting. Run `ruff check app/` before committing.

---

## Adding a block type

Block types are defined in two places:

1. **`app/src/types/blocks.ts`** — add the new type literal to `BlockType`
2. **`app/src/lib/assemblePrompt.ts`** — add it to `TYPE_PRIORITY` (controls XML ordering) and `XML_TAG_MAP` (controls the output XML tag)
3. **`backend/app/services/compiler.py`** — add the XML tag mapping
4. **`backend/app/services/decomposer.py`** — add keyword heuristics for auto-detection
5. **All 10 i18n files** in `app/src/i18n/` — add `blockType.<newType>` label and description

> Read [`docs/block-types.md`](docs/block-types.md) to understand the existing block taxonomy before adding a new one.

---

## Adding a language

1. Copy `app/src/i18n/en.json` to `app/src/i18n/<locale>.json`
2. Translate all string values (keep keys in English)
3. Add the locale to `SUPPORTED_LOCALES` in `app/src/i18n/LocaleContext.tsx`
4. Add a blog translation folder: `blog/content/posts/<locale>/`
5. Add the locale to `blog/src/i18n/config.ts`

---

## Submitting a PR

- Target the `master` branch
- Keep PRs focused — one feature or fix per PR
- The CI will run lint + build checks automatically
- A maintainer will review and merge

If you're working on something large, open an issue first to discuss the approach before investing a lot of time.

---

## Questions?

Open a [GitHub Discussion](https://github.com/Nyrok/flompt/discussions) or drop a message in an issue. We're friendly.
