"""Launch the FastAPI assistant server with uvicorn."""

from __future__ import annotations

import sys

from ..config import get_settings


def main() -> int:
    settings = get_settings()
    try:
        import uvicorn
    except ImportError:
        print(
            "uvicorn/fastapi are not installed. Install API extras:\n"
            "    pip install -r requirements-ai.txt\n"
            "or:  pip install fastapi uvicorn",
            file=sys.stderr,
        )
        return 1

    print(f"🚀 Serving assistant on http://{settings.api_host}:{settings.api_port}")
    uvicorn.run(
        "assistant.api.app:app",
        host=settings.api_host,
        port=settings.api_port,
        log_level=settings.log_level.lower(),
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
