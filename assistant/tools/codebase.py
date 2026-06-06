"""Concrete codebase-inspection tools used by the agent."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

from ..config import Settings, get_settings
from ..observability.logging import get_logger
from ..rag.loader import iter_source_files
from ..rag.retriever import Retriever

logger = get_logger(__name__)


def read_file_slice(path: str, start: int = 1, end: Optional[int] = None,
                    settings: Settings | None = None) -> str:
    """Return lines ``start..end`` (1-indexed) of a repo-relative file."""
    settings = settings or get_settings()
    target = (settings.repo_root / path).resolve()
    # Guard against path traversal outside the repo.
    if settings.repo_root not in target.parents and target != settings.repo_root:
        return f"Refused: '{path}' is outside the repository."
    if not target.is_file():
        return f"File not found: {path}"
    lines = target.read_text(encoding="utf-8", errors="ignore").splitlines()
    end = end or min(start + 60, len(lines))
    snippet = lines[max(0, start - 1) : end]
    numbered = "\n".join(f"{i}: {ln}" for i, ln in enumerate(snippet, start=start))
    return f"{path} (lines {start}-{end}):\n{numbered}"


def list_modules(settings: Settings | None = None) -> str:
    """Summarise the repository's source files grouped by top-level directory."""
    settings = settings or get_settings()
    groups: dict[str, List[str]] = {}
    for path in iter_source_files(settings.repo_root):
        rel = path.relative_to(settings.repo_root)
        top = rel.parts[0] if len(rel.parts) > 1 else "(root)"
        groups.setdefault(top, []).append(rel.as_posix())
    lines = []
    for top in sorted(groups):
        lines.append(f"{top}/ ({len(groups[top])} files)")
        for f in sorted(groups[top])[:25]:
            lines.append(f"  - {f}")
    return "\n".join(lines)


# Lightweight heuristics for the "detect issues / suggest optimizations" tool.
_ISSUE_PATTERNS = [
    (re.compile(r"console\.log\("), "Leftover console.log — remove or gate behind a debug flag."),
    (re.compile(r"\bvar\s+\w"), "Use of `var` — prefer `const`/`let` for block scoping."),
    (re.compile(r"==[^=]"), "Loose equality `==` — prefer strict `===` to avoid coercion bugs."),
    (re.compile(r"TODO|FIXME|XXX"), "Unresolved TODO/FIXME marker."),
    (re.compile(r"dangerouslySetInnerHTML"), "dangerouslySetInnerHTML — XSS risk; sanitise input."),
    (re.compile(r"\.then\([^)]*\)\.then"), "Chained .then() — consider async/await for readability."),
    (re.compile(r"key=\{?index\}?"), "Using array index as React key — can cause render bugs."),
]


def detect_issues(max_files: int = 200, settings: Settings | None = None) -> str:
    """Scan source files for common smells and optimization opportunities."""
    settings = settings or get_settings()
    findings: List[str] = []
    scanned = 0
    for path in iter_source_files(settings.repo_root):
        if path.suffix.lower() not in {".js", ".jsx", ".ts", ".tsx", ".py"}:
            continue
        scanned += 1
        if scanned > max_files:
            break
        rel = path.relative_to(settings.repo_root).as_posix()
        text = path.read_text(encoding="utf-8", errors="ignore")
        for lineno, line in enumerate(text.splitlines(), 1):
            for pattern, message in _ISSUE_PATTERNS:
                if pattern.search(line):
                    findings.append(f"{rel}:{lineno} — {message}")
    if not findings:
        return "No common issues detected by heuristic scan. ✅"
    capped = findings[:40]
    suffix = "" if len(findings) <= 40 else f"\n… and {len(findings) - 40} more."
    return "Potential issues / optimizations:\n" + "\n".join(f"- {f}" for f in capped) + suffix


def search_codebase(query: str, retriever: Optional[Retriever] = None, k: int = 5) -> str:
    """Semantic search over the indexed codebase (falls back to a notice)."""
    if retriever is None:
        from ..rag.retriever import load_retriever

        retriever = load_retriever()
    if retriever is None:
        return "No index available. Build it with `python -m assistant.cli.index`."
    ctx = retriever.retrieve(query, k=k)
    if ctx.is_empty:
        return f"No matches for {query!r}."
    return ctx.as_prompt_block()


@dataclass
class CodebaseTools:
    """Bundle of tools bound to a retriever for the agent."""

    retriever: Optional[Retriever] = None
    settings: Settings | None = None

    def __post_init__(self) -> None:
        self.settings = self.settings or get_settings()

    def search(self, query: str, k: int = 5) -> str:
        return search_codebase(query, self.retriever, k)

    def read(self, path: str, start: int = 1, end: Optional[int] = None) -> str:
        return read_file_slice(path, start, end, self.settings)

    def modules(self) -> str:
        return list_modules(self.settings)

    def issues(self) -> str:
        return detect_issues(settings=self.settings)
