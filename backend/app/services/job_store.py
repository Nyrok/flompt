"""
Job Store — stores results of async LLM jobs.

Allows the client to retrieve result/error via polling
after the worker has finished. Auto-TTL to avoid memory leaks.
"""

import time
from typing import Any


class JobStore:
    """
    Stores async job results in memory.
    Thread-safe in asyncio context (single-threaded).

    Job lifecycle:
      set_queued()    -> status="queued"   (submitted, waiting for LLM)
      store_result()  -> status="done"     (result available)
      store_error()   -> status="error"    (error available)

    TTL: results are cleaned up after `ttl_seconds` (default 5 min).
    """

    def __init__(self, ttl_seconds: int = 300):
        self._jobs: dict[str, dict] = {}
        self._timestamps: dict[str, float] = {}
        self._ttl = ttl_seconds

    def set_queued(self, job_id: str, estimated_position: int) -> None:
        """
        Registers the job as queued with an estimated position.
        """
        self._jobs[job_id] = {"status": "queued", "position": estimated_position}
        self._timestamps[job_id] = time.monotonic()

    def store_result(self, job_id: str, result: Any) -> None:
        """Marks the job as finished and stores the result."""
        self._jobs[job_id] = {"status": "done", "result": result}
        self._timestamps[job_id] = time.monotonic()
        self._cleanup()

    def store_error(self, job_id: str, error: str) -> None:
        """Marks the job as failed with an error."""
        self._jobs[job_id] = {"status": "error", "error": error}
        self._timestamps[job_id] = time.monotonic()
        self._cleanup()

    def get(self, job_id: str) -> Optional[dict]:
        """Returns the job data, or None if unknown/expired."""
        return self._jobs.get(job_id)

    def delete(self, job_id: str) -> None:
        """Immediately removes a job from memory (called after terminal state)."""
        self._jobs.pop(job_id, None)
        self._timestamps.pop(job_id, None)

    def _cleanup(self) -> None:
        """Purges expired jobs (called on each store_*)."""
        now = time.monotonic()
        expired = [
            jid for jid, ts in self._timestamps.items()
            if now - ts > self._ttl
        ]
        for jid in expired:
            self._jobs.pop(jid, None)
            self._timestamps.pop(jid, None)


# Shared global instance
job_store = JobStore()
