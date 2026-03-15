from fastapi import APIRouter, HTTPException
from app.models.debugger import DebugRequest, DebugResult
from app.services.debugger_service import debug_prompt

router = APIRouter()

@router.post("/debug", response_model=DebugResult)
async def debug_endpoint(req: DebugRequest) -> DebugResult:
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    try:
        return await debug_prompt(req.prompt, req.locale)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
