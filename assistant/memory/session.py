"""Per-session conversational memory with disk persistence.

Each session keeps a rolling window of turns. Memory is persisted to
``data/sessions/<session_id>.json`` so context survives process restarts and can
feed evaluation/fine-tuning datasets.
"""

from __future__ import annotations

import json
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from ..config import Settings, get_settings
from ..llm.base import LLMMessage
from ..observability.logging import get_logger

logger = get_logger(__name__)


@dataclass
class Turn:
    role: str
    content: str
    ts: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict:
        return {"role": self.role, "content": self.content, "ts": self.ts}


class ConversationMemory:
    """A bounded, persistent conversation history for one session."""

    def __init__(self, session_id: str, max_turns: int = 20, settings: Settings | None = None) -> None:
        self.session_id = session_id
        self.max_turns = max_turns
        self.settings = settings or get_settings()
        self.turns: List[Turn] = []

    @property
    def _path(self) -> Path:
        return self.settings.sessions_dir / f"{self.session_id}.json"

    def add(self, role: str, content: str) -> None:
        self.turns.append(Turn(role=role, content=content))
        # Keep only the most recent ``max_turns`` exchanges.
        if len(self.turns) > self.max_turns:
            self.turns = self.turns[-self.max_turns :]
        self.save()

    def add_user(self, content: str) -> None:
        self.add("user", content)

    def add_assistant(self, content: str) -> None:
        self.add("assistant", content)

    def as_messages(self) -> List[LLMMessage]:
        return [LLMMessage(role=t.role, content=t.content) for t in self.turns]

    def history_text(self) -> str:
        return "\n".join(f"{t.role}: {t.content}" for t in self.turns)

    # --- Persistence -----------------------------------------------------------
    def save(self) -> None:
        try:
            self.settings.sessions_dir.mkdir(parents=True, exist_ok=True)
            payload = {"session_id": self.session_id, "turns": [t.to_dict() for t in self.turns]}
            self._path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        except OSError:
            logger.debug("Failed to persist session %s", self.session_id, exc_info=True)

    def load(self) -> None:
        if not self._path.exists():
            return
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
            self.turns = [Turn(**t) for t in payload.get("turns", [])]
        except (OSError, json.JSONDecodeError):
            logger.debug("Failed to load session %s", self.session_id, exc_info=True)


class SessionStore:
    """In-memory registry of active sessions backed by disk persistence."""

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._sessions: Dict[str, ConversationMemory] = {}
        self._lock = threading.Lock()

    def get_or_create(self, session_id: Optional[str] = None) -> ConversationMemory:
        session_id = session_id or uuid.uuid4().hex[:12]
        with self._lock:
            if session_id not in self._sessions:
                mem = ConversationMemory(session_id, settings=self.settings)
                mem.load()
                self._sessions[session_id] = mem
            return self._sessions[session_id]

    def reset(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)
        path = self.settings.sessions_dir / f"{session_id}.json"
        if path.exists():
            path.unlink()


_STORE: Optional[SessionStore] = None


def get_session_store() -> SessionStore:
    global _STORE
    if _STORE is None:
        _STORE = SessionStore()
    return _STORE
