"""LangSmith tracing wrapper.

If LangSmith is configured (``LANGCHAIN_TRACING_V2=true`` and ``LANGCHAIN_API_KEY``)
and the ``langsmith`` package is installed, decorators delegate to the real
``@traceable``. Otherwise they become transparent no-ops so the code path is
identical with or without observability wired up.
"""

from __future__ import annotations

import contextlib
import functools
from typing import Any, Callable, Iterator

from ..config import get_settings
from .logging import get_logger

logger = get_logger(__name__)


def _langsmith_active() -> bool:
    if not get_settings().langsmith_enabled:
        return False
    try:
        import langsmith  # noqa: F401

        return True
    except Exception:
        logger.debug("LangSmith requested but package not installed; tracing disabled.")
        return False


def traceable(name: str | None = None, **trace_kwargs) -> Callable:
    """Decorator that traces a function via LangSmith when available."""

    def decorator(func: Callable) -> Callable:
        if not _langsmith_active():
            return func
        try:
            from langsmith import traceable as ls_traceable

            return ls_traceable(name=name or func.__name__, **trace_kwargs)(func)
        except Exception:  # pragma: no cover
            logger.debug("Falling back to no-op trace for %s", func.__name__)
            return func

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)

        return wrapper

    return decorator


@contextlib.contextmanager
def trace(name: str, **metadata) -> Iterator[None]:
    """Context manager span. Logs locally; integrates with LangSmith if active."""
    logger.debug("→ span start: %s %s", name, metadata or "")
    if _langsmith_active():
        try:
            from langsmith.run_helpers import trace as ls_trace

            with ls_trace(name=name, extra={"metadata": metadata}):
                yield
                return
        except Exception:  # pragma: no cover
            pass
    yield
    logger.debug("← span end:   %s", name)
