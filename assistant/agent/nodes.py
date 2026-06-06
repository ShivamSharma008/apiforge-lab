"""Agent reasoning nodes.

Each node is a pure-ish function ``state -> partial_state`` so it can run inside a
LangGraph ``StateGraph`` *or* be called directly in the linear fallback. Keeping
the nodes framework-agnostic means LangGraph stays an optional dependency.
"""

from __future__ import annotations

from typing import Optional

from ..llm.base import BaseLLM
from ..observability.logging import get_logger
from ..observability.tracing import trace
from ..prompts.templates import build_answer_messages, classify_intent
from ..rag.retriever import Retriever
from .state import AgentState

logger = get_logger(__name__)


def route_node(state: AgentState) -> AgentState:
    """Classify the developer's intent to steer retrieval and prompting."""
    with trace("agent.route"):
        intent = classify_intent(state["question"])
    logger.debug("Routed question to intent=%s", intent)
    return {"intent": intent}


def make_retrieve_node(retriever: Optional[Retriever]):
    def retrieve_node(state: AgentState) -> AgentState:
        if retriever is None:
            return {"context_block": "", "citations": []}
        with trace("agent.retrieve", intent=state.get("intent")):
            ctx = retriever.retrieve(state["question"])
        return {
            "context": ctx,
            "context_block": ctx.as_prompt_block(),
            "citations": ctx.citations(),
        }

    return retrieve_node


def make_reason_node(llm: BaseLLM):
    def reason_node(state: AgentState) -> AgentState:
        messages = build_answer_messages(
            question=state["question"],
            context_block=state.get("context_block", ""),
            history=state.get("history") or [],
            intent=state.get("intent", "GENERAL"),
        )
        with trace("agent.reason", backend=llm.name):
            answer = llm.generate(messages)
        return {"answer": answer}

    return reason_node


def critique_node(state: AgentState) -> AgentState:
    """Cheap self-check: flag ungrounded answers when context was available."""
    answer = state.get("answer", "")
    citations = state.get("citations", [])
    notes = []
    if citations and not any(c.split(":")[0] in answer for c in citations):
        notes.append("Answer did not explicitly cite retrieved sources.")
    if not state.get("context_block"):
        notes.append("No project context was retrieved; answer may be generic.")
    return {"critique": " ".join(notes) or "ok"}
