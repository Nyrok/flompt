"""
AI Service — LLM integration via httpx (no SDK required).
Supports Anthropic, OpenAI, and Groq.

Includes an LLMQueue that serializes all requests, enforces
a minimum interval between calls (default: 1 req/min),
and exposes the status of each job by its ID for client feedback.
"""

import os
import json
import uuid
import httpx
import asyncio
import time
from typing import Optional, Any, Callable

# ─── Config ───────────────────────────────────────────────────────────────────

def _get_anthropic_key() -> Optional[str]:
    return os.getenv("ANTHROPIC_API_KEY")

def _get_openai_key() -> Optional[str]:
    return os.getenv("OPENAI_API_KEY")

def _get_groq_key() -> Optional[str]:
    return os.getenv("GROQ_API_KEY")

def _get_provider() -> str:
    return os.getenv("AI_PROVIDER", "groq")

def _get_model() -> str:
    return os.getenv("AI_MODEL", "llama-3.3-70b-versatile")

TIMEOUT = 60.0
MAX_RETRIES = 3
RETRY_DELAYS = [2, 5, 10]

# Rate limiting — 10 req/min by default, override via LLM_REQUESTS_PER_MINUTE
_REQUESTS_PER_MINUTE = float(os.getenv("LLM_REQUESTS_PER_MINUTE", "10"))


def _strip_markdown_json(text: str) -> str:
    """Strip markdown code fences (```json ... ```) from LLM response."""
    text = text.strip()
    if text.startswith("```"):
        first_newline = text.index("\n")
        text = text[first_newline + 1:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


# ─── System Prompts ───────────────────────────────────────────────────────────

DECOMPOSE_SYSTEM_PROMPT = """You are a prompt engineering expert specializing in Claude AI best practices. Analyze the user's prompt and BUILD a structured workflow by decomposing it into typed blocks.

Block types available:
- role: The AI persona/role (who the AI should be)
- context: Background information and situational context
- objective: The main goal or task to accomplish
- input: Data or variables provided to the AI (code, text to analyze, etc.)
- document: External reference content for XML grounding (articles, code files, datasets) — ONLY use if the prompt explicitly references external documents to inject; content = the document placeholder or excerpt
- constraints: Rules, restrictions, and limits
- output_format: Expected response format and structure (JSON, markdown, numbered list, etc.)
- format_control: Claude-specific formatting directives — tone, verbosity, markdown on/off, response length (e.g. "Be concise. Use markdown headers. No preamble.")
- examples: Few-shot input/output pairs — format content as "Input: [...]\nOutput: [...]" pairs separated by blank lines
- language: The language the AI should respond in (auto-detect from the user's prompt)

Return ONLY valid JSON, no markdown:
{"blocks": [{"type": "<type>", "content": "<detailed content>", "summary": "<2-5 word label>"}]}

Rules:
- CONSTRUCT a proper workflow — rewrite each block with clear, actionable content, don't just copy-paste
- The "summary" field is a very short label (2-5 words max) for at-a-glance reading (e.g. "Senior Python dev", "JSON with metadata", "Max 3 sentences")
- Write content and summary in the SAME language as the user's prompt
- Only include blocks that are semantically present or clearly implied
- ALWAYS include a "language" block — detect the prompt language and set it as the content (e.g. "English", "French", "Spanish")
- For "examples": format as "Input: [value]\nOutput: [value]" pairs separated by blank lines
- For "document": only use when the prompt explicitly mentions injecting external documents
- For "format_control": use for style/formatting directives that aren't already in output_format
- Minimum 2 blocks, maximum 11 blocks
- If unclear, default to objective + language"""

COMPILE_SYSTEM_PROMPT = """You are a prompt optimization expert. Recompile structured blocks into a single optimized prompt following Anthropic's Claude best practices.

Rules:
- Be maximally concise — remove all filler words
- Use Claude-optimized XML structure:
  - Document blocks → <documents><document index="N"><source>title</source><document_content>content</document_content></document></documents>
  - Examples blocks → <examples><example><user_input>input</user_input><ideal_response>output</ideal_response></example></examples>
  - Chain-of-thought blocks → <thinking>instructions</thinking>
  - Format control blocks → <format_instructions>directives</format_instructions>
  - Other blocks → <role>, <context>, <objective>, <input>, <constraints>, <output_format>, <language>
- Ordering (Claude best practices): documents first, then role → context → objective → input → constraints → examples → thinking → output_format → format_instructions → language
- Preserve ALL semantic meaning and constraints
- No preamble, no explanation — just the optimized prompt

Return ONLY valid JSON: {"prompt": "<optimized prompt>"}"""


# ─── LLM Queue ────────────────────────────────────────────────────────────────

class LLMQueue:
    """
    Serialized queue for LLM calls with:
    - Rate limiting (minimum interval between requests)
    - Job tracking by ID (queue position + current status)

    Each request goes through `call(job_id, func, ...)`.
    The position and status of each job are accessible via `get_job_status(job_id)`.
    """

    def __init__(self, requests_per_minute: float = 1.0):
        self._min_interval: float = 60.0 / requests_per_minute
        self._last_call_time: float = 0.0
        self._queue: asyncio.Queue = asyncio.Queue()
        self._worker_task: Optional[asyncio.Task] = None
        self._total_processed: int = 0

        # Job tracking
        # _jobs : job_id -> {"status": "queued"|"processing", "position": int}
        self._jobs: dict[str, dict] = {}
        # _queue_order : FIFO list of queued job_ids (mirror of asyncio.Queue)
        self._queue_order: list[str] = []
        self._processing_job_id: Optional[str] = None

    # ── Worker lifecycle ──────────────────────────────────────────────────────

    def _ensure_worker(self) -> None:
        if self._worker_task is None or self._worker_task.done():
            try:
                loop = asyncio.get_running_loop()
                self._worker_task = loop.create_task(
                    self._worker(), name="llm-queue-worker"
                )
                print(f"[LLM Queue] ✅ Worker started (rate limit: {60/self._min_interval:.1f} req/min)")
            except RuntimeError:
                pass

    async def _worker(self) -> None:
        while True:
            job_id, func, args, kwargs, future = await self._queue.get()

            # ── Remove from waiting list, move to "processing" ────────────────
            if job_id in self._queue_order:
                self._queue_order.remove(job_id)
            self._processing_job_id = job_id
            self._jobs.pop(job_id, None)  # no longer in the waiting queue
            # Recalculate positions of remaining jobs (1-indexed)
            for i, jid in enumerate(self._queue_order):
                if jid in self._jobs:
                    self._jobs[jid]["position"] = i + 1

            # ── Rate limiting ─────────────────────────────────────────────────
            now = time.monotonic()
            elapsed = now - self._last_call_time
            if self._last_call_time > 0 and elapsed < self._min_interval:
                wait_time = self._min_interval - elapsed
                print(
                    f"[LLM Queue] ⏳ Rate limit — waiting {wait_time:.1f}s "
                    f"({len(self._queue_order)} in queue)"
                )
                await asyncio.sleep(wait_time)

            print(
                f"[LLM Queue] 🚀 Job {job_id[:8]}… "
                f"(#{self._total_processed + 1}, {len(self._queue_order)} in queue after)"
            )

            # ── Execution ─────────────────────────────────────────────────────
            try:
                result = await func(*args, **kwargs)
                if not future.done():
                    future.set_result(result)
            except Exception as exc:
                if not future.done():
                    future.set_exception(exc)
            finally:
                self._processing_job_id = None
                self._last_call_time = time.monotonic()
                self._total_processed += 1
                self._queue.task_done()

    # ── Public interface ──────────────────────────────────────────────────────

    async def call(self, job_id: str, func: Callable, *args: Any, **kwargs: Any) -> Any:
        """Enqueues a job and waits for its result. Blocking for the caller."""
        self._ensure_worker()
        loop = asyncio.get_running_loop()
        future: asyncio.Future = loop.create_future()

        # Register the job with its initial position
        position = len(self._queue_order) + 1
        self._jobs[job_id] = {"status": "queued", "position": position}
        self._queue_order.append(job_id)

        if position > 1:
            wait_estimate = (position - 1) * self._min_interval
            print(
                f"[LLM Queue] 📋 Job {job_id[:8]}… queued "
                f"(pos #{position}, ~{wait_estimate:.0f}s wait)"
            )

        await self._queue.put((job_id, func, args, kwargs, future))

        try:
            return await future
        finally:
            # Cleanup if the job was still in the queue (e.g. cancellation)
            self._jobs.pop(job_id, None)
            if job_id in self._queue_order:
                self._queue_order.remove(job_id)

    def get_job_status(self, job_id: str) -> Optional[dict]:
        """
        Returns the status of a job.
        - {"status": "queued", "position": N} — waiting (1 = next)
        - {"status": "processing", "position": 0} — currently being processed
        - None — unknown job (finished or never registered)
        """
        if job_id == self._processing_job_id:
            return {"job_id": job_id, "status": "processing", "position": 0}
        if job_id in self._jobs:
            return {"job_id": job_id, **self._jobs[job_id]}
        return None

    @property
    def status(self) -> dict:
        """Global queue state (for monitoring)."""
        now = time.monotonic()
        elapsed = now - self._last_call_time if self._last_call_time > 0 else None
        next_in = max(0.0, self._min_interval - (elapsed or self._min_interval))
        return {
            "pending": self._queue.qsize(),
            "total_processed": self._total_processed,
            "rate_limit": f"{60 / self._min_interval:.1f} req/min",
            "min_interval_s": self._min_interval,
            "next_slot_in_s": round(next_in, 1),
            "worker_alive": self._worker_task is not None and not self._worker_task.done(),
            "currently_processing": self._processing_job_id,
        }


# Global instance
llm_queue = LLMQueue(requests_per_minute=_REQUESTS_PER_MINUTE)


# ─── Anthropic ────────────────────────────────────────────────────────────────

async def _call_anthropic(system: str, user: str) -> str:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": _get_anthropic_key(),
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": _get_model(),
                "max_tokens": 16000,
                "system": system,
                "messages": [{"role": "user", "content": user}],
            }
        )
        resp.raise_for_status()
        return resp.json()["content"][0]["text"]


# ─── Groq ─────────────────────────────────────────────────────────────────────

async def _call_groq(system: str, user: str) -> str:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {_get_groq_key()}",
                "Content-Type": "application/json",
            },
            json={
                "model": _get_model(),
                "max_tokens": 16000,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "response_format": {"type": "json_object"},
            }
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


# ─── OpenAI ───────────────────────────────────────────────────────────────────

async def _call_openai(system: str, user: str) -> str:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {_get_openai_key()}",
                "Content-Type": "application/json",
            },
            json={
                "model": _get_model(),
                "max_tokens": 16000,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "response_format": {"type": "json_object"},
            }
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


# ─── Dispatcher with retry ────────────────────────────────────────────────────

RETRYABLE_STATUS = {429, 500, 502, 503, 529}


async def _call_llm_direct(system: str, user: str) -> str:
    """Raw LLM call with retry — go through llm_queue.call(), not directly."""
    provider = _get_provider()
    if provider == "anthropic" and not _get_anthropic_key():
        raise RuntimeError("No API key configured (ANTHROPIC_API_KEY)")
    if provider == "openai" and not _get_openai_key():
        raise RuntimeError("No API key configured (OPENAI_API_KEY)")
    if provider == "groq" and not _get_groq_key():
        raise RuntimeError("No API key configured (GROQ_API_KEY)")

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            if provider == "anthropic":
                return await _call_anthropic(system, user)
            elif provider == "groq":
                return await _call_groq(system, user)
            else:
                return await _call_openai(system, user)
        except httpx.HTTPStatusError as e:
            last_error = e
            if e.response.status_code in RETRYABLE_STATUS and attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)]
                print(f"[AI] {e.response.status_code} — retry {attempt + 1}/{MAX_RETRIES} in {delay}s")
                await asyncio.sleep(delay)
            else:
                raise
        except (httpx.TimeoutException, httpx.ConnectError) as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAYS[min(attempt, len(RETRY_DELAYS) - 1)]
                print(f"[AI] Timeout/connection error — retry {attempt + 1}/{MAX_RETRIES} in {delay}s")
                await asyncio.sleep(delay)
            else:
                raise
    raise last_error  # type: ignore


async def _call_llm(system: str, user: str, job_id: Optional[str] = None) -> str:
    """Entry point — routes through the queue for rate limiting + job tracking."""
    _job_id = job_id or str(uuid.uuid4())
    return await llm_queue.call(_job_id, _call_llm_direct, system, user)


# ─── Public API ───────────────────────────────────────────────────────────────

async def decompose_with_ai(raw_prompt: str, job_id: Optional[str] = None) -> list[dict]:
    """Decomposes a raw prompt into structured blocks via LLM."""
    raw = await _call_llm(DECOMPOSE_SYSTEM_PROMPT, raw_prompt, job_id=job_id)
    data = json.loads(_strip_markdown_json(raw))
    return data.get("blocks", [])


async def compile_with_ai(blocks: list[dict], job_id: Optional[str] = None) -> str:
    """Recompiles blocks into an optimized prompt via LLM."""
    blocks_text = "\n".join(f"[{b['type'].upper()}]\n{b['content']}" for b in blocks if b.get('content'))
    raw = await _call_llm(COMPILE_SYSTEM_PROMPT, blocks_text, job_id=job_id)
    data = json.loads(_strip_markdown_json(raw))
    return data.get("prompt", "")
