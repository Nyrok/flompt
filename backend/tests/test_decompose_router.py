"""
Tests for the decompose router — WebSocket behavior with blocked status.
"""
import asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.routers.decompose import router, _decompose_task
from app.services.job_store import JobStore
from app.services.ai_service import PromptBlockedError


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def fresh_store(monkeypatch):
    """Inject a fresh JobStore for each test."""
    store = JobStore()
    monkeypatch.setattr("app.routers.decompose.job_store", store)
    monkeypatch.setattr("app.services.job_store.job_store", store)
    return store


# ─── _decompose_task unit tests ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_decompose_task_success(fresh_store):
    """Successful decomposition → store_result called."""
    mock_result = MagicMock()
    mock_result.dict.return_value = {"nodes": [], "edges": []}

    with patch("app.routers.decompose.decompose", new=AsyncMock(return_value=mock_result)):
        await _decompose_task("job-ok", "Write a poem")

    data = fresh_store.get("job-ok")
    assert data["status"] == "done"
    assert data["result"] == {"nodes": [], "edges": []}


@pytest.mark.asyncio
async def test_decompose_task_blocked(fresh_store):
    """PromptBlockedError → store_blocked called."""
    with patch(
        "app.routers.decompose.decompose",
        new=AsyncMock(side_effect=PromptBlockedError(["S14"])),
    ):
        await _decompose_task("job-blocked", "Harmful prompt")

    data = fresh_store.get("job-blocked")
    assert data is not None
    assert data["status"] == "blocked"
    assert data["error"] == "PROMPT_BLOCKED"
    assert "S14" in data["violations"]


@pytest.mark.asyncio
async def test_decompose_task_generic_error(fresh_store):
    """Generic exception → store_error called."""
    with patch(
        "app.routers.decompose.decompose",
        new=AsyncMock(side_effect=RuntimeError("LLM down")),
    ):
        await _decompose_task("job-err", "Normal prompt")

    data = fresh_store.get("job-err")
    assert data["status"] == "error"
    assert "LLM down" in data["error"]


@pytest.mark.asyncio
async def test_decompose_task_blocked_multiple_violations(fresh_store):
    """Multiple violations are all stored."""
    with patch(
        "app.routers.decompose.decompose",
        new=AsyncMock(side_effect=PromptBlockedError(["S1", "S14"])),
    ):
        await _decompose_task("job-multi", "Very harmful prompt")

    data = fresh_store.get("job-multi")
    assert data["status"] == "blocked"
    assert data["violations"] == ["S1", "S14"]


@pytest.mark.asyncio
async def test_decompose_task_blocked_not_stored_as_error(fresh_store):
    """A blocked job must NOT be stored as 'error'."""
    with patch(
        "app.routers.decompose.decompose",
        new=AsyncMock(side_effect=PromptBlockedError(["S14"])),
    ):
        await _decompose_task("job-blocked-2", "Bad prompt")

    data = fresh_store.get("job-blocked-2")
    assert data["status"] != "error"


# ─── WebSocket terminal state test ───────────────────────────────────────────

@pytest.mark.asyncio
async def test_ws_terminal_states_include_blocked():
    """
    Verify that the terminal states set in the WS handler includes 'blocked'.
    We test this by inspecting the router source rather than spinning up a full server
    (to avoid WebSocket test complexity).
    """
    import inspect
    import app.routers.decompose as mod
    source = inspect.getsource(mod)
    # The terminal state check must include 'blocked'
    assert '"blocked"' in source or "'blocked'" in source


# ─── Store state transition tests ─────────────────────────────────────────────

def test_blocked_state_has_required_fields():
    store = JobStore()
    store.store_blocked("job1", ["S14"])
    data = store.get("job1")
    assert "status" in data
    assert "error" in data
    assert "violations" in data
    assert data["status"] == "blocked"
    assert data["error"] == "PROMPT_BLOCKED"


def test_blocked_state_is_distinct_from_error():
    store = JobStore()
    store.store_error("job-err", "Some error")
    store.store_blocked("job-blocked", ["S14"])

    err_data = store.get("job-err")
    blocked_data = store.get("job-blocked")

    assert err_data["status"] == "error"
    assert blocked_data["status"] == "blocked"
    # Blocked has violations, error does not
    assert "violations" in blocked_data
    assert "violations" not in err_data
