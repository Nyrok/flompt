"""
Tests for PromptBlockedError and _parse_llama_guard helper.
"""
import pytest
from app.services.ai_service import PromptBlockedError, _parse_llama_guard


# ─── PromptBlockedError ───────────────────────────────────────────────────────

def test_prompt_blocked_error_stores_violations():
    err = PromptBlockedError(["S14"])
    assert err.violations == ["S14"]
    assert "PROMPT_BLOCKED" in str(err)
    assert "S14" in str(err)


def test_prompt_blocked_error_multiple_violations():
    err = PromptBlockedError(["S1", "S14"])
    assert err.violations == ["S1", "S14"]
    assert "S1" in str(err)
    assert "S14" in str(err)


def test_prompt_blocked_error_empty_violations():
    err = PromptBlockedError([])
    assert err.violations == []


def test_prompt_blocked_error_is_exception():
    err = PromptBlockedError(["S14"])
    assert isinstance(err, Exception)


def test_prompt_blocked_error_can_be_raised_and_caught():
    with pytest.raises(PromptBlockedError) as exc_info:
        raise PromptBlockedError(["S14"])
    assert exc_info.value.violations == ["S14"]


# ─── _parse_llama_guard ───────────────────────────────────────────────────────

def test_parse_llama_guard_safe():
    assert _parse_llama_guard("safe") is None


def test_parse_llama_guard_safe_with_whitespace():
    assert _parse_llama_guard("  safe  \n") is None


def test_parse_llama_guard_unsafe_single_violation():
    result = _parse_llama_guard("unsafe\nS14")
    assert result == ["S14"]


def test_parse_llama_guard_unsafe_multiple_violations_newline():
    result = _parse_llama_guard("unsafe\nS1\nS14")
    assert result == ["S1", "S14"]


def test_parse_llama_guard_unsafe_comma_separated():
    result = _parse_llama_guard("unsafe\nS1,S14")
    assert result == ["S1", "S14"]


def test_parse_llama_guard_unsafe_no_codes():
    """When 'unsafe' but no S-codes — should return ['UNKNOWN']."""
    result = _parse_llama_guard("unsafe\n")
    assert result == ["UNKNOWN"]


def test_parse_llama_guard_unsafe_bare():
    """'unsafe' with no following lines."""
    result = _parse_llama_guard("unsafe")
    assert result == ["UNKNOWN"]


def test_parse_llama_guard_case_insensitive():
    result = _parse_llama_guard("UNSAFE\nS14")
    assert result == ["S14"]


def test_parse_llama_guard_empty_string():
    assert _parse_llama_guard("") is None


def test_parse_llama_guard_regular_json():
    """Normal LLM JSON output should not be detected as blocked."""
    content = '{"blocks": [{"type": "objective", "content": "Do something", "summary": "task"}]}'
    assert _parse_llama_guard(content) is None


def test_parse_llama_guard_regular_text():
    """Regular text response should not be detected as blocked."""
    assert _parse_llama_guard("Here is my analysis...") is None


def test_parse_llama_guard_code_normalization():
    """S-codes should be uppercased."""
    result = _parse_llama_guard("unsafe\ns14")
    assert result == ["S14"]
