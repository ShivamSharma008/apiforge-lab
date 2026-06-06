"""Pluggable LLM backends.

The :class:`~assistant.llm.base.BaseLLM` interface decouples the agent from any
specific provider. The default :class:`~assistant.llm.stub.StubLLM` is fully
offline and requires no API key.
"""

from .base import BaseLLM, LLMMessage
from .factory import get_llm

__all__ = ["BaseLLM", "LLMMessage", "get_llm"]
