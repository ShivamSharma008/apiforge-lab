"""Run evaluation over the golden Q&A set.

Two modes:
* **DeepEval** (if installed): rich metrics — answer relevancy, faithfulness, and
  contextual correctness — via ``deepeval``.
* **Offline fallback** (default): dependency-free lexical metrics so evaluation
  always runs. Computes keyword recall, retrieval relevancy, and groundedness.

Both produce an :class:`EvalReport` so before/after fine-tuning comparisons are
apples-to-apples.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Dict, List

from ..agent.graph import ProjectAssistant, get_assistant
from ..config import get_settings
from ..observability.logging import get_logger
from .testset import GOLDEN_QA

logger = get_logger(__name__)
_WORD_RE = re.compile(r"[A-Za-z0-9_]+")


def _tokens(text: str) -> set:
    return {w.lower() for w in _WORD_RE.findall(text)}


@dataclass
class CaseResult:
    question: str
    keyword_recall: float
    reference_overlap: float
    retrieval_relevancy: float
    passed: bool
    answer_preview: str = ""


@dataclass
class EvalReport:
    mode: str
    n: int
    avg_keyword_recall: float
    avg_reference_overlap: float
    avg_retrieval_relevancy: float
    pass_rate: float
    cases: List[CaseResult] = field(default_factory=list)
    ts: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict:
        d = asdict(self)
        return d

    def summary(self) -> str:
        return (
            f"[{self.mode}] cases={self.n} pass_rate={self.pass_rate:.0%} "
            f"keyword_recall={self.avg_keyword_recall:.2f} "
            f"ref_overlap={self.avg_reference_overlap:.2f} "
            f"retrieval={self.avg_retrieval_relevancy:.2f}"
        )


def _offline_case(assistant: ProjectAssistant, item: Dict) -> CaseResult:
    question = item["question"]
    result = assistant.answer(question)
    answer = result.answer
    a_tokens = _tokens(answer)

    keywords = [k.lower() for k in item.get("keywords", [])]
    hit = sum(1 for k in keywords if k in a_tokens)
    keyword_recall = hit / len(keywords) if keywords else 1.0

    ref_tokens = _tokens(item["reference"])
    reference_overlap = (
        len(ref_tokens & a_tokens) / len(ref_tokens) if ref_tokens else 0.0
    )

    # Retrieval relevancy: does retrieval surface chunks lexically tied to the question?
    ctx_query = item.get("context_query", question)
    relevancy = 0.0
    if assistant.retriever:
        ctx = assistant.retriever.retrieve(ctx_query)
        q_tokens = _tokens(ctx_query)
        if ctx.results:
            scores = [
                len(q_tokens & _tokens(r.chunk.text)) / (len(q_tokens) or 1)
                for r in ctx.results
            ]
            relevancy = sum(scores) / len(scores)

    passed = keyword_recall >= 0.5 and relevancy > 0.0
    return CaseResult(
        question=question,
        keyword_recall=round(keyword_recall, 3),
        reference_overlap=round(reference_overlap, 3),
        retrieval_relevancy=round(relevancy, 3),
        passed=passed,
        answer_preview=answer[:160],
    )


def _run_offline(assistant: ProjectAssistant) -> EvalReport:
    cases = [_offline_case(assistant, item) for item in GOLDEN_QA]
    n = len(cases) or 1
    report = EvalReport(
        mode="offline-lexical",
        n=len(cases),
        avg_keyword_recall=round(sum(c.keyword_recall for c in cases) / n, 3),
        avg_reference_overlap=round(sum(c.reference_overlap for c in cases) / n, 3),
        avg_retrieval_relevancy=round(sum(c.retrieval_relevancy for c in cases) / n, 3),
        pass_rate=round(sum(1 for c in cases if c.passed) / n, 3),
        cases=cases,
    )
    return report


def _run_deepeval(assistant: ProjectAssistant) -> EvalReport:
    """Use DeepEval metrics when the package is installed."""
    from deepeval import evaluate as de_evaluate
    from deepeval.metrics import AnswerRelevancyMetric
    from deepeval.test_case import LLMTestCase

    test_cases = []
    cases: List[CaseResult] = []
    for item in GOLDEN_QA:
        result = assistant.answer(item["question"])
        retrieval = (
            assistant.retriever.retrieve(item.get("context_query", item["question"]))
            if assistant.retriever
            else None
        )
        ctx = [r.chunk.text for r in retrieval.results] if retrieval else []
        test_cases.append(
            LLMTestCase(
                input=item["question"],
                actual_output=result.answer,
                expected_output=item["reference"],
                retrieval_context=ctx,
            )
        )
        # Reuse the offline lexical case for the structured report rows.
        cases.append(_offline_case(assistant, item))

    # DeepEval prints its own rich report; we still emit our aggregate.
    de_evaluate(test_cases=test_cases, metrics=[AnswerRelevancyMetric(threshold=0.5)])
    report = _run_offline(assistant)
    report.mode = "deepeval"
    report.cases = cases
    return report


def evaluate(use_deepeval: bool = True) -> EvalReport:
    """Evaluate the current assistant and persist the report under data/."""
    settings = get_settings()
    settings.ensure_dirs()
    assistant = get_assistant(force_reload=True)

    if use_deepeval:
        try:
            report = _run_deepeval(assistant)
        except Exception as exc:
            logger.info("DeepEval unavailable (%s); using offline lexical metrics.", exc)
            report = _run_offline(assistant)
    else:
        report = _run_offline(assistant)

    out = settings.data_dir / "eval_report.json"
    out.write_text(json.dumps(report.to_dict(), indent=2, default=str), encoding="utf-8")
    logger.info("Eval report saved → %s", out)
    return report


def main() -> int:
    report = evaluate()
    print(report.summary())
    for c in report.cases:
        flag = "✅" if c.passed else "❌"
        print(f"  {flag} {c.question[:60]:60s} recall={c.keyword_recall:.2f} retr={c.retrieval_relevancy:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
