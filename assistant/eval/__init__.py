"""Evaluation harness (DeepEval + offline fallback)."""

from .testset import GOLDEN_QA
from .run import evaluate, EvalReport

__all__ = ["GOLDEN_QA", "evaluate", "EvalReport"]
