"""Optional real-provider backend built on LangChain chat models.

This module is imported only when a non-stub backend is selected, so LangChain
and provider SDKs remain optional dependencies. Set the relevant API key in the
environment (e.g. ``OPENAI_API_KEY``) and ``ASSISTANT_LLM_BACKEND=openai``.
"""

from __future__ import annotations

from typing import Iterator, List

from ..config import Settings
from .base import BaseLLM, LLMMessage


class LangChainLLM(BaseLLM):
    """Adapter from our :class:`BaseLLM` interface to LangChain chat models."""

    name = "langchain"

    def __init__(self, backend: str, settings: Settings) -> None:
        self.name = backend
        self.settings = settings
        self._chat = self._init_chat(backend, settings)

    def _init_chat(self, backend: str, settings: Settings):
        if backend == "openai":
            from langchain_openai import ChatOpenAI

            return ChatOpenAI(model=settings.llm_model, temperature=settings.llm_temperature)
        if backend == "azure":
            from langchain_openai import AzureChatOpenAI

            return AzureChatOpenAI(temperature=settings.llm_temperature)
        if backend == "anthropic":
            from langchain_anthropic import ChatAnthropic

            return ChatAnthropic(model=settings.llm_model, temperature=settings.llm_temperature)
        raise ValueError(f"Unknown LangChain backend: {backend!r}")

    @staticmethod
    def _to_lc(messages: List[LLMMessage]):
        from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

        mapping = {"system": SystemMessage, "assistant": AIMessage, "user": HumanMessage}
        return [mapping.get(m.role, HumanMessage)(content=m.content) for m in messages]

    def generate(self, messages: List[LLMMessage], **kwargs) -> str:
        result = self._chat.invoke(self._to_lc(messages))
        return getattr(result, "content", str(result))

    def stream(self, messages: List[LLMMessage], **kwargs) -> Iterator[str]:
        for chunk in self._chat.stream(self._to_lc(messages)):
            text = getattr(chunk, "content", "")
            if text:
                yield text
