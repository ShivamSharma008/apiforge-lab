"""The Project Assistant: orchestrates the multi-step reasoning workflow.

Uses LangGraph's ``StateGraph`` when the package is installed; otherwise runs the
exact same nodes in a deterministic linear sequence. Both paths produce an
identical :class:`AgentResult`.

Workflow: ``route → retrieve → reason → critique``.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterator, List, Optional

from ..config import Settings, get_settings
from ..llm.base import BaseLLM
from ..llm.factory import get_llm
from ..memory.session import ConversationMemory, get_session_store
from ..observability.logging import get_logger, log_interaction
from ..observability.tracing import trace
from ..prompts.templates import build_answer_messages, classify_intent
from ..rag.retriever import Retriever, load_retriever
from .nodes import critique_node, make_reason_node, make_retrieve_node, route_node
from .state import AgentState

logger = get_logger(__name__)


@dataclass
class AgentResult:
    answer: str
    intent: str = "GENERAL"
    citations: List[str] = field(default_factory=list)
    critique: str = "ok"
    session_id: str = ""
    backend: str = "stub"


class ProjectAssistant:
    """High-level agent facade used by the API, CLI, and tests."""

    def __init__(
        self,
        retriever: Optional[Retriever] = None,
        llm: Optional[BaseLLM] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.retriever = retriever if retriever is not None else load_retriever(self.settings)
        self.llm = llm or get_llm()
        self._retrieve = make_retrieve_node(self.retriever)
        self._reason = make_reason_node(self.llm)
        self._graph = self._try_build_graph()

    # --- Graph construction ----------------------------------------------------
    def _try_build_graph(self):
        try:
            from langgraph.graph import END, StateGraph

            graph = StateGraph(AgentState)
            graph.add_node("route", route_node)
            graph.add_node("retrieve", self._retrieve)
            graph.add_node("reason", self._reason)
            graph.add_node("critique", critique_node)
            graph.set_entry_point("route")
            graph.add_edge("route", "retrieve")
            graph.add_edge("retrieve", "reason")
            graph.add_edge("reason", "critique")
            graph.add_edge("critique", END)
            logger.info("LangGraph workflow compiled.")
            return graph.compile()
        except Exception as exc:
            logger.info("LangGraph unavailable (%s); using linear fallback workflow.", exc)
            return None

    # --- Public API ------------------------------------------------------------
    def answer(self, question: str, session_id: Optional[str] = None) -> AgentResult:
        memory = get_session_store().get_or_create(session_id)
        state: AgentState = {
            "question": question,
            "session_id": memory.session_id,
            "history": memory.as_messages(),
        }
        with trace("agent.run", session=memory.session_id):
            final = self._graph.invoke(state) if self._graph else self._run_linear(state)

        result = AgentResult(
            answer=final.get("answer", ""),
            intent=final.get("intent", "GENERAL"),
            citations=final.get("citations", []),
            critique=final.get("critique", "ok"),
            session_id=memory.session_id,
            backend=self.llm.name,
        )
        self._record(memory, question, result)
        return result

    def stream(self, question: str, session_id: Optional[str] = None) -> Iterator[str]:
        """Stream the answer token-by-token after route+retrieve complete."""
        memory = get_session_store().get_or_create(session_id)
        intent = classify_intent(question)
        ctx_state = self._retrieve({"question": question, "intent": intent})
        messages = build_answer_messages(
            question=question,
            context_block=ctx_state.get("context_block", ""),
            history=memory.as_messages(),
            intent=intent,
        )
        chunks: List[str] = []
        with trace("agent.stream", session=memory.session_id):
            for piece in self.llm.stream(messages):
                chunks.append(piece)
                yield piece
        answer = "".join(chunks)
        result = AgentResult(
            answer=answer,
            intent=intent,
            citations=ctx_state.get("citations", []),
            session_id=memory.session_id,
            backend=self.llm.name,
        )
        self._record(memory, question, result)

    # --- Internals -------------------------------------------------------------
    def _run_linear(self, state: AgentState) -> AgentState:
        for node in (route_node, self._retrieve, self._reason, critique_node):
            state = {**state, **node(state)}
        return state

    def _record(self, memory: ConversationMemory, question: str, result: AgentResult) -> None:
        memory.add_user(question)
        memory.add_assistant(result.answer)
        log_interaction(
            "chat",
            {
                "session_id": result.session_id,
                "question": question,
                "intent": result.intent,
                "citations": result.citations,
                "critique": result.critique,
                "backend": result.backend,
                "answer_preview": result.answer[:280],
            },
        )

    @property
    def has_index(self) -> bool:
        return self.retriever is not None and self.retriever.size > 0


_ASSISTANT: Optional[ProjectAssistant] = None


def get_assistant(force_reload: bool = False) -> ProjectAssistant:
    """Return a process-wide assistant instance."""
    global _ASSISTANT
    if _ASSISTANT is None or force_reload:
        _ASSISTANT = ProjectAssistant()
    return _ASSISTANT
