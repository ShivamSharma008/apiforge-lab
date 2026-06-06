"""LLM backend factory — resolves ``ASSISTANT_LLM_BACKEND`` to an instance.

Real providers are imported lazily and only when selected, so the offline stub
path never requires their SDKs to be installed.
"""

from __future__ import annotations

from functools import lru_cache

from ..config import Settings, get_settings
from ..observability.logging import get_logger
from .base import BaseLLM
from .stub import StubLLM

logger = get_logger(__name__)


@lru_cache(maxsize=4)
def get_llm(backend: str | None = None) -> BaseLLM:
    """Return an LLM instance for ``backend`` (defaults to configured value)."""
    settings: Settings = get_settings()
    backend = (backend or settings.llm_backend or "stub").lower()

    if backend == "stub":
        logger.info("Using offline StubLLM backend (no API key required).")
        return StubLLM(model=settings.llm_model)

    try:
        return _build_provider(backend, settings)
    except Exception as exc:  # pragma: no cover - provider optional
        logger.warning(
            "Could not initialise '%s' backend (%s). Falling back to offline StubLLM.",
            backend,
            exc,
        )
        return StubLLM(model=settings.llm_model)


def _build_provider(backend: str, settings: Settings) -> BaseLLM:
    """Lazily construct a real provider backed by LangChain chat models."""
    from .langchain_backend import LangChainLLM  # local import keeps deps optional

    return LangChainLLM(backend=backend, settings=settings)
