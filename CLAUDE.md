# CLAUDE.md — flompt

## ⚠️ Mandatory Rules
- **NEVER commit or push `_uploads/` directories** — they exist at the root, in `blog/`, and in `extension/`. These folders contain raw uploaded files and must stay local only. They are in `.gitignore`; never override or bypass this rule.

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
- **MCP** : FastMCP server (`backend/app/mcp_server.py`) exposes decompose/compile tools — registered on Glama.ai
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
├── docs/          # Documentation (block-types, chrome-extension, how-it-works, claude-code)
├── marketing/     # Marketing strategy, post drafts, activity logs
├── deploy.sh      # Full redeploy script (builds app+blog, restarts backend, reloads Caddy, health checks)
├── docker-compose.yml  # Local development (backend + frontend services)
├── supervisord.conf    # Production process manager (backend + Caddy)
├── watchdog.sh / keepalive.sh  # Supervisor health monitoring
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
./caddy reload --config /projects/flompt/Caddyfile  # may hang — use workaround below if so
./caddy stop

# Caddy reload workaround (use if `caddy reload` hangs indefinitely)
/projects/flompt/caddy adapt --config /projects/flompt/Caddyfile 2>/dev/null \
  | curl -s -X POST "http://localhost:2019/load" -H "Content-Type: application/json" -d @-

# Full redeploy (preferred — handles everything)
bash /projects/flompt/deploy.sh

# Manual redeploy
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

## Template Library

Templates live in `app/templates/<category>/<id>.json` — one file per template, no TypeScript required.

### Adding a template

Create a JSON file in the matching category folder. Schema:

```json
{
  "id": "my-template",
  "category": "writing",
  "i18n": {
    "en": { "name": "My Template", "description": "One-sentence description." },
    "fr": { "name": "Mon template", "description": "Description en une phrase." }
  },
  "blocks": [
    { "type": "role",      "content": "You are a…" },
    { "type": "objective", "content": "Write a…"  }
  ]
}
```

### Rules
- `id` — unique, kebab-case, must match the filename (e.g. `my-template.json`)
- `category` — one of: `writing` `code` `marketing` `productivity` `design` `education` `sales` `data` `creative` `personal`
- `blocks[].type` — one of the 16 block types (see table below)
- No positions, IDs, or React Flow internals needed — `src/lib/templates.ts` handles hydration via `import.meta.glob`
- At least `en` and `fr` must be present in `i18n`; other locales fall back to `en`

### How the loader works
`app/src/lib/templates.ts` uses `import.meta.glob('../../templates/**/*.json', { eager: true })` to import all JSON files at Vite build time. `hydrate()` converts `blocks[]` → `FlomptNode[]` (positions + IDs auto-generated). Exports `TEMPLATES`, `TEMPLATE_CATEGORIES`, `CATEGORY_COLORS`, `LOCALE_TO_LANG` — no change needed in consuming components.

---

## Block Types (16 total)

Ordered as assembled (TYPE_PRIORITY in `assemblePrompt.ts`):

| # | Type | Icon | Color | Description |
|---|------|------|-------|-------------|
| 0 | `document` | FileText | `#86efac` | XML grounding via `<document>` — always first |
| 1 | `role` | UserRound | `#c084fc` | AI persona / role |
| 2 | `tools` | Wrench | `#fb923c` | Callable functions and tools the AI can use |
| 3 | `audience` | Users | `#93c5fd` | Who the output is written for |
| 4 | `context` | Layers | `#94a3b8` | Background information |
| 5 | `environment` | Terminal | `#22d3ee` | System context: OS, paths, date, runtime |
| 6 | `objective` | Target | `#fbbf24` | Main task (what to DO) |
| 7 | `goal` | Flag | `#6ee7b7` | End goal and success criteria |
| 8 | `input` | LogIn | `#4ade80` | Data/variables provided to the AI |
| 9 | `constraints` | ShieldAlert | `#fb7185` | Rules and limits |
| 10 | `guardrails` | Lock | `#ef4444` | Hard limits and safety refusals — dashed border visual |
| 11 | `examples` | Lightbulb | `#c4b5fd` | Few-shot input/output pairs |
| 12 | `chain_of_thought` | Zap | `#fde68a` | Step-by-step reasoning instructions |
| 13 | `output_format` | LogOut | `#ff6b9d` | Expected response format — rounded bottom |
| 14 | `response_style` | Wand2 | `#2dd4bf` | Structured style UI (verbosity/tone/markdown/LaTeX) |
| 15 | `language` | Languages | `#38bdf8` | Output language — always last |

**Removed blocks**: `chain_of_thought` was temporarily removed then restored (Zap icon). `format_control` was removed — `response_style` now covers all formatting directives.

**XML tag mapping** (Claude format):
- `response_style` → `<format_instructions>`
- `chain_of_thought` → `<thinking>`
- `output_format` → `<output_format>`
- all others → same name as type

---

## Make.com Integration

### Architecture
- **No backend** — all state lives in `localStorage` via a persisted Zustand store (`flompt-make`)
- **Entry point** — "Send to Make.com" button in `PromptOutput.tsx` (web only, hidden when `isExtension === true`)
- **Panel** — slide-in overlay from the right (`MakeIntegration.tsx`), mounted globally in `App.tsx`

### Key files

| File | Role |
|------|------|
| `app/src/store/makeStore.ts` | Persisted Zustand store — `webhookUrl` + `history` (last 10) saved to localStorage; `isPanelOpen`, `isSending`, `lastStatus` are transient |
| `app/src/components/MakeIntegration.tsx` | Full panel UI: webhook input, test button, prompt preview, send button, execution history, docs link |

### Payload sent to Make
```json
{
  "prompt": "<assembled prompt text>",
  "format": "claude | chatgpt | gemini",
  "blockCount": 5,
  "source": "flompt",
  "sentAt": "<ISO string>"
}
```

### CSS tokens
```css
--make:       #6B5DFA   /* Make brand purple */
--make-2:     #5548d4   /* hover state */
--make-light: rgba(107, 93, 250, 0.15)
--make-glow:  rgba(107, 93, 250, 0.3)
```

### Analytics events
- `make_panel_opened` — user opens the panel
- `make_send_prompt` — props: `format`, `block_count`, `chars`
- `make_send_success` — webhook returned 2xx
- `make_send_error` — props: `reason`

### Validation rules
- Webhook URL must be a valid `http(s)://` URL containing `make.com`
- Send button disabled if: no valid webhook URL OR no compiled prompt
- Test = POST with `{ _flompt_ping: true }` — Make webhooks always return 200

---

## MCP Server (Claude Code Integration)

flompt exposes its core tools as an MCP (Model Context Protocol) server so Claude Code and other MCP clients can decompose and compile prompts programmatically.

### Key files

| File | Role |
|------|------|
| `backend/app/mcp_server.py` | FastMCP server — exposes `decompose_prompt` and `compile_prompt` tools |
| `backend/mcp_stdio.py` | Stdio transport entry point for local MCP usage |
| `Dockerfile` (root) | Builds standalone MCP container image |
| `glama.json` | Glama.ai MCP registry schema |

### Tools exposed
- `decompose_prompt` — breaks a raw prompt into structured blocks
- `compile_prompt` — assembles blocks into Claude-optimized XML

### Connection
```bash
# Remote (HTTP)
claude mcp add --transport http --scope user flompt https://flompt.dev/mcp/

# Local (stdio)
python backend/mcp_stdio.py
```

---

## Deployment Infrastructure

### Production process management
- `supervisord.conf` manages two processes: `flompt-backend` (uvicorn) and `flompt-caddy`
- `watchdog.sh` monitors supervisor, kills zombie uvicorn processes on port 8000
- `keepalive.sh` auto-restarts supervisor if it stops

### Docker (local dev / MCP)
- `docker-compose.yml` — local dev with backend + frontend services
- Root `Dockerfile` — standalone MCP server container (Python 3.12, runs `mcp_stdio.py`)
- `backend/Dockerfile` — FastAPI container (Python 3.12 slim)

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
- **List View** : second editing mode (toggle top-right). Horizontal toolbar (left: actions + compile, centre: block-type pills via `CanvasBlockBar toolbar`, right: view switcher). Each block is a card with header, editable textarea, ↑/↓ reorder, copy (duplicate), and delete buttons. Block names use `t.blocks[type].label` (live i18n, not stored label). Supports drag & drop from sidebar.
- **Hide / Show** : Eye/EyeOff button on every block in both views. A hidden block is excluded from the assembled prompt. Rendered at reduced opacity (0.4 in List View, 0.35 in Canvas View).
- **Duplicate** : Copy button on each card in List View — inserts a clone immediately after the source block with `hidden: false`.
- **Drag-over highlight** : dashed accent outline (`outline: 2px dashed var(--accent)`) on both FlowCanvas (`.flow-canvas--drag-over`) and BlockListView (`.block-list-view--drag-over`) when a sidebar block is dragged over. `onDragLeave` on canvas checks `relatedTarget` to avoid flicker on children.
- **Decompose overlay** : `loading-overlay` (Sparkles + dots + queue status) appears in both canvas and list view when `isDecomposing === true`. Same JSX, same CSS class, driven by the same Zustand state.
- **Tooltips** : `@radix-ui/react-tooltip` (Shadcn Tooltip core) wraps all icon-only buttons app-wide. `TooltipProvider` in `App.tsx`. Component at `components/ui/tooltip.tsx`. All `title=` attributes removed from tooltipped buttons; `aria-label` kept for screen readers. CSS class `.tooltip-content` in styles.css.

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
- **`caddy reload` CLI can hang** after adapting the config. If it does, use the API workaround: `caddy adapt --config Caddyfile 2>/dev/null | curl -s -X POST http://localhost:2019/load -H "Content-Type: application/json" -d @-`

### 3. Blog — Static Export
- The blog uses `output: "export"` → generates static files in `out/`
- **NO Node server in production** — Caddy serves the files directly
- `basePath: "/blog"` → assets in the HTML are prefixed `/blog/_next/...`
- `handle_path /blog*` strips `/blog`, files are found in `out/_next/...`
- After every blog change: `rm -rf .next && npm run build` then check CSS/JS assets
- **Blog slugs MUST match between EN and FR** — the locale switcher relies on identical filenames in `content/posts/en/` and `content/posts/fr/`. The slug is ALWAYS the English filename (e.g. `template-library.md` in both locales, never `bibliotheque-templates.md`). Never translate the slug into French.

### 4. Before touching React Flow handles
- Handles are positioned by React Flow with `position: absolute` + `top`/`left`
- To resize without shifting position → use `transform: scale()`
- `connectOnClick={true}` + `ConnectionMode.Loose` = click source then target, no drag

### 5. English only
- **The entire codebase must be in English** — comments, docstrings, log messages, inline strings, CSS comments, shell scripts, Makefiles, config files
- The only exception: i18n translation files (`fr.json`, `translations.ts`) and French blog post content (`content/fr/`) which are intentionally in French for end users
- Never write French comments or strings anywhere else

### 5. Writing style (all surfaces)
- **No em dashes (—) or en dashes (–)**, ever. Use commas, periods, or rephrase.
- **Short, concise, straight to the point.** No filler, no fluff, no corporate speak.
- Sounds like a dev typing fast, not a polished essay or an AI-generated blog post.
- Applies everywhere: marketing copy, README, landing page, blog, commit messages, comments, docs.

#### Anti-AI-slop rules (ref: tropes.fyi)
These patterns are instant tells of AI-generated text. Never use them:
- **No negative parallelism**: "It's not X, it's Y" / "Not X. Not Y. Just Z." / "Not because X, but because Y" / "No X. No Y. Just Z."
- **No self-posed rhetorical questions**: "The result? Devastating." / "The X? A Y."
- **No magic adverbs**: quietly, deeply, fundamentally, remarkably, arguably, importantly, interestingly, notably, dramatically, radically, significantly
- **No AI vocabulary**: delve, utilize, leverage, robust, streamline, harness, tapestry, landscape, paradigm, synergy, ecosystem, actionable, optimization
- **No "serves as" dodge**: use "is", not "serves as" / "stands as" / "marks" / "represents"
- **No grandiose stakes inflation**: a prompt builder is not "defining the next era of computing" or "separating frustrating AI from remarkable AI"
- **No false suspense**: "Here's the kicker" / "Here's the thing" / "Here's where it gets interesting" / "Here's what changed everything"
- **No pedagogical voice**: "Let's break this down" / "Let's unpack this" / "Think of it as..." / "Once you master these basics..."
- **No fractal summaries**: don't intro what you'll say, say it, then summarize what you said
- **No signposted conclusions**: "In conclusion" / "To sum up" / "In summary"
- **No invented concept labels**: "validation-first" / "battle-tested prompt flow" / made-up compound terms
- **No "Despite its challenges..."**: don't acknowledge problems just to dismiss them immediately
- **No bold-first bullets in prose**: only use bold-first in reference tables, not in marketing or blog content
- **No false vulnerability**: no simulated self-awareness or polished "authenticity"
- **No vague attributions**: "experts say" / "studies show" without specifics
- **No one-point dilution**: say it once, well. Don't restate 6 ways across a page.
- **No superficial analyses**: no tacked-on "-ing" phrases like "reflecting broader trends"
- **No AI tricolons**: avoid the "structured, optimized, and ready to use" three-adjective AI cadence
- **No false ranges**: "From X to Y" where X and Y aren't on a real spectrum

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
- Landing block count stat must stay in sync with actual block count (currently **16**)

### 11. CustomSelect
- All native `<select>` replaced by `CustomSelect` (`components/CustomSelect.tsx`) styled like ProjectSelector
- Trigger variants via `triggerClassName`: `csel-trigger--locale`, `csel-trigger--sm`, `csel-trigger--full`, `csel-trigger--lib`
- `noReactFlow` prop adds `nodrag nopan` classes + `stopPropagation` on click (use inside React Flow nodes)
- `dropUp` prop for upward dropdown (e.g. near bottom of screen)
- CSS classes: `.csel`, `.csel-trigger`, `.csel-dropdown`, `.csel-option`, `.csel-option--active`, `.csel-chevron--open`

### 12. SEO baseline
- Blog: all pages have `og:image`, `twitter:card: summary_large_image`, explicit `twitter:images`
- Blog root layout: `og:locale: "fr_FR"` as default fallback
- Blog sitemap: uses real post dates (`post.date`) not `new Date()`
- Blog robots.txt: references both `/blog/sitemap.xml` and `/sitemap.xml`
- Landing privacy.html + terms.html: `og:image` + `twitter:card` added
- App index.html: `twitter:description` + full hreflang set (10 locales + x-default)

### 10. Backend — known pitfalls
- **`idb` package** must be installed in `app/` (`npm install idb`) — required by `src/lib/db.ts` (Context Memory + Version History). If missing, `tsc` fails and `npm run build` produces no `dist/`.
- **AI_MODEL in `backend/.env`** must be a valid model ID for the configured provider. For Groq: use `llama-3.3-70b-versatile` (supports `response_format: json_object`). The value `openai/gpt-oss-120b` is **invalid** on Groq.
- **Backend restart** — `supervisorctl` is not available in this environment. To restart the backend, find the PID via `cat /proc/*/cmdline | tr '\0' ' '` and `kill -9 <pid>`, then relaunch with `cd /projects/flompt/backend && nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/flompt-backend.log 2>&1 &`. `pkill`/`fuser` are unreliable here.
- **New routers won't load** until the backend process is fully restarted — verify with `curl -s http://localhost:8000/openapi.json | python3 -c "import sys,json; [print(p) for p in json.load(sys.stdin)['paths']]"`

