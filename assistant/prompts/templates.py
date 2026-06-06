"""Prompt engineering: system prompts, intent routing, and message assembly.

Centralising prompts here makes them easy to tune, version, and evaluate. The
templates are written so they work well for both a real generative backend and
the offline stub (which keys off the CONTEXT block they inject).
"""

from __future__ import annotations

import re
from typing import List

from ..llm.base import LLMMessage

# --- Intent routing ---------------------------------------------------------

ROUTER_PROMPT = (
    "Classify the developer's question into exactly one intent: "
    "EXPLAIN, DEBUG, HOWTO, ARCHITECTURE, OPTIMIZE, or GENERAL."
)

_INTENT_PATTERNS = [
    ("DEBUG", re.compile(r"\b(error|bug|fix|fails?|broken|exception|stack ?trace|why.*not work)\b", re.I)),
    ("OPTIMIZE", re.compile(r"\b(optimi[sz]e|performance|faster|refactor|improve|slow|memory)\b", re.I)),
    ("ARCHITECTURE", re.compile(r"\b(architecture|design|structure|how.*organi|data ?flow|module)\b", re.I)),
    ("HOWTO", re.compile(r"\b(how (do|to|can)|set ?up|configure|install|run|add|create|implement)\b", re.I)),
    ("EXPLAIN", re.compile(r"\b(what (is|are|does)|explain|describe|meaning|purpose of)\b", re.I)),
]


def classify_intent(question: str) -> str:
    """Lightweight rule-based intent classifier (no LLM call required)."""
    for intent, pattern in _INTENT_PATTERNS:
        if pattern.search(question):
            return intent
    return "GENERAL"


# --- Answer generation ------------------------------------------------------

ANSWER_SYSTEM_PROMPT = """You are the APIForge Lab Project Assistant — an expert pair-programmer that deeply understands THIS codebase.

APIForge Lab is a React 19 + Vite single-page app: an interactive playground for testing APIs, databases, workflows, and Kafka/MQTT events, with a Python/Playwright e2e test suite.

Your job:
- Answer questions about the project's code, modules, APIs, workflows, and architecture.
- Help developers learn, practice, debug, and extend the project.
- Give step-by-step guidance and call out best practices.
- Suggest optimizations and flag potential issues.

Rules:
- Ground every claim in the provided CONTEXT. Cite sources as `path:line` when relevant.
- If the context is insufficient, say so plainly and suggest where to look.
- Be concise, accurate, and developer-friendly. Prefer concrete examples over generalities.
- Never invent APIs, files, or behavior that the context does not support.
"""

_INTENT_GUIDANCE = {
    "DEBUG": "Focus on likely root causes, how to reproduce, and a concrete fix with the relevant file/line.",
    "OPTIMIZE": "Identify bottlenecks/smells and propose specific, measurable improvements.",
    "ARCHITECTURE": "Explain how the pieces fit together and the data/control flow between modules.",
    "HOWTO": "Give numbered, copy-pasteable steps the developer can follow immediately.",
    "EXPLAIN": "Explain clearly, defining terms and referencing the concrete implementation.",
    "GENERAL": "Answer helpfully and ground the response in the project context.",
}


def build_answer_messages(
    question: str,
    context_block: str,
    history: List[LLMMessage] | None = None,
    intent: str = "GENERAL",
) -> List[LLMMessage]:
    """Assemble the full message list for the answer step."""
    messages: List[LLMMessage] = [LLMMessage(role="system", content=ANSWER_SYSTEM_PROMPT)]
    if history:
        # Include prior turns (already bounded by ConversationMemory).
        messages.extend(history)

    guidance = _INTENT_GUIDANCE.get(intent, _INTENT_GUIDANCE["GENERAL"])
    user_content = (
        f"{context_block}\n\n"
        f"INTENT: {intent} — {guidance}\n\n"
        f"DEVELOPER QUESTION: {question}\n\n"
        "Answer using only the context above. Cite sources as `path:line` where useful."
    )
    messages.append(LLMMessage(role="user", content=user_content))
    return messages
