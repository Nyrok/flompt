"""
JWT Auth — tokens tied to a specific job_id.

- Each job receives a signed token at creation time (POST /api/decompose).
- The token is required to access the job's status/result (WS + GET).
- JWT_SECRET in .env; if absent, an ephemeral secret is generated at startup
  (tokens valid only for the current server session).
"""

import os
import secrets
import jwt
from datetime import datetime, timedelta, timezone

_JWT_SECRET: str = os.getenv("JWT_SECRET") or secrets.token_hex(32)
_ALGORITHM = "HS256"
_TOKEN_TTL_MINUTES = 60


def create_job_token(job_id: str) -> str:
    """Generates a signed JWT authorizing access to the specified job."""
    payload = {
        "job_id": job_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=_TOKEN_TTL_MINUTES),
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm=_ALGORITHM)


def verify_job_token(token: str, job_id: str) -> bool:
    """Verifies the JWT and ensures it matches the expected job_id."""
    try:
        payload = jwt.decode(token, _JWT_SECRET, algorithms=[_ALGORITHM])
        return payload.get("job_id") == job_id
    except jwt.PyJWTError:
        return False
