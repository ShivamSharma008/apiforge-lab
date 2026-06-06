"""Pytest suite for the AI Project Assistant.

These tests run **fully offline with zero heavy dependencies** (no LLM keys, no
faiss/sentence-transformers/langgraph/deepeval) by exercising the built-in
fallbacks. They do NOT require a browser or a running server, so they are
independent of the Playwright suite in ``test_apiforge_lab.py``.

Run just these:  ``python -m pytest tests/test_assistant.py -q``
"""

import os
import sys
from pathlib import Path

import pytest

# Ensure the repo root is importable when pytest is invoked from elsewhere.
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


@pytest.fixture(scope="module")
def settings(tmp_path_factory):
    """Isolated settings pointing data/ at a temp dir to avoid clobbering state."""
    data_dir = tmp_path_factory.mktemp("assistant-data")
    os.environ["ASSISTANT_DATA_DIR"] = str(data_dir)
    from assistant.config import get_settings

    get_settings.cache_clear()
    s = get_settings()
    s.ensure_dirs()
    return s


@pytest.fixture(scope="module")
def retriever(settings):
    from assistant.rag import build_index

    return build_index(settings)


# --- Config ---------------------------------------------------------------

def test_settings_defaults(settings):
    assert settings.llm_backend == "stub"
    assert settings.retrieval_k >= 1
    assert settings.index_dir.parent == settings.data_dir


# --- RAG ------------------------------------------------------------------

def test_index_builds_and_persists(retriever, settings):
    assert retriever.size > 0
    assert (settings.index_dir / "store.json").exists()


def test_retrieval_returns_relevant_chunks(retriever):
    ctx = retriever.retrieve("How do I run the Playwright tests?")
    assert not ctx.is_empty
    assert len(ctx.citations()) > 0
    block = ctx.as_prompt_block()
    assert "CONTEXT" in block


def test_retriever_reloads_from_disk(settings):
    from assistant.rag.retriever import load_retriever

    loaded = load_retriever(settings)
    assert loaded is not None
    assert loaded.size > 0


# --- LLM stub -------------------------------------------------------------

def test_stub_llm_is_offline():
    from assistant.llm import get_llm

    llm = get_llm("stub")
    assert llm.is_stub
    out = llm.generate(
        [
            type("M", (), {"role": "user", "content": "CONTEXT: APIForge uses React and Vite."})(),
        ]
    )
    assert "offline" in out.lower() or "APIForge" in out


def test_stub_streaming_yields_chunks():
    from assistant.llm import get_llm
    from assistant.llm.base import LLMMessage

    llm = get_llm("stub")
    chunks = list(llm.stream([LLMMessage(role="user", content="CONTEXT: hello world test")]))
    assert len(chunks) > 1
    assert "".join(chunks)


def test_unknown_backend_falls_back_to_stub():
    from assistant.llm import get_llm

    llm = get_llm("does-not-exist")
    assert llm.is_stub


# --- Memory ---------------------------------------------------------------

def test_session_memory_persists(settings):
    from assistant.memory.session import SessionStore

    store = SessionStore(settings)
    mem = store.get_or_create("unit-sess")
    mem.add_user("hi")
    mem.add_assistant("hello")
    # New store instance should reload from disk.
    reloaded = SessionStore(settings).get_or_create("unit-sess")
    assert len(reloaded.turns) == 2
    assert reloaded.turns[0].content == "hi"


# --- Tools ----------------------------------------------------------------

def test_tools_detect_and_list(settings, retriever):
    from assistant.tools import get_tools

    tools = get_tools(retriever)
    assert "search_codebase" in tools
    modules = tools["list_modules"]()
    assert "src" in modules
    issues = tools["detect_issues"]()
    assert isinstance(issues, str)


def test_read_file_rejects_traversal(settings):
    from assistant.tools.codebase import read_file_slice

    out = read_file_slice("../../../etc/passwd", settings=settings)
    assert "Refused" in out or "not found" in out.lower()


# --- Agent ----------------------------------------------------------------

def test_agent_answers_with_citations(settings, retriever):
    from assistant.agent.graph import ProjectAssistant

    agent = ProjectAssistant(retriever=retriever)
    result = agent.answer("What does the API Playground page do?", session_id="agent-test")
    assert result.answer
    assert result.intent in {"EXPLAIN", "HOWTO", "DEBUG", "OPTIMIZE", "ARCHITECTURE", "GENERAL"}
    assert isinstance(result.citations, list)


def test_agent_streaming(settings, retriever):
    from assistant.agent.graph import ProjectAssistant

    agent = ProjectAssistant(retriever=retriever)
    tokens = list(agent.stream("Explain the project architecture", session_id="agent-stream"))
    assert len(tokens) > 1


def test_intent_classifier():
    from assistant.prompts.templates import classify_intent

    assert classify_intent("How do I install dependencies?") == "HOWTO"
    assert classify_intent("Why does this throw an error?") == "DEBUG"
    assert classify_intent("How can I optimize performance?") == "OPTIMIZE"


# --- API ------------------------------------------------------------------

@pytest.mark.skipif(
    __import__("importlib").util.find_spec("fastapi") is None,
    reason="fastapi not installed",
)
def test_api_endpoints(settings, retriever):
    from fastapi.testclient import TestClient
    from assistant.api.app import create_app

    client = TestClient(create_app())

    health = client.get("/health").json()
    assert health["status"] == "ok"

    chat = client.post("/chat", json={"message": "What is APIForge Lab?", "session_id": "api-t"})
    assert chat.status_code == 200
    assert chat.json()["answer"]

    # SSE streaming.
    with client.stream("POST", "/chat/stream", json={"message": "List the pages", "session_id": "api-s"}) as s:
        events = [line for line in s.iter_lines() if line]
    assert any("session" in e for e in events)
    assert any("done" in e for e in events)


# --- Fine-tuning dataset --------------------------------------------------

def test_dataset_builder(settings):
    from assistant.finetune.dataset import build_dataset

    path = build_dataset(settings)
    assert path.exists()
    lines = path.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) > 0
    import json

    rec = json.loads(lines[0])
    assert rec["messages"][0]["role"] == "system"


# --- Evaluation -----------------------------------------------------------

def test_eval_runs_offline(settings, retriever):
    from assistant.eval.run import evaluate

    report = evaluate(use_deepeval=False)
    assert report.n == 6
    assert 0.0 <= report.pass_rate <= 1.0
    assert report.mode == "offline-lexical"
