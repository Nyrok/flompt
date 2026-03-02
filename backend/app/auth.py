"""
JWT Auth — tokens liés à un job_id spécifique.

- Chaque job reçoit un token signé à sa création (POST /api/decompose).
- Le token est requis pour accéder au statut/résultat du job (WS + GET).
- JWT_SECRET dans .env ; si absent, secret éphémère généré au démarrage
  (tokens valides uniquement pour la session serveur courante).
"""

import os
import secrets
import jwt
from datetime import datetime, timedelta, timezone

_JWT_SECRET: str = os.getenv("JWT_SECRET") or secrets.token_hex(32)
_ALGORITHM = "HS256"
_TOKEN_TTL_MINUTES = 60


def create_job_token(job_id: str) -> str:
    """Génère un JWT signé autorisant l'accès au job spécifié."""
    payload = {
        "job_id": job_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=_TOKEN_TTL_MINUTES),
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm=_ALGORITHM)


def verify_job_token(token: str, job_id: str) -> bool:
    """Vérifie le JWT et s'assure qu'il correspond au job_id attendu."""
    try:
        payload = jwt.decode(token, _JWT_SECRET, algorithms=[_ALGORITHM])
        return payload.get("job_id") == job_id
    except jwt.PyJWTError:
        return False
