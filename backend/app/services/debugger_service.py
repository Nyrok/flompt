import json
import uuid
from app.services.ai_service import _call_llm_direct, _strip_markdown_json
from app.models.debugger import DebugResult, DebugIssue

DEBUGGER_SYSTEM_PROMPT = """You are a prompt engineering expert. Analyze the prompt and return ONLY valid JSON (no markdown):
{
  "issues": [
    {
      "id": "unique-id",
      "severity": "error|warning|info",
      "category": "vague_objective|missing_role|missing_context|contradiction|redundancy|token_waste|missing_format",
      "message": "Clear issue description in the prompt's language",
      "location": "block_type or null",
      "suggestion": "Specific actionable fix in the prompt's language"
    }
  ],
  "score": 0-100,
  "fixed_prompt": "Corrected version of the prompt",
  "improvements": ["High-level suggestion 1"]
}

Scoring rules: start at 100. Deduct: missing_role -15, vague_objective -20, missing_context -10, contradiction -25, redundancy -10, token_waste -5, missing_format -10.
Return at least score and fixed_prompt even if no issues found."""

async def debug_prompt(prompt: str) -> DebugResult:
    tokens_before = len(prompt.split())
    raw = await _call_llm_direct(DEBUGGER_SYSTEM_PROMPT, prompt)
    data = json.loads(_strip_markdown_json(raw))
    issues = [DebugIssue(id=i.get("id", str(uuid.uuid4())), **{k: v for k, v in i.items() if k != "id"}) for i in data.get("issues", [])]
    tokens_after = len(data.get("fixed_prompt", prompt).split())
    return DebugResult(
        issues=issues,
        score=max(0, min(100, data.get("score", 50))),
        fixed_prompt=data.get("fixed_prompt", prompt),
        improvements=data.get("improvements", []),
        tokens_before=tokens_before,
        tokens_after=tokens_after,
    )
