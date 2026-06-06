"""Environment-driven configuration and feature flags for the AI assistant.

Everything is overridable via environment variables so the same code runs in a
zero-dependency offline mode or wired to a real provider/observability stack.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    try:
        return int(raw) if raw is not None else default
    except ValueError:
        return default


# Repository root = parent of the ``assistant`` package directory.
REPO_ROOT = Path(__file__).resolve().parent.parent


@dataclass
class Settings:
    """Resolved runtime settings.

    Attributes are populated from environment variables with safe offline defaults.
    """

    # --- Paths -----------------------------------------------------------------
    repo_root: Path = REPO_ROOT
    data_dir: Path = REPO_ROOT / "data"

    # --- LLM backend -----------------------------------------------------------
    # "stub" (default, offline) | "openai" | "azure" | "anthropic" | custom
    llm_backend: str = field(default_factory=lambda: os.getenv("ASSISTANT_LLM_BACKEND", "stub"))
    llm_model: str = field(default_factory=lambda: os.getenv("ASSISTANT_LLM_MODEL", "stub-rag-1"))
    llm_temperature: float = field(
        default_factory=lambda: float(os.getenv("ASSISTANT_LLM_TEMPERATURE", "0.1"))
    )
    max_output_tokens: int = field(default_factory=lambda: _env_int("ASSISTANT_MAX_OUTPUT_TOKENS", 768))

    # --- Embeddings / RAG ------------------------------------------------------
    embedding_model: str = field(
        default_factory=lambda: os.getenv(
            "ASSISTANT_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
        )
    )
    chunk_size: int = field(default_factory=lambda: _env_int("ASSISTANT_CHUNK_SIZE", 900))
    chunk_overlap: int = field(default_factory=lambda: _env_int("ASSISTANT_CHUNK_OVERLAP", 150))
    retrieval_k: int = field(default_factory=lambda: _env_int("ASSISTANT_RETRIEVAL_K", 5))

    # --- Observability ---------------------------------------------------------
    langsmith_enabled: bool = field(
        default_factory=lambda: _env_bool("LANGCHAIN_TRACING_V2", False)
        or _env_bool("ASSISTANT_LANGSMITH", False)
    )
    langsmith_project: str = field(
        default_factory=lambda: os.getenv("LANGCHAIN_PROJECT", "apiforge-lab-assistant")
    )
    log_level: str = field(default_factory=lambda: os.getenv("ASSISTANT_LOG_LEVEL", "INFO"))

    # --- API -------------------------------------------------------------------
    api_host: str = field(default_factory=lambda: os.getenv("ASSISTANT_API_HOST", "127.0.0.1"))
    api_port: int = field(default_factory=lambda: _env_int("ASSISTANT_API_PORT", 8000))

    def __post_init__(self) -> None:
        self.repo_root = Path(self.repo_root)
        self.data_dir = Path(os.getenv("ASSISTANT_DATA_DIR", str(self.data_dir)))

    # Derived paths -------------------------------------------------------------
    @property
    def index_dir(self) -> Path:
        return self.data_dir / "index"

    @property
    def sessions_dir(self) -> Path:
        return self.data_dir / "sessions"

    @property
    def logs_dir(self) -> Path:
        return self.data_dir / "logs"

    @property
    def datasets_dir(self) -> Path:
        return self.data_dir / "datasets"

    @property
    def feedback_path(self) -> Path:
        return self.data_dir / "feedback.jsonl"

    def ensure_dirs(self) -> None:
        for path in (self.data_dir, self.index_dir, self.sessions_dir, self.logs_dir, self.datasets_dir):
            path.mkdir(parents=True, exist_ok=True)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a process-wide cached :class:`Settings` instance."""
    return Settings()
