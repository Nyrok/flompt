# Changelog

All notable changes to flompt are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [1.3.0] — 2026-03-10

### Added
- **Live star progress bar** — `GET /stars-svg` endpoint returns a dynamic SVG showing GitHub star count toward the 100-star goal (15-min cache, fallback on error). Displayed in README below the stars badge.
- **Collision-free scatter layout** — after decomposition, blocks are placed randomly across the full canvas area with guaranteed no-overlap (300 attempts per block, H/V padding enforced). Layout uses real canvas dimensions via `getBoundingClientRect`.

### Changed
- **Blocks expand by default** after decomposition — no more auto-collapse on AI summary
- **Edges and handles removed** — canvas is no longer a flow diagram; blocks are standalone cards. `nodesConnectable=false`, all `<Handle>` components removed, backend stops generating edges
- **Layout applied in `FlowCanvas`** on `isDecomposing` transition using actual canvas size, replacing the static 2-column grid
- **Landing page mockup** updated — handles and connection arrows removed from the SVG hero to match the current app

### Fixed
- Cursor jumps to end of textarea when typing in a controlled React textarea (`selectionStart/End` now saved in `onChange` before re-render, restored in `useLayoutEffect`)
- `deploy.sh` Caddy check: `caddy list-modules` always exits 0 regardless of daemon state — switched to probing the admin API at `localhost:2019/config/`

---

## [1.1.0] — 2026-03-06

### Added
- **Safari extension** support — browser.* compatibility layer, Safari manifest, Makefile target
- **Locale switcher** in tab bar for mobile and extension sidebar
- **GitHub button click tracking** via PostHog (source label per entrypoint)
- **X-Robots-Tag noindex** on `/mcp/` endpoint (keep MCP out of search engines)

### Changed
- Extension version bumped to 1.1.0
- Locale URL synced on change to survive page reload
- Default locale always EN — removed browser auto-detection
- Arabic layout: keep LTR, apply `dir=auto` only on textareas

### Fixed
- Toggle button shown immediately on first toolbar insert failure
- PostHog `Script Error` noise filtered from exception tracking
- Arabic RTL not inverting global layout

---

## [1.0.0] — 2026-03-05

### Added
- **10-language support**: EN, FR, ES, DE, PT, JA, TR, ZH, AR, RU — each with a dedicated indexed SEO page
- Static locale pages generated at build time for crawler indexing
- Root sitemap, Twitter Cards, full meta robots coverage
- About page for Hamza Konte (bio, stack, projects, social links)
- Multilingual blog posts (EN + FR) updated for multilingual release

### Changed
- Blog slugs aligned between FR and EN for locale switcher consistency
- Stack page highlights updated

---

## [0.4.0] — 2026-03-04

### Added
- **Arcade interactive demo** embedded in landing page
- **Prompt Guard removal** blog post (EN + FR) explaining the decision
- `robots.txt` for landing — allows public pages, disallows `/api`, `/mcp`, `/app`
- `audience`, `goal`, `chain-of-thought` block types
- **Star popup** triggered on prompt inject (extension flow)

### Removed
- `format_control` block type
- `chain_of_thought` block type (merged into chain-of-thought)
- Llama-2 Guard 4 prompt validation (prompt guard)

### Fixed
- Mobile menu z-index (was rendering below navbar)
- Mobile menu backdrop-filter and height consistency
- Horizontal scroll on landing mobile
- `.btn-cta` white text in mobile nav

---

## [0.3.0] — 2026-02-25

### Added
- **Browser extension** (Chrome MV3 + Firefox) — sidebar injection for ChatGPT, Claude, Gemini
  - `✦ Enhance` button inserted in AI platform toolbars
  - Bidirectional sync between sidebar and chat input via `postMessage`
  - Resizable sidebar (300–900px drag handle)
  - Custom tooltip rendered on `<body>` via `getBoundingClientRect`
  - Platform-specific input detection (ChatGPT, Claude/ProseMirror, Gemini/Quill)
  - Auto-reinsert on SPA navigation
- **Extension icons** — SVG source + PNG at 16/32/48/128px via sharp
- **Makefile** for extension: `make icons`, `make pack`, `make chrome`, `make firefox`, `make safari`
- **Guided tour** (5-step interactive spotlight for first-time visitors)
- **PostHog analytics** — session replay, heatmaps, autocapture, error tracking
- **Error boundary** component → tracks `app_crash` with stack trace
- **Contextual error messages** — overloaded (529), timeout, network, server errors
- **Share button** (Web Share API + clipboard fallback) in output panel
- **Language block** — auto-detects prompt language, inline `<select>` UI
- **OG image as PNG** (1200×630, resvg-js) for social preview compatibility
- **Structured data** (FAQ Schema, HowTo Schema) for Google rich snippets

### Changed
- Prompt compilation is now **100% local** (no `/api/compile` call) — zero latency
- Block assembly via topological sort + `TYPE_PRIORITY` + `position.y` fallback
- XML output format: `<role>`, `<objective>`, `<constraints>`, etc.
- Landing redesign: split hero with SVG canvas mockup, before/after transformation
- Caddy routing: `/app*` with `frame-ancestors` for extension iframe
- Extension: `DEV_MODE` flag for localhost ↔ production switching

### Fixed
- Extension iframe loaded landing (X-Frame-Options DENY) instead of `/app`
- `frame-ancestors` was set to `chrome-extension:` (wrong — host page needed)
- Canvas invisible on desktop (missing `display:flex` on `.canvas-wrap`)
- Drag-on-select duplicate bug (deselect before addNode)
- Handle top clipped by overflow:hidden wrapper

---

## [0.2.0] — 2026-02-24

### Added
- **Monorepo restructure**: `frontend/` → `app/` + `blog/` + `landing/`
- **Next.js blog** (bilingual EN/FR, static export) — 10 initial articles
- **Static landing page** (`landing/index.html`)
- **Caddyfile** — auto-TLS, HSTS, CSP, gzip/zstd, routing for all sub-paths
- **`deploy.sh`** — one-command build + restart + health checks
- **GitBook documentation** — 5 pages proxied at `/docs`
- **i18n system** — FR/EN with `LocaleContext` + full translation files
- **Canvas onboarding** — spotlight for first-time desktop users with example prompt
- **Drag-and-drop from sidebar** onto canvas
- **Auto-save** indicator with timestamp
- **Custom edges** — gradient, glow, animated dash, hover delete
- **Keyboard shortcuts overlay** (`?` key)
- **Backend status indicator** in header (online/offline/checking)
- **Node duplicate button** on each block
- **Mobile responsive** — tab bar (Prompt / Canvas / Output), safe-area support
- **Clipboard paste button** on prompt textarea
- **`supervisord.conf`** for process management (backend + Caddy)
- **Keepalive watchdog** (`keepalive.sh`) — auto-restarts supervisord every 30s
- **SEO** — meta tags, OG image, Twitter Cards, JSON-LD, robots.txt, sitemap.xml
- Block collapse/expand, auto-resize textarea, character counter
- Undo/redo with Ctrl+Z/Y, Reset button

### Changed
- Mermaid-inspired dark theme — warm `#1c1c1e` background, `#FF3570` accent
- All emojis replaced with Lucide React icons
- Blog switched from Next.js server to static export (`output: export`)
- Mobile: default tab is `input` instead of `canvas`

### Fixed
- React Flow canvas height on mobile (flex vs. percentage)
- Handle overflow clipped on mobile
- `connectOnClick` for tap-to-connect on touch devices
- `/api/*` proxied before SPA fallback in Caddy

---

## [0.1.0] — 2026-02-23

### Added
- Initial project: React 18 + TypeScript + React Flow + Zustand (frontend)
- FastAPI + Pydantic v2 backend
- 8 block types: `role`, `context`, `objective`, `input`, `constraints`, `output_format`, `examples`, `chain_of_thought`
- AI service with Anthropic/OpenAI pluggable — heuristic fallback without API key
- Structural XML prompt compilation
- Docker Compose setup

---

[Unreleased]: https://github.com/Nyrok/flompt/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Nyrok/flompt/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Nyrok/flompt/compare/v0.4.0...v1.0.0
[0.4.0]: https://github.com/Nyrok/flompt/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/Nyrok/flompt/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Nyrok/flompt/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Nyrok/flompt/releases/tag/v0.1.0
