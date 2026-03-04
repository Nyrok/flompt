import asyncio
import uuid

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query
from app.models.blocks import DecomposeRequest
from app.services.decomposer import decompose
from app.services.job_store import job_store
from app.services.ai_service import llm_queue
from app.services import prompt_guard_service
from app.auth import create_job_token, verify_job_token

router = APIRouter()


async def _decompose_task(job_id: str, prompt: str) -> None:
    """
    Background task:
      1. Security analysis via Prompt Guard (status "analyzing")
      2. If blocked -> status "blocked", end.
      3. If safe -> enters the LLMQueue (status "queued" -> "processing")
      4. Result stored: "done" or "error".
    """
    try:
        # ── Step 1: Prompt Guard (Llama Guard 4 12B) ─────────────────────────
        is_safe, codes, names, raw = await prompt_guard_service.classify(prompt)

        if not is_safe:
            job_store.store_blocked(
                job_id,
                reason="PROMPT_BLOCKED",
                violations=names,  # human-readable names e.g. ["Violent Crimes", "Hate"]
            )
            return

        # ── Step 2: LLM queue entry ───────────────────────────────────────────
        q = llm_queue.status
        estimated_position = q["pending"] + (1 if q["currently_processing"] else 0) + 1
        job_store.set_queued(job_id, estimated_position)

        # ── Step 3: LLM decomposition ─────────────────────────────────────────
        result = await decompose(prompt, job_id=job_id)
        job_store.store_result(job_id, result.dict())

    except Exception as e:
        job_store.store_error(job_id, str(e))


@router.post("/decompose")
async def decompose_prompt(body: DecomposeRequest) -> dict:
    """
    Submits a decomposition job asynchronously (fire-and-forget).

    Returns immediately { job_id, status: "analyzing", token }.
    The JWT token is required to access the job status/result.
    """
    if not body.prompt.strip():
        raise HTTPException(status_code=422, detail="Le prompt ne peut pas être vide.")

    job_id = body.job_id or str(uuid.uuid4())
    token = create_job_token(job_id)

    # Register immediately as "analyzing" (guard not yet started)
    job_store.set_analyzing(job_id)

    # Submit in the background — do not await
    asyncio.create_task(_decompose_task(job_id, body.prompt))

    return {"job_id": job_id, "status": "analyzing", "token": token}


@router.websocket("/ws/job/{job_id}")
async def ws_job_status(
    websocket: WebSocket,
    job_id: str,
    token: str | None = Query(default=None),
) -> None:
    """
    WebSocket — pushes job status updates in real time.
    Requires the JWT token returned by POST /api/decompose (?token=...).

    Messages sent:
      { job_id, status: "queued",      position: N }
      { job_id, status: "processing",  position: 0 }
      { job_id, status: "done",        result: {nodes, edges} }
      { job_id, status: "error",       error: "..." }

    The connection closes automatically once the job reaches a terminal state (done/error).
    The job is removed from memory after the terminal state is sent.
    """
    # ── Auth: verify the token before accepting the connection ────────────────
    if not token or not verify_job_token(token, job_id):
        await websocket.close(code=4001, reason="Token invalide ou manquant")
        return

    await websocket.accept()
    last_payload: dict | None = None
    terminal_reached = False

    try:
        while True:
            # Priority: live status from LLMQueue (exact position)
            live = llm_queue.get_job_status(job_id)
            if live:
                current = live
            else:
                stored = job_store.get(job_id)
                current = {"job_id": job_id, **(stored or {"status": "unknown"})}

            # Only send if the status has changed
            if current != last_payload:
                await websocket.send_json(current)
                last_payload = current

            # Close on terminal state
            if current.get("status") in ("done", "error", "blocked"):
                terminal_reached = True
                break

            await asyncio.sleep(0.3)

    except WebSocketDisconnect:
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
        # Clean up the job from memory after sending the terminal state
        if terminal_reached:
            job_store.delete(job_id)
