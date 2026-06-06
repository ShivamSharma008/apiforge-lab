"""Feedback capture for the continuous-improvement loop.

Positively-rated answers are later promoted into the fine-tuning dataset (see
:mod:`assistant.finetune.dataset`). This module is a thin, dependency-free helper
also used by the API ``/feedback`` endpoint.
"""

from __future__ import annotations

import json
from typing import Optional

from ..config import Settings, get_settings
from ..observability.logging import get_logger, log_interaction

logger = get_logger(__name__)


def record_feedback(
    session_id: str,
    message: str,
    answer: str,
    rating: int,
    comment: str = "",
    settings: Optional[Settings] = None,
) -> None:
    """Append a feedback record to ``data/feedback.jsonl``."""
    settings = settings or get_settings()
    settings.ensure_dirs()
    record = {
        "session_id": session_id,
        "message": message,
        "answer": answer,
        "rating": int(rating),
        "comment": comment,
    }
    with settings.feedback_path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")
    log_interaction("feedback", record)
    logger.debug("Recorded feedback for session %s (rating=%s)", session_id, rating)
