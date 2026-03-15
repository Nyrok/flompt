import json
from app.services.ai_service import _call_llm_direct, _strip_markdown_json
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

async def compress_prompt(prompt: str, target_reduction: float = 0.5, locale: str = "en") -> CompressResult:
    tokens_before = len(prompt.split())
    language = LOCALE_LANGUAGE_MAP.get(locale, "English")
    user_msg = f"Respond entirely in {language}. Target: reduce by ~{int(target_reduction * 100)}%\n\nPrompt:\n{prompt}"
    raw = await _call_llm_direct(COMPRESS_SYSTEM_PROMPT, user_msg)
    data = json.loads(_strip_markdown_json(raw))
    compressed = data.get("compressed_prompt", prompt)
    tokens_after = len(compressed.split())
    reduction = ((tokens_before - tokens_after) / max(tokens_before, 1)) * 100
    changes = [CompressChange(**c) for c in data.get("changes", [])]
    return CompressResult(
        compressed_prompt=compressed,
        changes=changes,
        tokens_before=tokens_before,
        tokens_after=tokens_after,
        reduction_percent=round(reduction, 1),
    )
