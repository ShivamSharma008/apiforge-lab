"""Offline, keyless default LLM backend.

``StubLLM`` does not call any external service. Instead it composes a grounded,
clearly-marked answer from the context the agent already retrieved via RAG. This
keeps the whole system functional with zero API keys while remaining honest about
the fact that no neural generation model is producing the text.

Swap in a real provider by setting ``ASSISTANT_LLM_BACKEND`` (see
:func:`assistant.llm.factory.get_llm`).
"""

from __future__ import annotations

import re
from typing import List

from .base import BaseLLM, LLMMessage

STUB_BANNER = "🤖 [APIForge Assistant · offline stub backend]"


class StubLLM(BaseLLM):
    """Deterministic, retrieval-grounded responder.

    The agent passes retrieved context inside the system/user messages. The stub
    extracts the most relevant sentences from that context and returns a concise,
    structured answer. It never fabricates external facts.
    """

    name = "stub"

    def __init__(self, model: str = "stub-rag-1") -> None:
        self.model = model

    @property
    def is_stub(self) -> bool:
        return True

    def generate(self, messages: List[LLMMessage], **kwargs) -> str:
        question = _last_user(messages)
        context = _extract_context(messages)

        if not context.strip():
            return (
                f"{STUB_BANNER}\n\n"
                "I couldn't find indexed project context to ground an answer. "
                "Build the index first with `python -m assistant.cli.index` and ask again.\n\n"
                f"Your question: {question!r}"
            )

        ranked = _rank_sentences(question, context)
        bullets = "\n".join(f"- {s}" for s in ranked[:6]) or "- (no strongly matching passages)"

        return (
            f"{STUB_BANNER}\n\n"
            f"**Question:** {question}\n\n"
            "**Grounded answer (extracted from the codebase & docs):**\n"
            f"{bullets}\n\n"
            "_This response was assembled offline from retrieved project context. "
            "Plug in a generative backend via `ASSISTANT_LLM_BACKEND` for fluent prose._"
        )


def _last_user(messages: List[LLMMessage]) -> str:
    for msg in reversed(messages):
        if msg.role == "user":
            content = msg.content
            # Our answer prompt embeds the real question after this marker.
            match = re.search(r"DEVELOPER QUESTION:\s*(.+?)(?:\n\n|$)", content, re.S)
            if match:
                return match.group(1).strip()
            return content.strip()
    return ""


def _extract_context(messages: List[LLMMessage]) -> str:
    """Pull retrieved-context blocks the agent injected into the prompt."""
    blocks: List[str] = []
    for msg in messages:
        content = msg.content
        if "CONTEXT" in content.upper() or "```" in content or "Source:" in content:
            blocks.append(content)
    return "\n\n".join(blocks) if blocks else "\n\n".join(m.content for m in messages if m.role != "user")


_WORD_RE = re.compile(r"[A-Za-z0-9_]+")


def _tokenize(text: str) -> set:
    return {w.lower() for w in _WORD_RE.findall(text)}


def _rank_sentences(question: str, context: str) -> List[str]:
    """Rank context sentences by lexical overlap with the question."""
    q_tokens = _tokenize(question)
    sentences = re.split(r"(?<=[.!?])\s+|\n+", context)
    scored = []
    for sentence in sentences:
        clean = sentence.strip().strip("`").strip()
        if len(clean) < 12:
            continue
        overlap = len(q_tokens & _tokenize(clean))
        if overlap:
            scored.append((overlap, clean))
    scored.sort(key=lambda x: x[0], reverse=True)
    seen, result = set(), []
    for _, sentence in scored:
        key = sentence[:80]
        if key not in seen:
            seen.add(key)
            result.append(sentence)
    return result
