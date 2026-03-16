from pydantic import BaseModel

class CompressRequest(BaseModel):
    prompt: str
    target_reduction: float = 0.5
    locale: str = "en"

class CompressChange(BaseModel):
    type: str  # LLM may return values outside a strict Literal
    original: str
    replacement: str | None = None
    reason: str
    tokens_saved: int = 0

class CompressResult(BaseModel):
    compressed_prompt: str
    changes: list[CompressChange]
    tokens_before: int
    tokens_after: int
    reduction_percent: float
