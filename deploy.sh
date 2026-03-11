#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
# flompt — Full deploy script
# Builds all services and (re)starts everything via Caddy
# Usage: ./deploy.sh [--build-only] [--restart-only]
# ─────────────────────────────────────────────────────────────

ROOT="/projects/flompt"
CADDY="$ROOT/caddy"
CADDYFILE="$ROOT/Caddyfile"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

BUILD=true
RESTART=true

for arg in "$@"; do
  case $arg in
    --build-only)   RESTART=false ;;
    --restart-only) BUILD=false ;;
  esac
done

# ── BUILD ────────────────────────────────────────────────────
if [ "$BUILD" = true ]; then
  log "Building app (Vite)..."
  rm -rf "$ROOT/app/dist" "$ROOT/app/node_modules/.vite"
  cd "$ROOT/app" && npm run build --silent 2>&1 | tail -3
  ok "App built → app/dist/"

  log "Building blog (Next.js static export)..."
  cd "$ROOT/blog" && rm -rf .next out && npm run build --silent 2>&1 | tail -3
  ok "Blog built → blog/out/"
fi

# ── RESTART SERVICES ─────────────────────────────────────────
if [ "$RESTART" = true ]; then
  log "Starting backend (FastAPI)..."
  pkill -f "uvicorn app.main:app" 2>/dev/null || true
  sleep 1
  cd "$ROOT/backend"
  if [ -d ".venv" ]; then
    source .venv/bin/activate
  fi
  nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/flompt-backend.log 2>&1 &
  ok "Backend started on :8000"

  log "Reloading Caddy..."
  if curl -s --max-time 2 http://localhost:2019/config/ > /dev/null 2>&1; then
    $CADDY reload --config "$CADDYFILE" 2>&1 | tail -1
  else
    $CADDY start --config "$CADDYFILE" 2>&1 | tail -1
  fi
  ok "Caddy running"
fi

# ── HEALTH CHECK ─────────────────────────────────────────────
log "Running health checks..."
sleep 5

check() {
  local name=$1 url=$2
  local code
  code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
  if [ "$code" = "200" ]; then
    ok "$name → $code"
  else
    fail "$name → $code (expected 200)"
  fi
}

check "Landing /"         "https://flompt.dev/"
check "App /app"          "https://flompt.dev/app"
check "Blog /blog/en"     "https://flompt.dev/blog/en"
check "Health /health"    "https://flompt.dev/health"

echo ""
ok "All services deployed successfully 🚀"
