"""Vector store with FAISS acceleration and a pure-Python fallback.

Persists to ``data/index/`` as a portable JSON payload (chunks + metadata) plus,
when available, a FAISS binary index for fast search. If FAISS is absent, search
falls back to exact cosine similarity over the stored vectors.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Sequence, Tuple

from ..observability.logging import get_logger
from .chunker import Chunk

logger = get_logger(__name__)


@dataclass
class SearchResult:
    chunk: Chunk
    score: float


class VectorStore:
    """Stores chunk vectors and supports top-k similarity search."""

    def __init__(self, dim: int, embedder_name: str = "unknown") -> None:
        self.dim = dim
        self.embedder_name = embedder_name
        self._chunks: List[Chunk] = []
        self._vectors: List[List[float]] = []
        self._faiss = None  # lazy FAISS index

    # --- Construction ----------------------------------------------------------
    def add(self, chunks: Sequence[Chunk], vectors: Sequence[Sequence[float]]) -> None:
        for chunk, vec in zip(chunks, vectors):
            self._chunks.append(chunk)
            self._vectors.append(list(map(float, vec)))

    def _build_faiss(self) -> None:
        try:
            import faiss  # type: ignore
            import numpy as np

            mat = np.asarray(self._vectors, dtype="float32")
            index = faiss.IndexFlatIP(self.dim)  # vectors are normalised → IP == cosine
            index.add(mat)
            self._faiss = index
            logger.info("FAISS index built (%d vectors, dim=%d).", len(self._vectors), self.dim)
        except Exception as exc:
            self._faiss = None
            logger.info("FAISS unavailable (%s); using pure-Python cosine search.", exc)

    def finalize(self) -> None:
        self._build_faiss()

    # --- Search ----------------------------------------------------------------
    def search(self, query_vec: Sequence[float], k: int = 5) -> List[SearchResult]:
        if not self._vectors:
            return []
        k = min(k, len(self._vectors))
        if self._faiss is not None:
            return self._search_faiss(query_vec, k)
        return self._search_python(query_vec, k)

    def _search_faiss(self, query_vec: Sequence[float], k: int) -> List[SearchResult]:
        import numpy as np

        q = np.asarray([query_vec], dtype="float32")
        scores, idxs = self._faiss.search(q, k)
        return [
            SearchResult(self._chunks[i], float(s))
            for s, i in zip(scores[0], idxs[0])
            if i >= 0
        ]

    def _search_python(self, query_vec: Sequence[float], k: int) -> List[SearchResult]:
        scored: List[Tuple[float, int]] = []
        qn = math.sqrt(sum(v * v for v in query_vec)) or 1.0
        for i, vec in enumerate(self._vectors):
            dot = sum(a * b for a, b in zip(query_vec, vec))
            vn = math.sqrt(sum(v * v for v in vec)) or 1.0
            scored.append((dot / (qn * vn), i))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [SearchResult(self._chunks[i], float(s)) for s, i in scored[:k]]

    # --- Persistence -----------------------------------------------------------
    def save(self, index_dir: Path) -> None:
        index_dir.mkdir(parents=True, exist_ok=True)
        payload = {
            "dim": self.dim,
            "embedder": self.embedder_name,
            "chunks": [c.to_dict() for c in self._chunks],
            "vectors": self._vectors,
        }
        (index_dir / "store.json").write_text(json.dumps(payload), encoding="utf-8")
        logger.info("Saved vector store → %s (%d chunks).", index_dir, len(self._chunks))

    @classmethod
    def load(cls, index_dir: Path) -> Optional["VectorStore"]:
        store_path = index_dir / "store.json"
        if not store_path.exists():
            return None
        payload = json.loads(store_path.read_text(encoding="utf-8"))
        store = cls(dim=payload["dim"], embedder_name=payload.get("embedder", "unknown"))
        store._chunks = [Chunk(**c) for c in payload["chunks"]]
        store._vectors = [list(map(float, v)) for v in payload["vectors"]]
        store.finalize()
        return store

    def __len__(self) -> int:
        return len(self._chunks)
