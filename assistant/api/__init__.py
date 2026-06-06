"""FastAPI app exposing the assistant over REST with SSE streaming."""

from .app import create_app

__all__ = ["create_app"]
