"""Retrieval-Augmented Generation pipeline.

Loader → Chunker → Embeddings → Vector store → Retriever. Every component has a
zero-dependency fallback so RAG works without faiss or sentence-transformers.
"""

from .chunker import Chunk, chunk_documents
from .embeddings import get_embedder
from .loader import Document, load_corpus
from .retriever import Retriever, build_index, load_retriever
from .store import VectorStore

__all__ = [
    "Chunk",
    "Document",
    "Retriever",
    "VectorStore",
    "build_index",
    "chunk_documents",
    "get_embedder",
    "load_corpus",
    "load_retriever",
]
