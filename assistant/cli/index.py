"""Build or refresh the RAG index from the repository."""

from __future__ import annotations

import sys

from ..config import get_settings
from ..rag.retriever import build_index


def main() -> int:
    settings = get_settings()
    print(f"Indexing repository at: {settings.repo_root}")
    retriever = build_index(settings)
    print(f"✅ Index built: {retriever.size} chunks → {settings.index_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
