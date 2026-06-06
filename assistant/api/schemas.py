"""Pydantic-free request/response schemas (works with or without pydantic).

We keep these as plain dataclasses and do manual (de)serialisation so the API
module imports cleanly even in minimal environments; FastAPI itself accepts
dict bodies just fine.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ChatRequest:
    message: str
    session_id: Optional[str] = None
    stream: bool = True

    @classmethod
    def from_dict(cls, data: dict) -> "ChatRequest":
        return cls(
            message=str(data.get("message", "")).strip(),
            session_id=data.get("session_id"),
            stream=bool(data.get("stream", True)),
        )


@dataclass
class ChatResponse:
    answer: str
    session_id: str
    intent: str
    citations: List[str] = field(default_factory=list)
    backend: str = "stub"

    def to_dict(self) -> dict:
        return {
            "answer": self.answer,
            "session_id": self.session_id,
            "intent": self.intent,
            "citations": self.citations,
            "backend": self.backend,
        }


@dataclass
class FeedbackRequest:
    session_id: str
    message: str
    answer: str
    rating: int  # -1, 0, +1
    comment: str = ""

    @classmethod
    def from_dict(cls, data: dict) -> "FeedbackRequest":
        return cls(
            session_id=str(data.get("session_id", "")),
            message=str(data.get("message", "")),
            answer=str(data.get("answer", "")),
            rating=int(data.get("rating", 0)),
            comment=str(data.get("comment", "")),
        )
