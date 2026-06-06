"""Typed state shared across the agent's reasoning steps."""

from __future__ import annotations

from typing import List, Optional, TypedDict

from ..rag.retriever import RetrievedContext


class AgentState(TypedDict, total=False):
    """State threaded through the LangGraph nodes."""

    question: str
    session_id: str
    intent: str
    context: Optional[RetrievedContext]
    context_block: str
    history: list
    answer: str
    citations: List[str]
    critique: str
