"""
Prompt Guard Service — Security filter via Groq (meta-llama/llama-guard-4-12b).

Llama Guard 4 12B is the moderation model available on Groq. It uses the same
output format ("safe" / "unsafe\nS{N}") and the same MLCommons taxonomy.

Advantages vs HF Inference API:
  - Uses the GROQ_API_KEY already configured (no new key required)
  - Very low latency (~100-300ms on Groq)
  - No cold start

MLCommons Hazard Taxonomy S1-S13 (Llama Guard 4):
  S1  Violent Crimes            S8  Intellectual Property
  S2  Non-Violent Crimes        S9  Indiscriminate Weapons
  S3  Sex-Related Crimes        S10 Hate
  S4  Child Sexual Exploitation S11 Suicide & Self-Harm
  S5  Defamation                S12 Sexual Content
  S6  Specialized Advice        S13 Elections
  S7  Privacy

Response format:
  "safe"           -> prompt compliant
  "unsafe\\nS9"    -> Indiscriminate Weapons violation
  "unsafe\\nS1\\nS10" -> multiple violations

Fail-open if GROQ_API_KEY is absent or if the API fails.

Env vars:
  GROQ_API_KEY=gsk_...          (required — same key as the main LLM)
  PROMPT_GUARD_ENABLED=true     (default: true)
"""

import os
import logging
import httpx

logger = logging.getLogger(__name__)

GUARD_MODEL = "meta-llama/llama-guard-4-12b"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
TIMEOUT = 20.0

# MLCommons Hazard Taxonomy — Llama Guard 3
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
    Calls llama-guard-3-8b via the Groq API.
    Returns the raw response: "safe" or "unsafe\\nS9".
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
    Parses the Llama Guard 3 output.

    "safe"              -> (True, [], [])
    "unsafe\\nS9"       -> (False, ["S9"], ["Indiscriminate Weapons"])
    "unsafe\\nS1\\nS10" -> (False, ["S1","S10"], ["Violent Crimes","Hate"])

    Robust to variants: uppercase, commas, spaces.
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
    Classifies a prompt via llama-guard-3-8b (Groq).

    Returns: (is_safe, violation_codes, violation_names, raw_response)
      is_safe         : True -> prompt compliant
      violation_codes : ["S9"] — MLCommons codes
      violation_names : ["Indiscriminate Weapons"] — sent to the client
      raw_response    : raw model response

    Fail-open if guard is disabled, Groq key is absent, or API error.
    """
    if not _is_enabled():
        return True, [], [], "safe"

    key = _get_groq_key()
    if not key:
        logger.warning("[Prompt Guard] ⚠️  GROQ_API_KEY missing — fail-open.")
        return True, [], [], "safe"

    try:
        raw = await _call_groq_guard(prompt)
        is_safe, codes, names = _parse_response(raw)
        if is_safe:
            logger.debug(f"[Prompt Guard] ✅ safe")
        return is_safe, codes, names, raw

    except httpx.HTTPStatusError as e:
        logger.warning(f"[Prompt Guard] ⚠️  Groq HTTP error {e.response.status_code} — fail-open.")
        return True, [], [], "safe"

    except httpx.TimeoutException:
        logger.warning("[Prompt Guard] ⏱️  Groq timeout — fail-open.")
        return True, [], [], "safe"

    except Exception as exc:
        logger.warning(f"[Prompt Guard] ⚠️  Unexpected error — fail-open. {exc}")
        return True, [], [], "safe"
