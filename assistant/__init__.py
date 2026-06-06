"""APIForge Lab — AI Project Assistant.

A modular, offline-first AI subsystem that understands the APIForge Lab codebase
and answers natural-language questions about it via RAG + a LangGraph agent.

Design principles
-----------------
* **Zero-key by default.** The default LLM backend is a clearly-marked stub that
  composes grounded answers from retrieved context. No API keys required.
* **Pluggable.** Swap in a real provider with a single env var
  (``ASSISTANT_LLM_BACKEND``) — no code changes.
* **Graceful degradation.** Heavy optional dependencies (faiss, sentence-transformers,
  langgraph, langsmith, deepeval, transformers) are never required to run. When absent,
  the subsystem falls back to lightweight pure-Python implementations.
"""

from .config import Settings, get_settings

__all__ = ["Settings", "get_settings", "__version__"]
__version__ = "1.0.0"
