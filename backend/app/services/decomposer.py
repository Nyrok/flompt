"""
Decomposer Service

Analyzes a raw prompt and returns a list of FlomptNodes + FlomptEdges.
Uses the AI service if available, otherwise falls back to heuristic decomposition.
"""

import re
import uuid
import json
from app.models.blocks import (
    BlockData, BlockType, FlomptNode, FlomptEdge,
    DecomposeResponse, Position
)
from typing import Optional
from app.services.ai_service import decompose_with_ai, _get_anthropic_key, _get_openai_key, _get_groq_key

BLOCK_META = {
    BlockType.role: {"label": "Role", "description": "Defines the AI persona / role"},
    BlockType.context: {"label": "Context", "description": "Provides task context"},
    BlockType.objective: {"label": "Objective", "description": "What we want to accomplish"},
    BlockType.input: {"label": "Input", "description": "Data provided to the AI"},
    BlockType.document: {"label": "Document", "description": "External content injected as XML (<document>)"},
    BlockType.constraints: {"label": "Constraints", "description": "Rules and limits to respect"},
    BlockType.output_format: {"label": "Output Format", "description": "Expected response format"},
    BlockType.format_control: {"label": "Format Control", "description": "Claude style directives (tone, verbosity, markdown)"},
    BlockType.examples: {"label": "Examples", "description": "Few-shot input/output pairs"},
    BlockType.chain_of_thought: {"label": "Chain of Thought", "description": "Step-by-step reasoning instructions"},
    BlockType.language: {"label": "Language", "description": "AI response language"},
}

# Keywords heuristics for fallback
HEURISTIC_KEYWORDS: dict[BlockType, list[str]] = {
    BlockType.role: ["you are", "act as", "tu es", "agis comme", "your role"],
    BlockType.context: ["context", "background", "given that", "étant donné", "in this scenario"],
    BlockType.objective: ["your goal", "you must", "you should", "ton objectif", "you need to", "task:"],
    BlockType.input: ["input:", "data:", "the following", "voici", "here is"],
    BlockType.document: ["document:", "file:", "article:", "the document", "le document", "following document", "document suivant"],
    BlockType.constraints: ["do not", "never", "always", "ne pas", "forbidden", "constraint", "rule:"],
    BlockType.output_format: ["output", "format", "return", "respond with", "retourne", "répondre en"],
    BlockType.format_control: ["be concise", "be brief", "no preamble", "use markdown", "without markdown", "sois concis", "sans préambule"],
    BlockType.examples: ["example", "for instance", "e.g.", "par exemple", "such as"],
    BlockType.chain_of_thought: ["step by step", "think", "reason", "étape", "raisonne", "chain of thought"],
    BlockType.language: ["in english", "in french", "en français", "en anglais", "respond in", "répondre en", "language:", "langue:"],
}


def _build_nodes_and_edges(raw_blocks: list[dict]) -> DecomposeResponse:
    """Convert raw block dicts to FlomptNodes and auto-link them."""
    nodes: list[FlomptNode] = []
    edges: list[FlomptEdge] = []

    x, y = 100.0, 50.0
    valid_blocks: list[dict] = []
    for block in raw_blocks:
        try:
            BlockType(block.get("type", ""))
            valid_blocks.append(block)
        except ValueError:
            # Block with unknown type returned by the LLM -> skip it
            continue
    raw_blocks = valid_blocks

    for i, block in enumerate(raw_blocks):
        block_type = BlockType(block["type"])
        meta = BLOCK_META[block_type]
        node_id = f"{block_type.value}-{uuid.uuid4().hex[:6]}"

        content = block.get("content") or ""   # handles None and missing key
        # Guard: LLM may return a dict/list instead of a string
        if isinstance(content, (dict, list)):
            content = json.dumps(content, ensure_ascii=False)
        elif not isinstance(content, str):
            content = str(content)

        summary = block.get("summary") or ""   # handles None and missing key
        if isinstance(summary, (dict, list)):
            summary = json.dumps(summary, ensure_ascii=False)
        elif not isinstance(summary, str):
            summary = str(summary)
        # Fallback: truncate content as summary if AI didn't provide one
        if not summary and content:
            summary = content[:40].strip()
            if len(content) > 40:
                summary += "…"

        nodes.append(FlomptNode(
            id=node_id,
            type="block",
            position=Position(x=x, y=y),
            data=BlockData(
                type=block_type,
                label=meta["label"],
                content=content,
                description=meta["description"],
                summary=summary,
            )
        ))

        if i > 0:
            edges.append(FlomptEdge(
                id=f"e{i-1}-{i}",
                source=nodes[i - 1].id,
                target=node_id,
                animated=True,
            ))

        y += 180.0

    return DecomposeResponse(nodes=nodes, edges=edges)


def _heuristic_decompose(raw_prompt: str) -> list[dict]:
    """Fallback: keyword-based decomposition."""
    lower = raw_prompt.lower()
    found: list[dict] = []

    # Default order (Claude best practices: documents first, then persona -> task -> constraints -> examples -> reasoning -> format -> language)
    ordered = [
        BlockType.document, BlockType.role, BlockType.context, BlockType.objective,
        BlockType.input, BlockType.constraints, BlockType.examples,
        BlockType.chain_of_thought, BlockType.output_format, BlockType.format_control,
        BlockType.language,
    ]

    for block_type in ordered:
        keywords = HEURISTIC_KEYWORDS[block_type]
        if any(kw in lower for kw in keywords):
            found.append({"type": block_type.value, "content": ""})

    # If nothing matched, just put everything in objective
    if not found:
        found = [{"type": BlockType.objective.value, "content": raw_prompt}]

    return found


async def decompose(raw_prompt: str, job_id: Optional[str] = None) -> DecomposeResponse:
    """Main entry point — AI if available, else heuristic."""
    ai_available = bool(_get_anthropic_key() or _get_openai_key() or _get_groq_key())

    if ai_available:
        raw_blocks = await decompose_with_ai(raw_prompt, job_id=job_id)
    else:
        raw_blocks = _heuristic_decompose(raw_prompt)

    return _build_nodes_and_edges(raw_blocks)
