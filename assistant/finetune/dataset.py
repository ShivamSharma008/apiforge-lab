"""Build an instruction-tuning (SFT) dataset from project-specific data.

Sources, in priority order:
1. **Curated Q&A** about the project (``assistant/eval/testset.py``) — high signal.
2. **Documentation** (README + docs pages) → "explain this section" examples.
3. **Code modules** → "what does this file do" examples grounded in real code.
4. **Interaction logs** (``data/logs/interactions.jsonl``) → real questions asked.
5. **Feedback** (``data/feedback.jsonl``) → thumbs-up answers become gold examples.

Output is JSONL in the OpenAI/HF chat format:
``{"messages": [{"role": "system"|"user"|"assistant", "content": ...}]}``
so it can drive either a hosted fine-tune or a local SFT run.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Iterator, List

from ..config import Settings, get_settings
from ..observability.logging import get_logger
from ..prompts.templates import ANSWER_SYSTEM_PROMPT
from ..rag.chunker import chunk_documents
from ..rag.loader import load_corpus

logger = get_logger(__name__)


def _example(user: str, assistant: str) -> Dict:
    return {
        "messages": [
            {"role": "system", "content": ANSWER_SYSTEM_PROMPT},
            {"role": "user", "content": user},
            {"role": "assistant", "content": assistant},
        ]
    }


def _from_curated() -> Iterator[Dict]:
    from ..eval.testset import GOLDEN_QA

    for item in GOLDEN_QA:
        yield _example(item["question"], item["reference"])


def _from_docs(settings: Settings) -> Iterator[Dict]:
    docs = [d for d in load_corpus(settings) if d.kind == "docs"]
    for chunk in chunk_documents(docs, settings):
        heading = chunk.text.splitlines()[0].lstrip("# ").strip()[:80] or chunk.path
        yield _example(
            f"Explain the '{heading}' section of {chunk.path}.",
            chunk.text.strip(),
        )


def _from_code(settings: Settings) -> Iterator[Dict]:
    docs = [d for d in load_corpus(settings) if d.kind == "code"]
    for doc in docs:
        head = "\n".join(doc.text.splitlines()[:40])
        yield _example(
            f"What is the purpose of `{doc.path}` and what does it contain?",
            f"`{doc.path}` is a {doc.language} module in APIForge Lab. Top of file:\n\n"
            f"```{doc.language}\n{head}\n```",
        )


def _from_logs(settings: Settings) -> Iterator[Dict]:
    path = settings.logs_dir / "interactions.jsonl"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if rec.get("event") == "chat" and rec.get("question") and rec.get("answer_preview"):
            yield _example(rec["question"], rec["answer_preview"])


def _from_feedback(settings: Settings) -> Iterator[Dict]:
    if not settings.feedback_path.exists():
        return
    for line in settings.feedback_path.read_text(encoding="utf-8").splitlines():
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        # Only positively-rated answers become gold training pairs.
        if int(rec.get("rating", 0)) > 0 and rec.get("message") and rec.get("answer"):
            yield _example(rec["message"], rec["answer"])


def iter_examples(settings: Settings | None = None, include_code: bool = True) -> Iterator[Dict]:
    settings = settings or get_settings()
    yield from _from_curated()
    yield from _from_docs(settings)
    if include_code:
        yield from _from_code(settings)
    yield from _from_logs(settings)
    yield from _from_feedback(settings)


def build_dataset(settings: Settings | None = None, include_code: bool = True) -> Path:
    """Write the SFT dataset to ``data/datasets/sft.jsonl`` and return its path."""
    settings = settings or get_settings()
    settings.ensure_dirs()
    out = settings.datasets_dir / "sft.jsonl"
    examples: List[Dict] = list(iter_examples(settings, include_code=include_code))
    with out.open("w", encoding="utf-8") as fh:
        for ex in examples:
            fh.write(json.dumps(ex, ensure_ascii=False) + "\n")
    logger.info("Built SFT dataset with %d examples → %s", len(examples), out)
    return out


if __name__ == "__main__":
    path = build_dataset()
    print(f"✅ Dataset written to {path}")
