"""Curated golden Q&A about the APIForge Lab project.

Used for (a) DeepEval-based response evaluation and (b) seeding the fine-tuning
dataset. Keep answers grounded in the actual repository so they double as
high-signal supervised examples.
"""

from __future__ import annotations

from typing import Dict, List

GOLDEN_QA: List[Dict[str, object]] = [
    {
        "question": "What is APIForge Lab and what is it built with?",
        "reference": (
            "APIForge Lab is an interactive playground for testing APIs, databases, "
            "workflows, and Kafka/MQTT events. The frontend is a React 19 + Vite "
            "single-page app styled with Tailwind CSS v4, using Framer Motion for "
            "animations and Recharts for charts. It ships a Python/Playwright e2e suite."
        ),
        "keywords": ["react", "vite", "tailwind", "playground", "api"],
        "context_query": "What is APIForge Lab tech stack",
    },
    {
        "question": "Which pages/routes does the app expose?",
        "reference": (
            "Routes include / (Landing), /api-playground, /db-sandbox, /workflows, "
            "/events, /dashboard, /docs, /architecture, and /api-reference, wired up "
            "in src/App.jsx using react-router-dom with a HashRouter."
        ),
        "keywords": ["api-playground", "dashboard", "events", "router", "route"],
        "context_query": "App routes react-router pages",
    },
    {
        "question": "How do I run the Playwright tests locally?",
        "reference": (
            "Build and preview the app, then run pytest against the preview URL: "
            "npm install; npm run build; npm run preview -- --host 127.0.0.1 --port 4173; "
            "python -m pytest tests -q --base-url http://127.0.0.1:4173/apiforge-lab/."
        ),
        "keywords": ["pytest", "playwright", "preview", "npm", "tests"],
        "context_query": "run playwright tests pytest preview",
    },
    {
        "question": "What does the API Playground page do?",
        "reference": (
            "The API Playground (src/pages/ApiPlayground.jsx) lets users compose and "
            "send mock REST requests and inspect simulated responses, using predefined "
            "MOCK_RESPONSES keyed by method+path such as 'GET /api/users'."
        ),
        "keywords": ["mock", "request", "response", "rest", "playground"],
        "context_query": "API Playground mock responses send request",
    },
    {
        "question": "How is the frontend project structured?",
        "reference": (
            "Source lives under src/: components/ (Navbar, Footer, chat/), pages/ (one "
            "component per route), lib/ (assistant API client), hooks/, data/, plus "
            "App.jsx, main.jsx, and index.css. Build config is in vite.config.js with "
            "base '/apiforge-lab/'."
        ),
        "keywords": ["src", "components", "pages", "vite", "structure"],
        "context_query": "project structure src components pages",
    },
    {
        "question": "How does the real-time chatbot get its answers?",
        "reference": (
            "The React ChatWidget streams from the Python assistant API over SSE "
            "(/chat/stream). The assistant runs a LangGraph workflow "
            "(route -> retrieve -> reason -> critique) using RAG retrieval over the "
            "indexed codebase, with session-based memory."
        ),
        "keywords": ["sse", "rag", "retrieve", "langgraph", "stream"],
        "context_query": "chatbot assistant RAG streaming agent",
    },
]
