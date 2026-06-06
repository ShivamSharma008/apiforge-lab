"""Developer-assistant tools.

Each tool is a plain Python callable (so it works with zero dependencies) and is
also exposed as a LangChain ``Tool`` via :func:`as_langchain_tools` when LangChain
is installed.
"""

from .codebase import (
    CodebaseTools,
    detect_issues,
    list_modules,
    read_file_slice,
    search_codebase,
)
from .registry import as_langchain_tools, get_tools

__all__ = [
    "CodebaseTools",
    "as_langchain_tools",
    "detect_issues",
    "get_tools",
    "list_modules",
    "read_file_slice",
    "search_codebase",
]
