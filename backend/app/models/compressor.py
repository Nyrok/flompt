from pydantic import BaseModel
from typing import Literal

class CompressRequest(BaseModel):
    prompt: str
    target_reduction: float = 0.5
    locale: str = "en"

class CompressChange(BaseModel):
    type: Literal["removed", "optimized", "merged"]
    original: str
    replacement: str | None = None
    reason: str
    tokens_saved: int

class CompressResult(BaseModel):
    compressed_prompt: str
    changes: list[CompressChange]
    tokens_before: int
    tokens_after: int
    reduction_percent: float
