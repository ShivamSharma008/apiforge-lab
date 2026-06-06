"""Corpus loader — walks the repository and collects indexable documents."""

from __future__ import annotations

import fnmatch
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator, List

from ..config import Settings, get_settings
from ..observability.logging import get_logger

logger = get_logger(__name__)

# Extensions worth indexing for a code-aware assistant.
INCLUDE_EXTENSIONS = {
    ".js", ".jsx", ".ts", ".tsx", ".py", ".md", ".mdx", ".json",
    ".css", ".html", ".yml", ".yaml", ".toml", ".cfg", ".ini", ".txt",
}

# Directories and globs we never want to index.
EXCLUDE_DIRS = {
    "node_modules", ".git", "dist", "dist-ssr", "build", "__pycache__",
    ".pytest_cache", ".idea", ".vscode", "data", "artifacts", "coverage",
    ".venv", "venv", "env",
}
EXCLUDE_GLOBS = ("*.min.js", "*.min.css", "package-lock.json", "*.lock", "*.map")

MAX_FILE_BYTES = 400_000  # skip very large generated files


@dataclass
class Document:
    """A single source document pulled from the repository."""

    path: str           # repo-relative POSIX path
    text: str
    language: str

    @property
    def kind(self) -> str:
        return "docs" if self.language in {"markdown", "text"} else "code"


def _language_for(suffix: str) -> str:
    return {
        ".js": "javascript", ".jsx": "javascript", ".ts": "typescript", ".tsx": "typescript",
        ".py": "python", ".md": "markdown", ".mdx": "markdown", ".json": "json",
        ".css": "css", ".html": "html", ".yml": "yaml", ".yaml": "yaml",
        ".toml": "toml", ".txt": "text",
    }.get(suffix, "text")


def _excluded(path: Path, root: Path) -> bool:
    rel_parts = set(path.relative_to(root).parts)
    if rel_parts & EXCLUDE_DIRS:
        return True
    return any(fnmatch.fnmatch(path.name, pat) for pat in EXCLUDE_GLOBS)


def iter_source_files(root: Path) -> Iterator[Path]:
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in INCLUDE_EXTENSIONS:
            continue
        if _excluded(path, root):
            continue
        try:
            if path.stat().st_size > MAX_FILE_BYTES:
                continue
        except OSError:
            continue
        yield path


def load_corpus(settings: Settings | None = None) -> List[Document]:
    """Load all indexable documents from the repository root."""
    settings = settings or get_settings()
    root = settings.repo_root
    docs: List[Document] = []
    for path in iter_source_files(root):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if not text.strip():
            continue
        rel = path.relative_to(root).as_posix()
        docs.append(Document(path=rel, text=text, language=_language_for(path.suffix.lower())))
    logger.info("Loaded %d documents from %s", len(docs), root)
    return docs
