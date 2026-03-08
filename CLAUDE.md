# CLAUDE.md — flompt

## Project Identity
- **flompt** = flow + prompt — Visual AI Prompt Builder
- **URL** : https://flompt.dev
- **Repo** : https://github.com/Nyrok/flompt (monorepo)
- **Git email** : nyrokgaming1@gmail.com

## Stack
- **App** : React 18 + TypeScript + React Flow v11 + Zustand + Vite (SPA in `/app`)
- **Blog** : Next.js 16 + Tailwind CSS (static export in `/blog`, bilingual FR/EN)
- **Landing** : Static HTML (in `/landing`)
- **Backend** : FastAPI + Uvicorn (Python 3.12, port 8000)
- **Reverse Proxy** : Caddy (auto-TLS Let's Encrypt, port 443)
- **AI** : Anthropic Claude (pluggable, via httpx) + Groq (Llama Guard 4 prompt safety — currently DISABLED via `PROMPT_GUARD_ENABLED=false` in `backend/.env`)
- **Analytics** : PostHog (EU region) — autocapture, session replay, heatmaps, error tracking
- **i18n** : 10 languages (EN FR ES DE PT JA TR ZH AR RU) via LocaleContext + JSON files. Locale priority: URL path (`/app/fr`) → localStorage → default `'en'`
- **SEO** : Static locale pages generated post-build (`app/scripts/generate-locale-pages.js`). Each `/app/[locale]` serves a dedicated HTML with localized title, description, canonical and hreflang×10

## Deployment Architecture
```
flompt.dev/
├── /           → landing/index.html (static, catch-all)
├── /app*       → app/dist/ (Vite SPA, handle_path strips /app)
├── /blog*      → blog/out/ (Next.js static export, handle_path strips /blog)
├── /api/*      → FastAPI :8000 (reverse_proxy)
└── /health     → FastAPI :8000 (reverse_proxy)
```

## Monorepo Structure
```
/projects/flompt/
├── app/           # Vite React SPA (prompt builder)
│   ├── src/       # React components, styles, store
│   ├── dist/      # Production build (gitignored)
│   └── index.html # Entry point (base: /app)
├── blog/          # Next.js blog (static export)
│   ├── src/       # Pages, components, i18n
│   ├── content/   # Markdown posts (fr/ + en/) — slugs MUST match between locales
│   ├── out/       # Static export (gitignored)
│   └── next.config.ts  # basePath: /blog, output: export
├── landing/       # Static landing page
│   └── index.html
├── backend/       # FastAPI backend
│   ├── app/
│   └── .venv/
├── extension/     # Browser extension (Chrome + Firefox)
│   ├── Makefile   # make = both; make chrome; make firefox
│   └── dist/      # Built zips (gitignored)
├── Caddyfile      # Reverse proxy config
├── caddy          # Caddy binary (gitignored, 50MB)
└── CLAUDE.md      # This file
```

## Commands
```bash
# App build (production)
cd /projects/flompt/app && npm run build

# Blog build (static export → out/)
cd /projects/flompt/blog && rm -rf .next && npm run build

# Backend
cd /projects/flompt/backend && .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

# Extension
cd /projects/flompt/extension
make              # icons + chrome + firefox (both zips)
make chrome       # dist/flompt-chrome.zip (Chrome Web Store)
make firefox      # dist/flompt-firefox.zip (Firefox AMO)
make icons        # regenerate PNG icons from icon.svg

# Caddy
cd /projects/flompt && ./caddy start --config Caddyfile
./caddy reload --config /projects/flompt/Caddyfile
./caddy stop

# Full redeploy
cd /projects/flompt/app && npm run build
cd /projects/flompt/blog && rm -rf .next && npm run build
./caddy reload --config /projects/flompt/Caddyfile

# Health check
curl -sk -o /dev/null -w "%{http_code}" https://flompt.dev/
curl -sk -o /dev/null -w "%{http_code}" https://flompt.dev/app
curl -sk -o /dev/null -w "%{http_code}" https://flompt.dev/blog/en
curl -sk -o /dev/null -w "%{http_code}" https://flompt.dev/health
```

---

## Block Types (12 total)

Ordered as assembled (TYPE_PRIORITY in `assemblePrompt.ts`):

| # | Type | Icon | Color | Description |
|---|------|------|-------|-------------|
| 0 | `document` | FileText | `#86efac` | XML grounding via `<document>` — always first |
| 1 | `role` | UserRound | `#c084fc` | AI persona / role |
| 2 | `audience` | Users | `#93c5fd` | Who the output is written for |
| 3 | `context` | Layers | `#94a3b8` | Background information |
| 4 | `objective` | Target | `#fbbf24` | Main task (what to DO) |
| 5 | `goal` | Flag | `#6ee7b7` | End goal and success criteria |
| 6 | `input` | LogIn | `#4ade80` | Data/variables provided to the AI |
| 7 | `constraints` | ShieldAlert | `#fb7185` | Rules and limits |
| 8 | `examples` | Lightbulb | `#c4b5fd` | Few-shot input/output pairs |
| 9 | `chain_of_thought` | Zap | `#fde68a` | Step-by-step reasoning instructions |
| 10 | `output_format` | LogOut | `#ff6b9d` | Expected response format — rounded bottom |
| 11 | `response_style` | Wand2 | `#2dd4bf` | Structured style UI (verbosity/tone/markdown/LaTeX) |
| 12 | `language` | Languages | `#38bdf8` | Output language — always last |

**Removed blocks**: `chain_of_thought` was temporarily removed then restored (Zap icon). `format_control` was removed — `response_style` now covers all formatting directives.

**XML tag mapping** (Claude format):
- `response_style` → `<format_instructions>`
- `chain_of_thought` → `<thinking>`
- `output_format` → `<output_format>`
- all others → same name as type

---

## Analytics & Error Tracking (PostHog)
- **Project** : EU region (`https://eu.i.posthog.com`)
- **MCP** : installed via `claude mcp add --transport http posthog https://mcp.posthog.com/mcp` (user scope)
- **App** : `posthog-js` initialized in `src/lib/analytics.ts` with `capture_exceptions: true`, session replay, heatmaps
- **Blog** : `posthog-js` initialized in `PostHogProvider.tsx` with `capture_exceptions: true`
- **Error boundaries** :
  - App → `ErrorBoundary.tsx` calls `posthog.captureException(error)` + `track('app_crash')`
  - Blog → `src/app/error.tsx` calls `posthog.captureException(error)`
- **Env vars** : `VITE_POSTHOG_KEY` (app) / `NEXT_PUBLIC_POSTHOG_KEY` (blog)

---

## Key UX Behaviours
- **Decompose button** : disabled while decomposing, disabled if `rawPrompt` hasn't changed since last successful decomposition (`lastDecomposedPrompt` in Zustand store)
- **Assemble Prompt button** : disabled if `nodes.length === 0` OR `compiledPrompt !== null` (i.e. already compiled and no changes since — the store resets `compiledPrompt` to `null` on any node/edge mutation)
- **Star popup** (`StarPopup.tsx`) : shown once (localStorage key `flompt-star-popup-v1`) after `STAR_EVENT = 'flompt:action-completed'` fires. Triggered by: compile, decompose, inject to AI (extension), FAB assembly (mobile). Rendered in ALL modes (web + extension).
- **Canvas overlays** : `CanvasBlockBar` (left, vertically centered) + `canvas-ctrl-bar` (top-left: Clear → Undo → Redo)
- **Extension** : `isExtension` flag from `src/lib/platform.ts`. After inject → dispatches STAR_EVENT. GitHub button replaces Share button everywhere (`PromptOutput.tsx`).

---

## Design / Branding
- **Logo** : no icon, the title "flompt" in Caveat font (handwritten) is enough
- **Font titre** : `Caveat` (Google Fonts), 700, accent color + glow
- **Font body** : `Inter` (Google Fonts)
- **Accent** : #FF3570 (app) / #ff4d82 (landing+blog)
- **Accent glow** : `text-shadow: 0 0 10px var(--accent-glow)`
- **Theme** : Mermaid-inspired dark (#1c1c1e)
- **Tagline** : "flow + prompt = flompt"
- **SEO Language** : English default (html lang="en", OG locale en_US). Locale pages at `/app/[locale]` use the correct lang + hreflang set
- **Firefox icon** : `FaFirefoxBrowser` from `react-icons/fa6` (app + blog). Landing uses inline SVG extracted from the same package.

---

## Working Rules for Noryk

### 1. Before modifying CSS
- **Always check the cascade** : desktop styles declared AFTER a mobile media query will override it
- **Put mobile overrides last** or right after the block they override
- **Never change width/height to resize a positioned element** → use `transform: scale()`
- `!important` in React Flow code is necessary because RF injects its own inline styles
- `backdrop-filter` without `-webkit-` prefix = broken on iOS Safari → use solid background instead

### 2. Before modifying the Caddyfile
- **Specific `handle` blocks MUST come before the catch-all `handle`** (landing)
- Use `handle_path` (not `handle` + `uri strip_prefix`) for sub-paths (/app, /blog)
- `handle_path /app*` automatically strips the `/app` prefix from the path
- **After every Caddy change**, test: landing `/`, app `/app`, blog `/blog/en`, health `/health`

### 3. Blog — Static Export
- The blog uses `output: "export"` → generates static files in `out/`
- **NO Node server in production** — Caddy serves the files directly
- `basePath: "/blog"` → assets in the HTML are prefixed `/blog/_next/...`
- `handle_path /blog*` strips `/blog`, files are found in `out/_next/...`
- After every blog change: `rm -rf .next && npm run build` then check CSS/JS assets
- **Blog slugs MUST match between EN and FR** — the locale switcher relies on identical filenames in `content/posts/en/` and `content/posts/fr/`

### 4. Before touching React Flow handles
- Handles are positioned by React Flow with `position: absolute` + `top`/`left`
- To resize without shifting position → use `transform: scale()`
- `connectOnClick={true}` + `ConnectionMode.Loose` = click source then target, no drag

### 5. English only
- **The entire codebase must be in English** — comments, docstrings, log messages, inline strings, CSS comments, shell scripts, Makefiles, config files
- The only exception: i18n translation files (`fr.json`, `translations.ts`) and French blog post content (`content/fr/`) which are intentionally in French for end users
- Never write French comments or strings anywhere else

### 6. Understand intent before acting
- **If the request is ambiguous about WHAT** (not how) → ask for clarification
- **Rule** : if a change is destructive or structural (type swaps, architecture refactor), confirm intent

### 7. Before git add
- **Check `.gitignore`** — `*.png`, `caddy`, `dist/`, `.next/`, `node_modules/` are ignored
- For images in `app/public/`, use `git add -f`
- Never commit the `caddy` binary (50MB)
- Never commit `.env`, `credentials.json`
- **NEVER add a Co-Authored-By line** in commit messages — commits are signed by Noryk only

### 8. After each change
1. **Always commit & push** after any file modification — no exception
2. **Always redeploy** after each commit (`bash /projects/flompt/deploy.sh`)
3. Build the app/blog depending on what changed
4. Check routes via curl (landing, app, blog, health)
5. Never say "done" without having verified

### 9. Coherence across surfaces
- Block types exist in: `app/src/types/blocks.ts`, `assemblePrompt.ts`, `en.json`, `fr.json`, `backend/models/blocks.py`, `compiler.py`, `decomposer.py`, `ai_service.py`, `landing/index.html`, `docs/block-types.md`, `docs/claude-code.md`, `docs/how-it-works.md`, blog posts (EN + FR)
- **When adding/removing a block** → update ALL of the above. Don't forget blog FR articles.
- Landing block count stat must stay in sync with actual block count (currently **12**)

