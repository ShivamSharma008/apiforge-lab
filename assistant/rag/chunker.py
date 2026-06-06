"""Document chunking with overlap and lightweight structural awareness.

Markdown is split on headings; code is split on blank-line boundaries so chunks
tend to align with functions/blocks. Everything is then packed to a target size
with a configurable overlap to preserve context across chunk boundaries.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from typing import Dict, List

from ..config import Settings, get_settings
from .loader import Document

_MD_HEADING = re.compile(r"^#{1,6}\s", re.MULTILINE)


@dataclass
class Chunk:
    """A retrievable unit of text with provenance metadata."""

    id: str
    path: str
    language: str
    kind: str
    text: str
    start_line: int

    def to_dict(self) -> Dict:
        return asdict(self)


def _split_segments(doc: Document) -> List[str]:
    """First-pass split: by headings for markdown, blank lines for code."""
    if doc.language == "markdown":
        parts = _MD_HEADING.split(doc.text)
        # Re-attach the heading marker that split() consumes.
        headings = _MD_HEADING.findall(doc.text)
        segments = []
        if parts and parts[0].strip():
            segments.append(parts[0])
        for marker, body in zip(headings, parts[1:]):
            segments.append(marker + body)
        return segments or [doc.text]
    return re.split(r"\n\s*\n", doc.text)


def _pack(segments: List[str], size: int, overlap: int) -> List[str]:
    """Greedily pack segments into ~``size`` char windows with char ``overlap``."""
    chunks: List[str] = []
    current = ""
    for seg in segments:
        seg = seg.strip("\n")
        if not seg.strip():
            continue
        if len(current) + len(seg) + 1 <= size:
            current = f"{current}\n{seg}" if current else seg
        else:
            if current:
                chunks.append(current)
            if len(seg) > size:
                # Hard-wrap oversized segments.
                for i in range(0, len(seg), size - overlap):
                    chunks.append(seg[i : i + size])
                current = ""
            else:
                tail = current[-overlap:] if overlap and current else ""
                current = f"{tail}\n{seg}" if tail else seg
    if current.strip():
        chunks.append(current)
    return chunks


def chunk_documents(docs: List[Document], settings: Settings | None = None) -> List[Chunk]:
    """Convert documents into overlapping, provenance-tagged chunks."""
    settings = settings or get_settings()
    size, overlap = settings.chunk_size, settings.chunk_overlap
    chunks: List[Chunk] = []
    for doc in docs:
        segments = _split_segments(doc)
        for idx, text in enumerate(_pack(segments, size, overlap)):
            start_line = doc.text[: doc.text.find(text[:40])].count("\n") + 1 if text[:40] in doc.text else 1
            chunks.append(
                Chunk(
                    id=f"{doc.path}::{idx}",
                    path=doc.path,
                    language=doc.language,
                    kind=doc.kind,
                    text=text.strip(),
                    start_line=start_line,
                )
            )
    return chunks
