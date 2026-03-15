import json
from app.services.ai_service import _call_llm_direct, _strip_markdown_json
from app.models.critic import CriticResult, CriticDimension

CRITIC_SYSTEM_PROMPT = """You are a senior prompt engineering evaluator. Score the prompt on 6 dimensions. Return ONLY valid JSON:
{
  "overall_score": 0-10,
  "grade": "A|B|C|D|F",
  "dimensions": [
    { "name": "clarity",     "score": 0-10, "feedback": "..." },
    { "name": "specificity", "score": 0-10, "feedback": "..." },
    { "name": "structure",   "score": 0-10, "feedback": "..." },
    { "name": "examples",    "score": 0-10, "feedback": "..." },
    { "name": "constraints", "score": 0-10, "feedback": "..." },
    { "name": "format",      "score": 0-10, "feedback": "..." }
  ],
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "top_recommendation": "Single most impactful improvement"
}
Grade: A=9-10, B=7-8, C=5-6, D=3-4, F=0-2."""

LOCALE_LANGUAGE_MAP: dict[str, str] = {
    "en": "English", "fr": "French", "de": "German", "es": "Spanish",
    "pt": "Portuguese", "ja": "Japanese", "tr": "Turkish",
    "zh": "Chinese", "ar": "Arabic", "ru": "Russian",
}

async def critique_prompt(prompt: str, locale: str = "en") -> CriticResult:
    language = LOCALE_LANGUAGE_MAP.get(locale, "English")
    user_msg = f"Respond entirely in {language}.\n\n{prompt}"
    raw = await _call_llm_direct(CRITIC_SYSTEM_PROMPT, user_msg)
    data = json.loads(_strip_markdown_json(raw))
    dims = [CriticDimension(**d) for d in data.get("dimensions", [])]
    return CriticResult(
        overall_score=float(data.get("overall_score", 5)),
        grade=data.get("grade", "C"),
        dimensions=dims,
        strengths=data.get("strengths", []),
        weaknesses=data.get("weaknesses", []),
        top_recommendation=data.get("top_recommendation", ""),
    )
