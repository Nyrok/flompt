import json
import re
from app.services.ai_service import _call_llm_direct
from app.models.compressor import CompressResult, CompressChange

COMPRESS_SYSTEM_PROMPT = """You are a prompt compression expert. Reduce tokens while preserving intent. Return ONLY valid JSON:
{
  "compressed_prompt": "...",
  "changes": [
    {
      "type": "removed|optimized|merged",
      "original": "original text snippet",
      "replacement": "shorter replacement or null if removed",
      "reason": "why",
      "tokens_saved": 5
    }
  ]
}
Rules:
- Remove filler words (please, make sure to, I want you to, kindly)
- Replace verbose phrases with concise equivalents
- Merge duplicate/similar instructions
- NEVER remove role, objective, constraints, or examples content
- Respond in the same language as the prompt"""

LOCALE_LANGUAGE_MAP: dict[str, str] = {
    "en": "English", "fr": "French", "de": "German", "es": "Spanish",
    "pt": "Portuguese", "ja": "Japanese", "tr": "Turkish",
    "zh": "Chinese", "ar": "Arabic", "ru": "Russian",
}


def _extract_json(text: str) -> str:
    """Best-effort extraction of a JSON object from an LLM response."""
    text = text.strip()
    # Strip markdown code fences
    fence_match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text)
    if fence_match:
        return fence_match.group(1)
    # Find the outermost { ... }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start:end + 1]
    return text


async def compress_prompt(prompt: str, target_reduction: float = 0.5, locale: str = "en") -> CompressResult:
    tokens_before = len(prompt.split())
    language = LOCALE_LANGUAGE_MAP.get(locale, "English")
    user_msg = f"Respond entirely in {language}. Target: reduce by ~{int(target_reduction * 100)}%\n\nPrompt:\n{prompt}"
    raw = await _call_llm_direct(COMPRESS_SYSTEM_PROMPT, user_msg)

    try:
        data = json.loads(_extract_json(raw))
    except json.JSONDecodeError as e:
        print(f"[compress] JSON parse error: {e}\nRaw response (first 500 chars): {raw[:500]}")
        raise RuntimeError(f"LLM returned invalid JSON: {e}") from e

    compressed = data.get("compressed_prompt", prompt)
    tokens_after = len(compressed.split())
    reduction = ((tokens_before - tokens_after) / max(tokens_before, 1)) * 100

    raw_changes = data.get("changes", [])
    changes: list[CompressChange] = []
    for c in raw_changes:
        try:
            changes.append(CompressChange(**c))
        except Exception as parse_err:
            print(f"[compress] Skipping malformed change entry: {c!r} — {parse_err}")

    return CompressResult(
        compressed_prompt=compressed,
        changes=changes,
        tokens_before=tokens_before,
        tokens_after=tokens_after,
        reduction_percent=round(reduction, 1),
    )
