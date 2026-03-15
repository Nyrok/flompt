from pydantic import BaseModel
from typing import Literal

class CriticDimension(BaseModel):
    name: str
    score: int
    feedback: str

class CriticRequest(BaseModel):
    prompt: str
    locale: str = "en"

class CriticResult(BaseModel):
    overall_score: float
    grade: Literal["A", "B", "C", "D", "F"]
    dimensions: list[CriticDimension]
    strengths: list[str]
    weaknesses: list[str]
    top_recommendation: str
