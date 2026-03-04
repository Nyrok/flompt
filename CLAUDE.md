# CLAUDE.md — flompt

## Project Identity
- **flompt** = flow + prompt — Visual AI Prompt Builder
- **URL** : https://flompt.dev
- **Repo** : https://github.com/Nyrok/flompt (monorepo)
- **Organisation** : https://github.com/flompt (to be created — 5 separate repos planned)
- **Git email** : nyrokgaming1@gmail.com

## Stack
- **App** : React 18 + TypeScript + React Flow v11 + Zustand + Vite (SPA dans `/app`)
- **Blog** : Next.js 15 + Tailwind CSS (static export in `/blog`, bilingual FR/EN)
- **Landing** : HTML statique (dans `/landing`)
- **Backend** : FastAPI + Uvicorn (Python 3.12, port 8000)
- **Reverse Proxy** : Caddy (auto-TLS Let's Encrypt, port 443)
- **IA** : Anthropic Claude (pluggable, via httpx)
- **i18n** : FR/EN via LocaleContext (app) + fichiers markdown (blog)

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
│   ├── content/   # Markdown posts (fr/ + en/)
│   ├── out/       # Static export (gitignored)
│   └── next.config.ts  # basePath: /blog, output: export
├── landing/       # Static landing page
│   └── index.html
├── backend/       # FastAPI backend
│   ├── app/
│   └── .venv/
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

## Design / Branding
- **Logo** : no icon, the title "flompt" in Caveat font (handwritten) is enough
- **Font titre** : `Caveat` (Google Fonts), 700, accent color + glow
- **Font body** : `Inter` (Google Fonts)
- **Accent** : #FF3570 (app) / #ff4d82 (landing+blog)
- **Accent glow** : `text-shadow: 0 0 10px var(--accent-glow)`
- **Theme** : Mermaid-inspired dark (#1c1c1e)
- **Tagline** : "flow + prompt = flompt"
- **SEO Language** : English (html lang="en", OG locale en_US)

---

## Working Rules for Noryk

### 1. Before modifying CSS
- **Always check the cascade** : desktop styles declared AFTER a mobile media query will override it
- **Put mobile overrides last** or right after the block they override
- **Never change width/height to resize a positioned element** → use `transform: scale()`
- `!important` in React Flow code is necessary because RF injects its own inline styles

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

### 4. Before touching React Flow handles
- Handles are positioned by React Flow with `position: absolute` + `top`/`left`
- To resize without shifting position → use `transform: scale()`
- `connectOnClick={true}` + `ConnectionMode.Loose` = click source then target, no drag

### 5. Understand intent before acting
- **If the request is ambiguous about WHAT** (not how) → ask for clarification
- **Rule** : if a change is destructive or structural (type swaps, architecture refactor), confirm intent

### 6. Before git add
- **Check `.gitignore`** — `*.png`, `caddy`, `dist/`, `.next/`, `node_modules/` are ignored
- For images in `app/public/`, use `git add -f`
- Never commit the `caddy` binary (50MB)
- Never commit `.env`, `credentials.json`

### 7. After each change
1. Build the app/blog depending on what changed
2. Check routes via curl (landing, app, blog, health)
3. Never say "done" without having verified

### 8. GitHub Organisation (in progress)
- Goal: create `flompt` org with 5 repos: app, blog, landing, backend, deploy
- The `deploy` repo will contain git submodules pointing to the other 4
- The `Nyrok/flompt-legacy` repo is the original monorepo temporarily renamed
