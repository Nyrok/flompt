import json
from app.services.ai_service import _call_llm_direct, _strip_markdown_json
from app.models.system_prompt import SystemPromptResult, SystemSection

SYSTEM_PROMPT_GENERATOR = """Transform the given prompt into a structured system prompt with 6 sections. Return ONLY valid JSON:
{
  "sections": [
    { "name": "SYSTEM",        "content": "..." },
    { "name": "ROLE",          "content": "..." },
    { "name": "CONTEXT",       "content": "..." },
    { "name": "OBJECTIVE",     "content": "..." },
    { "name": "CONSTRAINTS",   "content": "..." },
    { "name": "OUTPUT_FORMAT", "content": "..." }
  ]
}
Rules:
- SYSTEM: overall behavior directive and capability framing
- ROLE: persona, expertise level, communication style
- CONTEXT: background info, domain knowledge, assumptions
- OBJECTIVE: exact task — concrete and measurable
- CONSTRAINTS: hard limits and what NOT to do
- OUTPUT_FORMAT: structure, length, format expected
- Be specific and actionable in each section"""

LOCALE_LANGUAGE_MAP: dict[str, str] = {
    "en": "English", "fr": "French", "de": "German", "es": "Spanish",
    "pt": "Portuguese", "ja": "Japanese", "tr": "Turkish",
    "zh": "Chinese", "ar": "Arabic", "ru": "Russian",
}

async def generate_system_prompt(prompt: str, locale: str = "en") -> SystemPromptResult:
    language = LOCALE_LANGUAGE_MAP.get(locale, "English")
    user_msg = f"Respond entirely in {language}.\n\n{prompt}"
    raw = await _call_llm_direct(SYSTEM_PROMPT_GENERATOR, user_msg)
    data = json.loads(_strip_markdown_json(raw))
    sections = [SystemSection(**s) for s in data.get("sections", [])]
    full = "\n\n".join(f"## {s.name}\n{s.content}" for s in sections)
    return SystemPromptResult(
        sections=sections,
        full_prompt=full,
        total_tokens=len(full.split()),
    )
