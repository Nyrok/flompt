"""
Compiler Service

Recompiles an ordered list of blocks into a machine-readable optimized prompt.
Uses the AI service if available, otherwise falls back to structured compilation.
"""

from app.models.blocks import BlockData, BlockType, CompiledPrompt
from app.services.ai_service import compile_with_ai, _get_anthropic_key, _get_openai_key

# Canonical block order in the final prompt
CANONICAL_ORDER: list[BlockType] = [
    BlockType.role,
    BlockType.context,
    BlockType.objective,
    BlockType.input,
    BlockType.constraints,
    BlockType.output_format,
    BlockType.examples,
]

# XML tags for the machine-readable format
BLOCK_TAGS: dict[BlockType, str] = {
    BlockType.role: "role",
    BlockType.context: "ctx",
    BlockType.objective: "objective",
    BlockType.input: "input",
    BlockType.constraints: "constraints",
    BlockType.output_format: "format",
    BlockType.examples: "examples",
}


def _estimate_tokens(text: str) -> int:
    """Quick estimate: ~4 chars = 1 token."""
    return max(1, len(text) // 4)


def _structural_compile(blocks: list[BlockData]) -> str:
    """
    Fallback: compiles blocks into structured machine-readable XML.
    Sorted according to canonical order, empty blocks ignored.
    """
    # Sort according to canonical order
    ordered = sorted(
        [b for b in blocks if b.content.strip()],
        key=lambda b: CANONICAL_ORDER.index(b.type) if b.type in CANONICAL_ORDER else 99
    )

    parts: list[str] = []
    for block in ordered:
        tag = BLOCK_TAGS.get(block.type, block.type.value)
        content = block.content.strip()
        parts.append(f"<{tag}>{content}</{tag}>")

    return "\n".join(parts)


async def compile(blocks: list[BlockData]) -> CompiledPrompt:
    """Main entry point — AI if available, else structural."""
    ai_available = bool(_get_anthropic_key() or _get_openai_key())

    if ai_available:
        optimized = await compile_with_ai([b.model_dump() for b in blocks])
    else:
        optimized = _structural_compile(blocks)

    return CompiledPrompt(
        raw=optimized,
        tokenEstimate=_estimate_tokens(optimized),
        blocks=blocks,
    )
