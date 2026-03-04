from dotenv import load_dotenv
load_dotenv()  # MUST be called before any import that reads env vars

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from app.routers import decompose, compile
from app.services.ai_service import llm_queue
from app.services.job_store import job_store
from app.auth import verify_job_token
from app.mcp_server import mcp

# Create the streamable HTTP app and its session manager before lifespan
_mcp_http_app = mcp.streamable_http_app()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Starts the MCP session manager at boot and stops it cleanly."""
    async with mcp.session_manager.run():
        yield


app = FastAPI(
    title="flompt API",
    description="Visual Prompt Builder — decompose, edit, recompile.",
    version="0.1.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://flompt.dev", "http://flompt.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(decompose.router, prefix="/api", tags=["decompose"])
app.include_router(compile.router, prefix="/api", tags=["compile"])

# ─── MCP Server (Streamable HTTP, stateless) ─────────────────────────────────
app.mount("/mcp", _mcp_http_app)


# ─── Auth dependency ─────────────────────────────────────────────────────────

async def _require_job_token(
    job_id: str,
    authorization: str | None = Header(default=None),
) -> None:
    """Verifies the Bearer JWT corresponding to the requested job_id."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")
    token = authorization.removeprefix("Bearer ")
    if not verify_job_token(token, job_id):
        raise HTTPException(status_code=403, detail="Token invalide ou expiré")


# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "flompt-api"}


@app.get("/api/queue/job/{job_id}")
async def queue_job_status(
    job_id: str,
    _: None = Depends(_require_job_token),
) -> dict:
    """
    Status and result of a job by its ID. Requires the job JWT.

    - status=queued     -> waiting, position=N (live from the queue)
    - status=processing -> currently being processed (live from the queue)
    - status=done       -> finished, result={nodes, edges} available
    - status=error      -> error, error="..." available
    - status=unknown    -> unknown job (never submitted or expired)
    """
    # Live status from LLMQueue (exact position, currently processing)
    live = llm_queue.get_job_status(job_id)
    if live:
        return live

    # Result/error stored in the job store (done/error/queued pre-registered)
    stored = job_store.get(job_id)
    if stored:
        return {"job_id": job_id, **stored}

    return {"job_id": job_id, "status": "unknown"}
