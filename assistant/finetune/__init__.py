"""Fine-tuning & continuous-improvement pipeline.

The dataset builder runs offline with zero heavy deps. The training step is a
clearly-marked supervised fine-tuning (SFT) scaffold that only executes when the
optional ``finetune`` extras (transformers/datasets/peft) are installed and
compute is available.
"""

from .dataset import build_dataset, iter_examples
from .feedback import record_feedback

__all__ = ["build_dataset", "iter_examples", "record_feedback"]
