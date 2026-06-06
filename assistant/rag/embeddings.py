"""Embeddings with graceful fallback.

Preference order:
1. ``sentence-transformers`` (local, free, high quality) — if installed.
2. A deterministic hashing-bag-of-words embedder (pure Python + optional numpy)
   that needs **no** downloads and always works offline.

Both expose the same :class:`Embedder` interface so the rest of the pipeline is
agnostic to which one is active.
"""

from __future__ import annotations

import hashlib
import math
import re
from typing import List, Sequence

from ..config import Settings, get_settings
from ..observability.logging import get_logger

logger = get_logger(__name__)

_WORD_RE = re.compile(r"[A-Za-z0-9_]+")


class Embedder:
    """Common embedder interface."""

    dim: int = 0
    name: str = "base"

    def embed(self, texts: Sequence[str]) -> List[List[float]]:  # pragma: no cover - abstract
        raise NotImplementedError

    def embed_one(self, text: str) -> List[float]:
        return self.embed([text])[0]


class SentenceTransformerEmbedder(Embedder):
    """Wraps a local sentence-transformers model when available."""

    def __init__(self, model_name: str) -> None:
        from sentence_transformers import SentenceTransformer

        self._model = SentenceTransformer(model_name)
        self.dim = self._model.get_sentence_embedding_dimension()
        self.name = f"sentence-transformers:{model_name}"

    def embed(self, texts: Sequence[str]) -> List[List[float]]:
        vectors = self._model.encode(list(texts), normalize_embeddings=True)
        return [list(map(float, v)) for v in vectors]


class HashingEmbedder(Embedder):
    """Deterministic, dependency-free hashing embedder.

    Maps tokens into a fixed-size vector via feature hashing with sublinear term
    weighting, then L2-normalises. No model download, fully offline.
    """

    def __init__(self, dim: int = 512) -> None:
        self.dim = dim
        self.name = f"hashing:{dim}"

    def _hash(self, token: str) -> int:
        digest = hashlib.md5(token.encode("utf-8")).digest()
        return int.from_bytes(digest[:4], "little") % self.dim

    def embed(self, texts: Sequence[str]) -> List[List[float]]:
        return [self._embed_one(t) for t in texts]

    def _embed_one(self, text: str) -> List[float]:
        vec = [0.0] * self.dim
        tokens = _WORD_RE.findall(text.lower())
        for tok in tokens:
            idx = self._hash(tok)
            sign = 1.0 if self._hash(tok + "#sign") % 2 == 0 else -1.0
            vec[idx] += sign
        # Sublinear scaling + L2 normalisation.
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]


_EMBEDDER_CACHE: dict = {}


def get_embedder(settings: Settings | None = None) -> Embedder:
    """Return the best available embedder for the current environment (cached)."""
    settings = settings or get_settings()
    cache_key = settings.embedding_model
    if cache_key in _EMBEDDER_CACHE:
        return _EMBEDDER_CACHE[cache_key]
    try:
        embedder = SentenceTransformerEmbedder(settings.embedding_model)
        logger.info("Using %s (dim=%d)", embedder.name, embedder.dim)
        _EMBEDDER_CACHE[cache_key] = embedder
        return embedder
    except Exception as exc:
        logger.info(
            "sentence-transformers unavailable (%s); using offline HashingEmbedder.", exc
        )
        embedder = HashingEmbedder()
        _EMBEDDER_CACHE[cache_key] = embedder
        return embedder
