"""Interactive streaming terminal chatbot.

A clean, dependency-free REPL over the :class:`ProjectAssistant`. Maintains a
single session for the lifetime of the process so conversation memory works.

Commands:
    /reset    start a fresh session
    /index    rebuild the RAG index
    /help     show commands
    /exit     quit
"""

from __future__ import annotations

import sys
import uuid

from ..agent.graph import get_assistant
from ..memory.session import get_session_store
from ..rag.retriever import build_index

BANNER = """\
==============================================================
  APIForge Lab — Project Assistant (offline-capable chatbot)
  Ask anything about this codebase. Type /help for commands.
==============================================================
"""


def main() -> int:
    print(BANNER)
    assistant = get_assistant()
    if not assistant.has_index:
        print("⚠️  No index found — building it now...\n")
        build_index()
        assistant = get_assistant(force_reload=True)

    print(f"Backend: {assistant.llm.name} | Indexed chunks: "
          f"{assistant.retriever.size if assistant.retriever else 0}\n")

    session_id = uuid.uuid4().hex[:12]
    while True:
        try:
            question = input("you › ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nbye 👋")
            return 0

        if not question:
            continue
        if question in {"/exit", "/quit"}:
            print("bye 👋")
            return 0
        if question == "/help":
            print("Commands: /reset  /index  /help  /exit")
            continue
        if question == "/reset":
            get_session_store().reset(session_id)
            session_id = uuid.uuid4().hex[:12]
            print("🔄 Session reset.")
            continue
        if question == "/index":
            build_index()
            assistant = get_assistant(force_reload=True)
            print("✅ Index rebuilt.")
            continue

        print("bot › ", end="", flush=True)
        for token in assistant.stream(question, session_id=session_id):
            sys.stdout.write(token)
            sys.stdout.flush()
        print("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
