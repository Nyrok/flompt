"""
Prompt Guard Service — Filtre de sécurité via Groq (meta-llama/llama-guard-4-12b).

Llama Guard 4 12B est le modèle de modération disponible sur Groq. Il utilise le même
format de sortie ("safe" / "unsafe\nS{N}") et la même taxonomie MLCommons.

Avantages vs HF Inference API :
  - Utilise le GROQ_API_KEY déjà configuré (aucune nouvelle clé requise)
  - Latence très faible (~100-300ms sur Groq)
  - Pas de cold start

Taxonomie MLCommons Hazard S1–S13 (Llama Guard 4) :
  S1  Violent Crimes            S8  Intellectual Property
  S2  Non-Violent Crimes        S9  Indiscriminate Weapons
  S3  Sex-Related Crimes        S10 Hate
  S4  Child Sexual Exploitation S11 Suicide & Self-Harm
  S5  Defamation                S12 Sexual Content
  S6  Specialized Advice        S13 Elections
  S7  Privacy

Format de réponse :
  "safe"           → prompt conforme
  "unsafe\\nS9"    → violation Indiscriminate Weapons
  "unsafe\\nS1\\nS10" → violations multiples

Fail-open si GROQ_API_KEY absent ou si l'API échoue.

Env vars :
  GROQ_API_KEY=gsk_...          (requis — même clé que le LLM principal)
  PROMPT_GUARD_ENABLED=true     (défaut : true)
"""

import os
import logging
import httpx

logger = logging.getLogger(__name__)

GUARD_MODEL = "meta-llama/llama-guard-4-12b"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
TIMEOUT = 20.0

# Taxonomie MLCommons Hazard Taxonomy — Llama Guard 3
HAZARD_CATEGORIES: dict[str, str] = {
    "S1":  "Violent Crimes",
    "S2":  "Non-Violent Crimes",
    "S3":  "Sex-Related Crimes",
    "S4":  "Child Sexual Exploitation",
    "S5":  "Defamation",
    "S6":  "Specialized Advice",
    "S7":  "Privacy",
    "S8":  "Intellectual Property",
    "S9":  "Indiscriminate Weapons",
    "S10": "Hate",
    "S11": "Suicide & Self-Harm",
    "S12": "Sexual Content",
    "S13": "Elections",
}


def _is_enabled() -> bool:
    return os.getenv("PROMPT_GUARD_ENABLED", "true").lower() not in ("false", "0", "no")


def _get_groq_key() -> str | None:
    return os.getenv("GROQ_API_KEY")


async def _call_groq_guard(prompt: str) -> str:
    """
    Appelle llama-guard-3-8b via l'API Groq.
    Retourne la réponse brute : "safe" ou "unsafe\\nS9".
    """
    key = _get_groq_key()

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
            json={
                "model": GUARD_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 20,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()


def _parse_response(raw: str) -> tuple[bool, list[str], list[str]]:
    """
    Parse la sortie de Llama Guard 3.

    "safe"              → (True, [], [])
    "unsafe\\nS9"       → (False, ["S9"], ["Indiscriminate Weapons"])
    "unsafe\\nS1\\nS10" → (False, ["S1","S10"], ["Violent Crimes","Hate"])

    Robuste aux variantes : majuscules, virgules, espaces.
    """
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]

    if not lines or lines[0].lower() == "safe":
        return True, [], []

    codes: list[str] = []
    for line in lines[1:]:
        for part in line.split(","):
            code = part.strip().upper()
            if code.startswith("S") and code[1:].isdigit():
                codes.append(code)

    names = [HAZARD_CATEGORIES.get(c, c) for c in codes]

    logger.warning(
        f"[Prompt Guard] 🚨 UNSAFE — {codes} ({', '.join(names) if names else '?'})"
    )
    return False, codes, names


async def classify(prompt: str) -> tuple[bool, list[str], list[str], str]:
    """
    Classifie un prompt via llama-guard-3-8b (Groq).

    Retourne : (is_safe, violation_codes, violation_names, raw_response)
      is_safe         : True → prompt conforme
      violation_codes : ["S9"] — codes MLCommons
      violation_names : ["Indiscriminate Weapons"] — transmis au client
      raw_response    : réponse brute du modèle

    Fail-open si guard désactivé, clé Groq absente, ou erreur API.
    """
    if not _is_enabled():
        return True, [], [], "safe"

    key = _get_groq_key()
    if not key:
        logger.warning("[Prompt Guard] ⚠️  GROQ_API_KEY manquant — fail-open.")
        return True, [], [], "safe"

    try:
        raw = await _call_groq_guard(prompt)
        is_safe, codes, names = _parse_response(raw)
        if is_safe:
            logger.debug(f"[Prompt Guard] ✅ safe")
        return is_safe, codes, names, raw

    except httpx.HTTPStatusError as e:
        logger.warning(f"[Prompt Guard] ⚠️  Erreur Groq HTTP {e.response.status_code} — fail-open.")
        return True, [], [], "safe"

    except httpx.TimeoutException:
        logger.warning("[Prompt Guard] ⏱️  Timeout Groq — fail-open.")
        return True, [], [], "safe"

    except Exception as exc:
        logger.warning(f"[Prompt Guard] ⚠️  Erreur inattendue — fail-open. {exc}")
        return True, [], [], "safe"
