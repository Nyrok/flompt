"""
Job Store — stocke les résultats des jobs LLM asynchrones.

Permet au client de récupérer résultat/erreur via polling
après que le worker a terminé. TTL auto pour éviter les fuites mémoire.
"""

import time
from typing import Any, Optional


class JobStore:
    """
    Stocke les résultats des jobs asynchrones en mémoire.
    Thread-safe en contexte asyncio (single-threaded).

    Cycle de vie d'un job :
      preregister()   → status="queued"  (soumis, pas encore en queue LLM)
      store_result()  → status="done"    (résultat disponible)
      store_error()   → status="error"   (erreur disponible)

    TTL : les résultats sont nettoyés après `ttl_seconds` (défaut 5 min).
    """

    def __init__(self, ttl_seconds: int = 300):
        self._jobs: dict[str, dict] = {}
        self._timestamps: dict[str, float] = {}
        self._ttl = ttl_seconds

    def preregister(self, job_id: str, estimated_position: int) -> None:
        """
        Enregistre un job AVANT qu'il entre dans la LLMQueue.
        Évite le race condition où le client poll avant que le background
        task ait eu le temps de s'enregistrer dans la queue.
        """
        self._jobs[job_id] = {"status": "queued", "position": estimated_position}
        self._timestamps[job_id] = time.monotonic()

    def set_analyzing(self, job_id: str) -> None:
        """
        Marque le job comme en cours d'analyse de sécurité (Prompt Guard).
        Appelé juste avant de lancer l'inférence du guard.
        """
        self._jobs[job_id] = {"status": "analyzing"}
        self._timestamps[job_id] = time.monotonic()

    def set_queued(self, job_id: str, estimated_position: int) -> None:
        """
        Passe le job de 'analyzing' à 'queued' une fois le guard passé.
        """
        self._jobs[job_id] = {"status": "queued", "position": estimated_position}
        self._timestamps[job_id] = time.monotonic()

    def store_blocked(
        self,
        job_id: str,
        reason: str = "PROMPT_BLOCKED",
        violations: Optional[list] = None,
    ) -> None:
        """
        Marque le job comme bloqué par le Prompt Guard (état terminal).

        violations : liste des noms lisibles des catégories violées,
                     ex. ["Violent Crimes", "Hate"] — transmis au client via WS.
        """
        self._jobs[job_id] = {
            "status": "blocked",
            "error": reason,
            "violations": violations or [],
        }
        self._timestamps[job_id] = time.monotonic()
        self._cleanup()

    def store_result(self, job_id: str, result: Any) -> None:
        """Marque le job comme terminé et stocke le résultat."""
        self._jobs[job_id] = {"status": "done", "result": result}
        self._timestamps[job_id] = time.monotonic()
        self._cleanup()

    def store_error(self, job_id: str, error: str) -> None:
        """Marque le job en erreur."""
        self._jobs[job_id] = {"status": "error", "error": error}
        self._timestamps[job_id] = time.monotonic()
        self._cleanup()

    def get(self, job_id: str) -> Optional[dict]:
        """Retourne les données du job, ou None si inconnu/expiré."""
        return self._jobs.get(job_id)

    def delete(self, job_id: str) -> None:
        """Supprime immédiatement un job de la mémoire (appelé après état terminal)."""
        self._jobs.pop(job_id, None)
        self._timestamps.pop(job_id, None)

    def _cleanup(self) -> None:
        """Purge les jobs expirés (appelé à chaque store_*)."""
        now = time.monotonic()
        expired = [
            jid for jid, ts in self._timestamps.items()
            if now - ts > self._ttl
        ]
        for jid in expired:
            self._jobs.pop(jid, None)
            self._timestamps.pop(jid, None)


# Instance globale partagée
job_store = JobStore()
