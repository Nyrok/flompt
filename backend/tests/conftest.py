"""
Pytest configuration for the flompt backend test suite.
"""
import pytest


# Use asyncio event loop for all async tests
def pytest_configure(config):
    config.addinivalue_line(
        "markers", "asyncio: mark test as async"
    )
