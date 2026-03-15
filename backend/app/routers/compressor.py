from fastapi import APIRouter, HTTPException
from app.models.compressor import CompressRequest, CompressResult
from app.services.compressor_service import compress_prompt

router = APIRouter()

@router.post("/compress", response_model=CompressResult)
async def compress_endpoint(req: CompressRequest) -> CompressResult:
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    try:
        return await compress_prompt(req.prompt, req.target_reduction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
