"""FastAPI application factory: REST + Server-Sent-Events streaming chat.

Endpoints
---------
* ``GET  /health``            — liveness + index/backend status
* ``POST /chat``              — full (non-streaming) answer as JSON
* ``POST /chat/stream``       — token streamed answer via SSE
* ``POST /feedback``          — capture thumbs up/down for the feedback loop
* ``POST /reset``             — clear a session's memory

Run with: ``python -m assistant.cli.serve`` or ``uvicorn assistant.api.app:app``.
"""

import json
from typing import Iterator

from ..agent.graph import get_assistant
from ..config import get_settings
from ..observability.logging import get_logger, log_interaction
from ..memory.session import get_session_store
from .schemas import ChatRequest, ChatResponse, FeedbackRequest

logger = get_logger(__name__)


def create_app():
    """Build and return the FastAPI app (requires fastapi)."""
    from fastapi import FastAPI, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse, StreamingResponse

    settings = get_settings()
    app = FastAPI(title="APIForge Lab — Project Assistant", version="1.0.0")

    # Allow the React dev server + preview to call the API from the browser.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict:
        assistant = get_assistant()
        return {
            "status": "ok",
            "backend": assistant.llm.name,
            "has_index": assistant.has_index,
            "indexed_chunks": assistant.retriever.size if assistant.retriever else 0,
            "langgraph": assistant._graph is not None,
        }

    @app.post("/chat")
    async def chat(request: Request) -> JSONResponse:
        body = ChatRequest.from_dict(await request.json())
        if not body.message:
            return JSONResponse({"error": "message is required"}, status_code=400)
        result = get_assistant().answer(body.message, session_id=body.session_id)
        resp = ChatResponse(
            answer=result.answer,
            session_id=result.session_id,
            intent=result.intent,
            citations=result.citations,
            backend=result.backend,
        )
        return JSONResponse(resp.to_dict())

    @app.post("/chat/stream")
    async def chat_stream(request: Request) -> StreamingResponse:
        body = ChatRequest.from_dict(await request.json())
        assistant = get_assistant()

        def event_stream() -> Iterator[str]:
            # Resolve the session id up-front so the client can persist it.
            memory = get_session_store().get_or_create(body.session_id)
            yield _sse({"type": "session", "session_id": memory.session_id})
            try:
                for token in assistant.stream(body.message, session_id=memory.session_id):
                    yield _sse({"type": "token", "content": token})
                yield _sse({"type": "done", "session_id": memory.session_id})
            except Exception as exc:  # pragma: no cover - defensive
                logger.exception("stream failed")
                yield _sse({"type": "error", "message": str(exc)})

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    @app.post("/feedback")
    async def feedback(request: Request) -> JSONResponse:
        fb = FeedbackRequest.from_dict(await request.json())
        _append_feedback(fb)
        return JSONResponse({"status": "recorded"})

    @app.post("/reset")
    async def reset(request: Request) -> JSONResponse:
        data = await request.json()
        session_id = data.get("session_id")
        if session_id:
            get_session_store().reset(session_id)
        return JSONResponse({"status": "reset", "session_id": session_id})

    logger.info("FastAPI app ready (backend=%s).", get_assistant().llm.name)
    return app


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _append_feedback(fb: FeedbackRequest) -> None:
    settings = get_settings()
    settings.ensure_dirs()
    with settings.feedback_path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(fb.__dict__, ensure_ascii=False) + "\n")
    log_interaction("feedback", fb.__dict__)


# Importable ASGI app for ``uvicorn assistant.api.app:app`` (lazy to keep imports cheap).
try:  # pragma: no cover - only succeeds when fastapi is installed
    app = create_app()
except Exception:  # noqa: BLE001
    app = None
