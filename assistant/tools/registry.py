"""Tool registry + optional LangChain ``Tool`` adapters."""

from __future__ import annotations

from typing import Callable, Dict, List, Optional

from ..rag.retriever import Retriever
from .codebase import CodebaseTools


def get_tools(retriever: Optional[Retriever] = None) -> Dict[str, Callable[..., str]]:
    """Return the assistant's tools as a name → callable mapping."""
    bundle = CodebaseTools(retriever=retriever)
    return {
        "search_codebase": bundle.search,
        "read_file": bundle.read,
        "list_modules": bundle.modules,
        "detect_issues": bundle.issues,
    }


_DESCRIPTIONS = {
    "search_codebase": "Semantic search over the APIForge Lab codebase. Input: a natural-language query.",
    "read_file": "Read a slice of a repo-relative file. Input: a file path.",
    "list_modules": "List the project's modules/files grouped by directory.",
    "detect_issues": "Heuristically scan the codebase for issues and optimization opportunities.",
}


def as_langchain_tools(retriever: Optional[Retriever] = None) -> List:
    """Expose the tools as LangChain ``Tool`` objects (requires langchain_core)."""
    from langchain_core.tools import Tool  # optional dependency

    tools = get_tools(retriever)
    return [
        Tool(name=name, func=func, description=_DESCRIPTIONS.get(name, name))
        for name, func in tools.items()
    ]
