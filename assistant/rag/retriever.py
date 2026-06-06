"""High-level retriever: builds, persists, loads, and queries the RAG index."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from ..config import Settings, get_settings
from ..observability.logging import get_logger
from ..observability.tracing import trace
from .chunker import Chunk, chunk_documents
from .embeddings import Embedder, get_embedder
from .loader import load_corpus
from .store import SearchResult, VectorStore

logger = get_logger(__name__)


@dataclass
class RetrievedContext:
    """Formatted retrieval output ready to inject into an LLM prompt."""

    results: List[SearchResult]

    @property
    def is_empty(self) -> bool:
        return not self.results

    def as_prompt_block(self, max_chars: int = 6000) -> str:
        """Render results as a labelled CONTEXT block with source citations."""
        parts, total = [], 0
        for i, res in enumerate(self.results, 1):
            c = res.chunk
            header = f"[Source {i}] {c.path} (lines ~{c.start_line}, {c.language}, score={res.score:.3f})"
            body = c.text.strip()
            block = f"{header}\n```{c.language}\n{body}\n```"
            if total + len(block) > max_chars:
                break
            parts.append(block)
            total += len(block)
        return "CONTEXT (retrieved from the APIForge Lab codebase):\n\n" + "\n\n".join(parts)

    def citations(self) -> List[str]:
        return [f"{r.chunk.path}:{r.chunk.start_line}" for r in self.results]


class Retriever:
    """Wraps a :class:`VectorStore` + embedder for semantic search."""

    def __init__(self, store: VectorStore, embedder: Embedder, settings: Settings) -> None:
        self.store = store
        self.embedder = embedder
        self.settings = settings

    def retrieve(self, query: str, k: Optional[int] = None) -> RetrievedContext:
        k = k or self.settings.retrieval_k
        with trace("rag.retrieve", query=query[:120], k=k):
            query_vec = self.embedder.embed_one(query)
            results = self.store.search(query_vec, k=k)
        logger.debug("Retrieved %d chunks for query %r", len(results), query[:60])
        return RetrievedContext(results=results)

    @property
    def size(self) -> int:
        return len(self.store)


def build_index(settings: Settings | None = None) -> Retriever:
    """Load corpus → chunk → embed → persist. Returns a ready Retriever."""
    settings = settings or get_settings()
    settings.ensure_dirs()
    with trace("rag.build_index"):
        docs = load_corpus(settings)
        chunks: List[Chunk] = chunk_documents(docs, settings)
        embedder = get_embedder(settings)
        logger.info("Embedding %d chunks with %s ...", len(chunks), embedder.name)
        vectors = embedder.embed([c.text for c in chunks]) if chunks else []
        store = VectorStore(dim=embedder.dim, embedder_name=embedder.name)
        store.add(chunks, vectors)
        store.finalize()
        store.save(settings.index_dir)
    logger.info("Index built: %d chunks from %d documents.", len(chunks), len(docs))
    return Retriever(store, embedder, settings)


def load_retriever(settings: Settings | None = None) -> Optional[Retriever]:
    """Load a previously built index, or ``None`` if it doesn't exist."""
    settings = settings or get_settings()
    store = VectorStore.load(settings.index_dir)
    if store is None:
        logger.warning("No index found at %s. Run `python -m assistant.cli.index`.", settings.index_dir)
        return None
    return Retriever(store, get_embedder(settings), settings)
