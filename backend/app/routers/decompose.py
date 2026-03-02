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
    Background task :
      1. Analyse de sécurité via Prompt Guard (statut "analyzing")
      2. Si bloqué → statut "blocked", fin.
      3. Si safe → entre dans la LLMQueue (statut "queued" → "processing")
      4. Résultat stocké : "done" ou "error".
    """
    try:
        # ── Étape 1 : Prompt Guard (Llama Guard 4 12B) ───────────────────────
        is_safe, codes, names, raw = await prompt_guard_service.classify(prompt)

        if not is_safe:
            job_store.store_blocked(
                job_id,
                reason="PROMPT_BLOCKED",
                violations=names,  # noms lisibles ex. ["Violent Crimes", "Hate"]
            )
            return

        # ── Étape 2 : Mise en file LLM ────────────────────────────────────────
        q = llm_queue.status
        estimated_position = q["pending"] + (1 if q["currently_processing"] else 0) + 1
        job_store.set_queued(job_id, estimated_position)

        # ── Étape 3 : Décomposition LLM ───────────────────────────────────────
        result = await decompose(prompt, job_id=job_id)
        job_store.store_result(job_id, result.dict())

    except Exception as e:
        job_store.store_error(job_id, str(e))


@router.post("/decompose")
async def decompose_prompt(body: DecomposeRequest) -> dict:
    """
    Soumet un job de décomposition de façon asynchrone (fire-and-forget).

    Retourne immédiatement { job_id, status: "analyzing", token }.
    Le token JWT est requis pour accéder au statut/résultat du job.
    """
    if not body.prompt.strip():
        raise HTTPException(status_code=422, detail="Le prompt ne peut pas être vide.")

    job_id = body.job_id or str(uuid.uuid4())
    token = create_job_token(job_id)

    # Enregistrer immédiatement comme "analyzing" (guard pas encore lancé)
    job_store.set_analyzing(job_id)

    # Soumettre en arrière-plan — ne pas attendre
    asyncio.create_task(_decompose_task(job_id, body.prompt))

    return {"job_id": job_id, "status": "analyzing", "token": token}


@router.websocket("/ws/job/{job_id}")
async def ws_job_status(
    websocket: WebSocket,
    job_id: str,
    token: str | None = Query(default=None),
) -> None:
    """
    WebSocket — pousse les mises à jour de statut d'un job en temps réel.
    Requiert le token JWT retourné par POST /api/decompose (?token=...).

    Messages envoyés :
      { job_id, status: "queued",      position: N }
      { job_id, status: "processing",  position: 0 }
      { job_id, status: "done",        result: {nodes, edges} }
      { job_id, status: "error",       error: "..." }

    La connexion se ferme automatiquement dès que le job est terminal (done/error).
    Le job est supprimé de la mémoire après envoi de l'état terminal.
    """
    # ── Auth : vérifier le token avant d'accepter la connexion ───────────────
    if not token or not verify_job_token(token, job_id):
        await websocket.close(code=4001, reason="Token invalide ou manquant")
        return

    await websocket.accept()
    last_payload: dict | None = None
    terminal_reached = False

    try:
        while True:
            # Priorité : statut live de la LLMQueue (position exacte)
            live = llm_queue.get_job_status(job_id)
            if live:
                current = live
            else:
                stored = job_store.get(job_id)
                current = {"job_id": job_id, **(stored or {"status": "unknown"})}

            # N'envoyer que si le statut a changé
            if current != last_payload:
                await websocket.send_json(current)
                last_payload = current

            # Fermer sur état terminal
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
        # Nettoyer le job de la mémoire après envoi de l'état terminal
        if terminal_reached:
            job_store.delete(job_id)
