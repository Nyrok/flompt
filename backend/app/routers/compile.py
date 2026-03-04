from fastapi import APIRouter, HTTPException
from app.models.blocks import CompileRequest, CompiledPrompt
from app.services.compiler import compile

router = APIRouter()


@router.post("/compile", response_model=CompiledPrompt)
async def compile_prompt(body: CompileRequest) -> CompiledPrompt:
    """
    Recompiles an ordered list of blocks into a machine-readable optimized prompt.

    - If an API key is configured -> LLM optimizes the prompt
    - Otherwise -> structured XML compilation
    """
    if not body.blocks:
        raise HTTPException(status_code=422, detail="La liste de blocs ne peut pas être vide.")

    try:
        return await compile(body.blocks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
