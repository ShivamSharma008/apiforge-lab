"""Abstract LLM interface shared by every backend."""

from __future__ import annotations

import abc
from dataclasses import dataclass
from typing import Iterable, Iterator, List


@dataclass
class LLMMessage:
    """A single chat message in the standard role/content shape."""

    role: str  # "system" | "user" | "assistant"
    content: str


class BaseLLM(abc.ABC):
    """Provider-agnostic chat LLM.

    Implementations must provide :meth:`generate`. Streaming has a default
    implementation that yields the full response once; backends that natively
    stream should override :meth:`stream` for true token-by-token output.
    """

    name: str = "base"

    @abc.abstractmethod
    def generate(self, messages: List[LLMMessage], **kwargs) -> str:
        """Return a complete response for the given conversation."""

    def stream(self, messages: List[LLMMessage], **kwargs) -> Iterator[str]:
        """Yield response chunks. Default: chunk the full response into words."""
        full = self.generate(messages, **kwargs)
        for token in _word_chunks(full):
            yield token

    @property
    def is_stub(self) -> bool:
        return False


def _word_chunks(text: str) -> Iterable[str]:
    """Split text into streamable chunks while preserving whitespace."""
    buffer = ""
    for char in text:
        buffer += char
        if char in " \n":
            yield buffer
            buffer = ""
    if buffer:
        yield buffer
