from fastapi import APIRouter, HTTPException
from app.models.system_prompt import SystemPromptRequest, SystemPromptResult
from app.services.system_prompt_service import generate_system_prompt

router = APIRouter()

@router.post("/system-prompt", response_model=SystemPromptResult)
async def system_prompt_endpoint(req: SystemPromptRequest) -> SystemPromptResult:
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    try:
        return await generate_system_prompt(req.prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
