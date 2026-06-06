"""Structured logging and a JSONL interaction audit trail.

All chat interactions, agent decisions, and outputs are appended to
``data/logs/interactions.jsonl`` for later inspection, evaluation, and
fine-tuning dataset construction.
"""

from __future__ import annotations

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict

_CONFIGURED = False


def _configure_root() -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return
    # Import here to avoid a circular import at module load time.
    from ..config import get_settings

    level = getattr(logging, get_settings().log_level.upper(), logging.INFO)
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)-7s | %(name)s | %(message)s")
    )
    root = logging.getLogger("assistant")
    root.setLevel(level)
    if not root.handlers:
        root.addHandler(handler)
    root.propagate = False
    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    """Return a namespaced logger under the ``assistant`` root."""
    _configure_root()
    short = name.split(".")[-1] if name.startswith("assistant") else name
    return logging.getLogger(f"assistant.{short}")


def log_interaction(event: str, payload: Dict[str, Any]) -> None:
    """Append a structured interaction record to the audit trail (best-effort)."""
    try:
        from ..config import get_settings

        settings = get_settings()
        settings.logs_dir.mkdir(parents=True, exist_ok=True)
        record = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "event": event,
            **payload,
        }
        with (settings.logs_dir / "interactions.jsonl").open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")
    except Exception:  # pragma: no cover - logging must never break the app
        get_logger(__name__).debug("Failed to persist interaction log", exc_info=True)
