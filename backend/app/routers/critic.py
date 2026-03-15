from fastapi import APIRouter, HTTPException
from app.models.critic import CriticRequest, CriticResult
from app.services.critic_service import critique_prompt

router = APIRouter()

@router.post("/critic", response_model=CriticResult)
async def critic_endpoint(req: CriticRequest) -> CriticResult:
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    try:
        return await critique_prompt(req.prompt, req.locale)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
