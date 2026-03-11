"""
Tests for JobStore — including the new set_analyzing() and store_blocked() methods.
"""
import time
import pytest
from app.services.job_store import JobStore


@pytest.fixture
def store():
    return JobStore(ttl_seconds=60)


# ─── Existing states ─────────────────────────────────────────────────────────

def test_set_queued(store):
    store.set_queued("job1", 3)
    data = store.get("job1")
    assert data == {"status": "queued", "position": 3}


def test_store_result(store):
    store.set_queued("job1", 1)
    store.store_result("job1", {"nodes": [], "edges": []})
    data = store.get("job1")
    assert data["status"] == "done"
    assert data["result"] == {"nodes": [], "edges": []}


def test_store_error(store):
    store.set_queued("job1", 1)
    store.store_error("job1", "Something went wrong")
    data = store.get("job1")
    assert data == {"status": "error", "error": "Something went wrong"}


def test_delete(store):
    store.set_queued("job1", 1)
    store.delete("job1")
    assert store.get("job1") is None


# ─── New: set_analyzing ───────────────────────────────────────────────────────

def test_set_analyzing(store):
    store.set_queued("job1", 1)
    store.set_analyzing("job1")
    data = store.get("job1")
    assert data == {"status": "analyzing"}


def test_set_analyzing_without_prior_queued(store):
    """set_analyzing can be called even without a prior set_queued."""
    store.set_analyzing("job_orphan")
    data = store.get("job_orphan")
    assert data is not None
    assert data["status"] == "analyzing"


def test_set_analyzing_updates_timestamp(store):
    store.set_queued("job1", 1)
    t_before = store._timestamps.get("job1", 0)
    time.sleep(0.01)
    store.set_analyzing("job1")
    t_after = store._timestamps.get("job1", 0)
    assert t_after >= t_before


# ─── New: store_blocked ───────────────────────────────────────────────────────

def test_store_blocked_basic(store):
    store.set_queued("job1", 1)
    store.store_blocked("job1", ["S14"])
    data = store.get("job1")
    assert data["status"] == "blocked"
    assert data["error"] == "PROMPT_BLOCKED"
    assert data["violations"] == ["S14"]


def test_store_blocked_multiple_violations(store):
    store.store_blocked("job2", ["S1", "S14"])
    data = store.get("job2")
    assert data["violations"] == ["S1", "S14"]


def test_store_blocked_empty_violations(store):
    store.store_blocked("job3", [])
    data = store.get("job3")
    assert data["status"] == "blocked"
    assert data["violations"] == []


def test_store_blocked_is_terminal(store):
    """store_blocked should trigger cleanup (TTL logic runs)."""
    store.store_blocked("job1", ["S14"])
    # Job is still accessible (TTL not expired)
    assert store.get("job1") is not None


def test_store_blocked_overrides_analyzing(store):
    store.set_analyzing("job1")
    store.store_blocked("job1", ["S14"])
    data = store.get("job1")
    assert data["status"] == "blocked"


# ─── TTL cleanup ─────────────────────────────────────────────────────────────

def test_ttl_cleanup(store):
    short_store = JobStore(ttl_seconds=0)
    short_store.set_queued("old_job", 1)
    short_store.store_blocked("new_job", ["S14"])  # triggers cleanup
    # old_job should be expired
    assert short_store.get("old_job") is None


def test_get_unknown_returns_none(store):
    assert store.get("nonexistent") is None


# ─── Full lifecycle: queued → analyzing → blocked ─────────────────────────────

def test_full_blocked_lifecycle(store):
    store.set_queued("job1", 1)
    assert store.get("job1")["status"] == "queued"

    store.set_analyzing("job1")
    assert store.get("job1")["status"] == "analyzing"

    store.store_blocked("job1", ["S14"])
    data = store.get("job1")
    assert data["status"] == "blocked"
    assert data["error"] == "PROMPT_BLOCKED"
    assert "S14" in data["violations"]


# ─── Full lifecycle: queued → analyzing → done ────────────────────────────────

def test_full_success_lifecycle(store):
    store.set_queued("job1", 1)
    store.set_analyzing("job1")
    store.store_result("job1", {"nodes": [1], "edges": []})
    data = store.get("job1")
    assert data["status"] == "done"
    assert data["result"]["nodes"] == [1]
