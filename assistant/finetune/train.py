"""Supervised fine-tuning (SFT) / instruction-tuning scaffold.

⚠️  CLEARLY-MARKED SCAFFOLD — does not run by default.

This module wires up a standard LoRA/PEFT supervised fine-tuning loop over the
dataset produced by :func:`assistant.finetune.dataset.build_dataset`. It only
executes when the optional ``finetune`` extras are installed
(``pip install -e ".[finetune]"``) and a base model + compute are available.

The goal is to specialise a small open base model on APIForge-Lab-specific Q&A so
the assistant's responses improve over time. After training, point the assistant
at the tuned weights via a custom backend.

Usage::

    python -m assistant.finetune.dataset                 # 1. build dataset
    python -m assistant.finetune.train --base <model>    # 2. run SFT (needs GPU)
    deepeval / python -m assistant.eval.run              # 3. measure improvement
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from ..config import get_settings
from ..observability.logging import get_logger

logger = get_logger(__name__)

DEFAULT_BASE_MODEL = "google/flan-t5-small"


def _require_finetune_deps() -> None:
    missing = []
    for mod in ("transformers", "datasets"):
        try:
            __import__(mod)
        except ImportError:
            missing.append(mod)
    if missing:
        raise SystemExit(
            "Fine-tuning extras not installed: "
            + ", ".join(missing)
            + '\nInstall with:  pip install -e ".[finetune]"'
        )


def run_sft(base_model: str, dataset_path: Path, output_dir: Path, epochs: int = 3) -> Path:
    """Run a LoRA SFT pass. Requires the ``finetune`` extras + compute."""
    _require_finetune_deps()

    # Imports are local so the module is importable without the heavy deps.
    from datasets import load_dataset
    from transformers import (
        AutoModelForSeq2SeqLM,
        AutoTokenizer,
        DataCollatorForSeq2Seq,
        Seq2SeqTrainer,
        Seq2SeqTrainingArguments,
    )

    logger.info("Loading base model %s ...", base_model)
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    model = AutoModelForSeq2SeqLM.from_pretrained(base_model)

    # Optionally wrap with PEFT/LoRA when available (keeps tuning lightweight).
    try:
        from peft import LoraConfig, get_peft_model

        model = get_peft_model(
            model,
            LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05, task_type="SEQ_2_SEQ_LM"),
        )
        logger.info("LoRA adapters attached.")
    except ImportError:
        logger.info("peft not installed; running full fine-tune.")

    def _format(example):
        msgs = example["messages"]
        prompt = "\n".join(f"{m['role']}: {m['content']}" for m in msgs if m["role"] != "assistant")
        target = next(m["content"] for m in msgs if m["role"] == "assistant")
        model_inputs = tokenizer(prompt, truncation=True, max_length=1024)
        model_inputs["labels"] = tokenizer(target, truncation=True, max_length=512)["input_ids"]
        return model_inputs

    ds = load_dataset("json", data_files=str(dataset_path), split="train").map(_format)

    args = Seq2SeqTrainingArguments(
        output_dir=str(output_dir),
        num_train_epochs=epochs,
        per_device_train_batch_size=4,
        learning_rate=2e-4,
        logging_steps=10,
        save_strategy="epoch",
    )
    trainer = Seq2SeqTrainer(
        model=model,
        args=args,
        train_dataset=ds,
        data_collator=DataCollatorForSeq2Seq(tokenizer, model=model),
    )
    logger.info("Starting SFT for %d epochs on %d examples ...", epochs, len(ds))
    trainer.train()
    trainer.save_model(str(output_dir))
    logger.info("✅ Fine-tuned model saved → %s", output_dir)
    return output_dir


def main(argv=None) -> int:
    settings = get_settings()
    parser = argparse.ArgumentParser(description="SFT scaffold for the Project Assistant.")
    parser.add_argument("--base", default=DEFAULT_BASE_MODEL, help="Base model id.")
    parser.add_argument("--dataset", default=str(settings.datasets_dir / "sft.jsonl"))
    parser.add_argument("--out", default=str(settings.data_dir / "models" / "assistant-sft"))
    parser.add_argument("--epochs", type=int, default=3)
    ns = parser.parse_args(argv)

    dataset_path = Path(ns.dataset)
    if not dataset_path.exists():
        print(
            f"Dataset not found at {dataset_path}.\n"
            "Build it first:  python -m assistant.finetune.dataset",
            file=sys.stderr,
        )
        return 1

    run_sft(ns.base, dataset_path, Path(ns.out), epochs=ns.epochs)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
