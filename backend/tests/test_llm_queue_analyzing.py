"""
Tests for LLMQueue analyzing state and PromptBlockedError propagation.
"""
import asyncio
import pytest
from app.services.ai_service import LLMQueue, PromptBlockedError


@pytest.fixture
def queue():
    """Fresh LLMQueue with no rate limiting (instant processing)."""
    return LLMQueue(requests_per_minute=6000)


# ─── Analyzing state ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyzing_state_during_call(queue):
    """
    While a job's function is executing, get_job_status should return 'analyzing'.
    """
    job_id = "test-job-analyzing"
    status_during_call = []

    async def slow_func():
        # Capture state in the middle of execution
        status_during_call.append(queue.get_job_status(job_id))
        return "result"

    await queue.call(job_id, slow_func)

    assert len(status_during_call) == 1
    mid_status = status_during_call[0]
    assert mid_status is not None
    assert mid_status["status"] == "analyzing"
    assert mid_status["position"] == 0


@pytest.mark.asyncio
async def test_analyzing_state_cleared_after_call(queue):
    """After a successful call, _analyzing_job_id should be cleared."""
    async def simple_func():
        return "ok"

    await queue.call("job1", simple_func)
    assert queue._analyzing_job_id is None
    assert queue.get_job_status("job1") is None


@pytest.mark.asyncio
async def test_analyzing_state_cleared_after_exception(queue):
    """Even on exception, _analyzing_job_id should be cleared."""
    async def failing_func():
        raise RuntimeError("boom")

    with pytest.raises(RuntimeError):
        await queue.call("job-fail", failing_func)

    assert queue._analyzing_job_id is None


@pytest.mark.asyncio
async def test_analyzing_state_cleared_after_prompt_blocked(queue):
    """PromptBlockedError should also clear _analyzing_job_id."""
    async def blocked_func():
        raise PromptBlockedError(["S14"])

    with pytest.raises(PromptBlockedError):
        await queue.call("job-blocked", blocked_func)

    assert queue._analyzing_job_id is None


# ─── PromptBlockedError propagation through queue ─────────────────────────────

@pytest.mark.asyncio
async def test_prompt_blocked_propagates(queue):
    """PromptBlockedError raised inside queue should propagate to caller."""
    async def blocked_func():
        raise PromptBlockedError(["S14"])

    with pytest.raises(PromptBlockedError) as exc_info:
        await queue.call("job-blocked", blocked_func)

    assert exc_info.value.violations == ["S14"]


@pytest.mark.asyncio
async def test_prompt_blocked_does_not_affect_next_jobs(queue):
    """A blocked job should not corrupt queue state for subsequent jobs."""
    async def blocked_func():
        raise PromptBlockedError(["S14"])

    async def success_func():
        return "ok"

    with pytest.raises(PromptBlockedError):
        await queue.call("blocked-job", blocked_func)

    result = await queue.call("success-job", success_func)
    assert result == "ok"
    assert queue._total_processed == 2


# ─── get_job_status transitions ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_status_none_before_queued(queue):
    assert queue.get_job_status("not-yet-queued") is None


@pytest.mark.asyncio
async def test_status_processing_then_analyzing(queue):
    """
    Sequence: no status → queued → processing → analyzing → None (done)
    """
    statuses: list[dict] = []
    job_id = "seq-job"

    # We need to enqueue two jobs so the first is queued while the second runs
    async def observer_func():
        # At this point, job_id should be 'analyzing'
        s = queue.get_job_status(job_id)
        if s:
            statuses.append(s)
        return "obs"

    # First job captures analyzing state
    await queue.call(job_id, observer_func)

    # After completion, status should be None
    assert queue.get_job_status(job_id) is None


# ─── Queue status property ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_total_processed_increments(queue):
    async def noop():
        return None

    assert queue.status["total_processed"] == 0
    await queue.call("j1", noop)
    await queue.call("j2", noop)
    assert queue.status["total_processed"] == 2


@pytest.mark.asyncio
async def test_total_processed_increments_even_on_error(queue):
    async def fail():
        raise ValueError("test")

    with pytest.raises(ValueError):
        await queue.call("fail-job", fail)

    assert queue.status["total_processed"] == 1
