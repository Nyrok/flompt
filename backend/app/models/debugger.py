from pydantic import BaseModel
from typing import Literal

class DebugRequest(BaseModel):
    prompt: str

class DebugIssue(BaseModel):
    id: str
    severity: Literal["error", "warning", "info"]
    category: str
    message: str
    location: str | None = None
    suggestion: str

class DebugResult(BaseModel):
    issues: list[DebugIssue]
    score: int
    fixed_prompt: str
    improvements: list[str]
    tokens_before: int
    tokens_after: int
