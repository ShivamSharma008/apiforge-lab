<div align="center">

# 🔥 APIForge Lab

### Interactive API, Database & Workflow Testing Playground — Now with AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2ea44f?style=for-the-badge&logo=github)](https://shivamsharma008.github.io/apiforge-lab/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://langchain.com)
[![Tests](https://img.shields.io/badge/Tests-140%20passing-success?style=flat-square&logo=pytest)](tests/)

> **A production-grade microservices playground** where developers learn, build, and test APIs, databases, BPMN workflows, Kafka events, and MQTT integrations — powered by an **AI Project Assistant** that answers any question about the codebase in real time.

**Made by Senior SDET SHIVAM SHARMA** ❤️

[Live Demo](https://shivamsharma008.github.io/apiforge-lab/) · [AI Assistant Docs](#-ai-project-assistant) · [Getting Started](#-getting-started) · [Architecture](#-system-architecture)

</div>

---

## ✨ Why APIForge Lab?

Most API testing tools are either too simple or too complex. APIForge Lab is the **sweet spot** — a beautiful, interactive playground that lets you **learn by doing**, with an AI assistant that explains everything as you go.

| Quality | Description |
|---------|-------------|
| 🎯 **Production-Grade Code** | Clean, modular React 19 + Python architecture with separated concerns, reusable hooks, and extracted data layers |
| 🧠 **AI-Powered Intelligence** | Built-in RAG + LangGraph agent that deeply understands every line of the project |
| ⚡ **Blazing Performance** | Vite 8 HMR, optimized builds, lazy loading, efficient animations |
| 🧪 **Thoroughly Tested** | 140+ automated tests — 124 Playwright e2e + 16 AI assistant unit tests |
| 🔌 **Zero-Config Offline** | AI subsystem works with zero API keys, zero downloads — pure-Python fallbacks for everything |
| 🎨 **Beautiful Dark UI** | Custom dark theme with glass-morphism, gradient accents, smooth Framer Motion animations |
| 📱 **Fully Responsive** | Mobile-first design with collapsible nav, adaptive layouts, touch-friendly interactions |
| 🔄 **CI/CD Automated** | GitHub Actions auto-deploys to GitHub Pages on every push to `main` |

---

## 🚀 Features at a Glance

### Platform Modules

| Module | Description | Highlights |
|--------|-------------|------------|
| 🔗 **API Playground** | Create, test, and simulate REST APIs | Real-time mock responses, request history, copy-to-clipboard, method coloring |
| 🗄️ **Database Sandbox** | Practice SQL & NoSQL queries interactively | PostgreSQL/MySQL/MongoDB simulation, schema exploration, result formatting |
| ⚙️ **Workflow Engine** | Design and execute BPMN-style workflows | Step-by-step visual execution, Camunda-style orchestration |
| 📡 **Event Simulator** | Publish & consume Kafka + MQTT events | Real-time live event stream, payload builder |
| 📊 **Dashboard** | Live system metrics and health monitoring | Animated counters, Recharts visualizations, service health cards |
| 📚 **Documentation** | Interactive docs, architecture diagrams, API reference | In-app learning, endpoint catalog with code examples |
| 🤖 **AI Chat Widget** | Ask anything about the project in real time | Streaming responses, session memory, suggested questions |

### AI Project Assistant

| Capability | What It Does |
|------------|-------------|
| 🧠 **Agentic RAG** | Multi-step reasoning workflow: `route → retrieve → reason → self-critique` |
| 💬 **3 Interfaces** | Terminal CLI + FastAPI REST (SSE streaming) + React chat widget |
| 🔍 **Semantic Search** | Vector search over 586+ indexed code chunks with source citations |
| 💾 **Session Memory** | Persistent conversational context for multi-turn follow-ups |
| 📈 **Evaluation** | Automated quality metrics over golden Q&A with before/after tracking |
| 🔧 **Fine-Tuning Pipeline** | Dataset builder + LoRA SFT scaffold for continuous improvement |
| 👁️ **Full Observability** | Structured JSONL audit trail + optional LangSmith tracing |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19 + Vite 8)          │
│  ┌──────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │  Pages   │ │  Components  │ │  Chat Widget (SSE) │   │
│  │  9 routes│ │  Navbar/Footer│ │  Streaming + Memory│   │
│  └──────────┘ └──────────────┘ └────────┬──────────┘   │
│       │              │                   │              │
│  ┌────┴──────────────┴───────────────────┘              │
│  │  src/hooks/ · src/data/ · src/lib/api.js             │
│  └──────────────────────────────────────────────────────┘
│                          │ SSE (Server-Sent Events)
│                          ▼
│  ┌──────────────────────────────────────────────────────┐
│  │              ASSISTANT (Python · FastAPI)             │
│  │                                                       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  │  LLM/    │  │  RAG/    │  │  Agent (LangGraph)│   │
│  │  │ Pluggable│  │ Loader → │  │ Route → Retrieve  │   │
│  │  │ Backends │  │ Chunker →│  │ → Reason → Critique│  │
│  │  │ + Stub   │  │ Embed → │  │ + Linear Fallback │   │
│  │  └──────────┘  │ Store → │  └──────────────────┘   │
│  │                │ Retrieve │                          │
│  │  ┌──────────┐  └──────────┘  ┌──────────────────┐   │
│  │  │ Memory/  │                │  Tools (LangChain)│   │
│  │  │ Sessions │                │ search · read ·   │   │
│  │  │ Persist  │                │ modules · issues  │   │
│  │  └──────────┘                └──────────────────┘   │
│  │                                                       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  │ Observe/ │  │ Finetune/│  │  Eval (DeepEval)  │   │
│  │  │ LangSmith│  │ Dataset  │  │  Golden Q&A       │   │
│  │  │ + Logging│  │ + SFT    │  │  Metrics + Report │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │
│  └──────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19 | Component-based UI with hooks and functional patterns |
| **Vite** | 8 | Lightning-fast bundler with HMR (builds in <1s) |
| **Tailwind CSS** | v4 | Utility-first styling with custom dark theme |
| **Framer Motion** | Latest | Physics-based animations, page transitions, micro-interactions |
| **Recharts** | Latest | Composable charting for the Dashboard |
| **React Router** | v7 | Hash-based routing with animated route transitions |
| **Lucide React** | Latest | Beautiful, consistent icon system |

### AI / Backend
| Technology | Purpose | Required? |
|-----------|---------|-----------|
| **Python 3.11+** | AI assistant runtime | ✅ Core |
| **FastAPI** | REST API with SSE streaming | Recommended |
| **LangChain** | LLM orchestration, tools, chains | Optional |
| **LangGraph** | Multi-step agent state machine | Optional (linear fallback) |
| **LangSmith** | Distributed tracing and observability | Optional (local logs fallback) |
| **DeepEval** | Automated evaluation metrics | Optional (lexical fallback) |
| **FAISS** | Fast vector similarity search | Optional (cosine fallback) |
| **Sentence Transformers** | High-quality local embeddings | Optional (hashing fallback) |

### Testing & CI/CD
| Tool | Purpose |
|------|---------|
| **Playwright** | 124 browser-based e2e tests across all pages |
| **Pytest** | 16 assistant unit/integration tests (fully offline) |
| **ESLint** | Code quality enforcement (0 errors) |
| **GitHub Actions** | Automated build + deploy to GitHub Pages on push |

---

## 📦 Getting Started

### Prerequisites

- **Node.js 20+** and **npm** (for the frontend)
- **Python 3.11+** (for the AI assistant — optional if you only want the frontend)

### Frontend Only (2 commands)

```bash
git clone https://github.com/ShivamSharma008/apiforge-lab.git
cd apiforge-lab
npm install
npm run dev
# → Open http://localhost:5173/apiforge-lab/
```

### Full Stack with AI Assistant (5 commands)

```bash
git clone https://github.com/ShivamSharma008/apiforge-lab.git
cd apiforge-lab

# Frontend
npm install

# AI Assistant (installs FastAPI, uvicorn, httpx — no API keys needed)
pip install -r requirements-ai.txt

# Build the RAG index from the codebase (586+ chunks, ~1 second)
python -m assistant.cli.index

# Start both servers
python -m assistant.cli.serve   # API on http://127.0.0.1:8000
npm run dev                     # Frontend on http://localhost:5173/apiforge-lab/
```

Click the **🤖 chat button** (bottom-right) and start asking questions.

---

## ✅ Testing

### Playwright E2E Suite (124 tests)

```bash
npm run build
npx vite preview --host 127.0.0.1 --port 4173
python -m pytest tests/test_apiforge_lab.py -q --base-url http://127.0.0.1:4173/apiforge-lab/
```

Covers: navigation, page rendering, API playground requests, database queries,
workflow execution, event publishing, dashboard health, footer links, responsive
layout, and accessibility smoke tests.

### AI Assistant Tests (16 tests — fully offline)

```bash
python -m pytest tests/test_assistant.py -q
```

Covers: config defaults, RAG indexing + persistence + retrieval, LLM stub +
streaming + fallback, session memory, codebase tools + path traversal guards,
agent pipeline + intent routing, FastAPI endpoints + SSE streaming, dataset
builder, and evaluation harness.

### Lint

```bash
npm run lint   # 0 errors
```

---

## 🧭 Recommended Learning Path

1. 📊 Open **Dashboard** — understand platform health and system entry points
2. 🔗 Use **API Playground** — send a mock REST request and inspect the response
3. 🗄️ Use **Database Sandbox** — run SQL shortcuts and explore schemas
4. 📡 Use **Events** — publish Kafka/MQTT payloads and watch the live stream
5. ⚙️ Use **Workflows** — execute a BPMN-style process step by step
6. 📚 Review **Docs**, **Architecture**, and **API Reference** for deeper understanding
7. 🤖 Open the **AI Chat Widget** — ask the assistant to explain anything you just saw

---

## 🤖 AI Project Assistant — Deep Dive

### How It Works

1. **Indexing** — The codebase (39 source files) is loaded, chunked into 586 overlapping
   segments with structural awareness (headings for markdown, blank-line blocks for code),
   embedded into vectors, and persisted in a FAISS-backed (or pure-Python) vector store.

2. **Retrieval** — When you ask a question, it's embedded and the top-k most semantically
   similar chunks are retrieved with source citations (`file:line`).

3. **Routing** — A lightweight rule-based classifier detects intent (EXPLAIN, DEBUG,
   HOWTO, ARCHITECTURE, OPTIMIZE, GENERAL) to steer the prompt.

4. **Reasoning** — The LLM (or offline stub) generates an answer grounded in the
   retrieved context, following intent-specific guidance.

5. **Self-Critique** — The agent checks whether the answer actually cites retrieved
   sources and flags ungrounded responses.

6. **Streaming** — Tokens are streamed to the client in real time over SSE so the user
   sees the answer being composed word-by-word.

### Zero-Dependency Design Philosophy

The assistant is engineered to **always work** — no "install X first" barriers:

| Capability | Default (works out of the box) | Upgraded (with optional packages) |
|------------|-------------------------------|----------------------------------|
| **Embeddings** | Hashing bag-of-words (512d, pure Python) | `sentence-transformers` (384d, semantic) |
| **Vector Search** | Exact cosine similarity | `faiss-cpu` (HNSW approximate) |
| **Agent Graph** | Linear pipeline: route→retrieve→reason→critique | `langgraph` (full state machine) |
| **LLM Generation** | Extractive stub (grounded, cited, clearly marked) | Any LangChain-supported provider |
| **Tracing** | Local structured logs (`data/logs/`) | `langsmith` (distributed tracing UI) |
| **Evaluation** | Lexical metrics (keyword recall, overlap, retrieval relevancy) | `deepeval` (semantic metrics) |

### Three Chat Interfaces

| Interface | Command | Description |
|-----------|---------|-------------|
| 🖥️ **Terminal CLI** | `python -m assistant.cli.chat` | Streaming REPL with `/reset`, `/index`, `/help` commands |
| 🌐 **REST API** | `python -m assistant.cli.serve` | FastAPI with SSE streaming, session management, feedback endpoint |
| 💬 **React Widget** | Click 🤖 in the app | Floating chat panel with suggested questions, streaming, auto-reconnect |

### REST API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Backend status, index stats, graph availability |
| `POST` | `/chat` | Full JSON response (blocking) |
| `POST` | `/chat/stream` | Token-by-token SSE stream |
| `POST` | `/feedback` | 👍/👎 rating for continuous improvement |
| `POST` | `/reset` | Clear a session's conversation memory |

### Pluggable LLM Backend

Swap to any real provider with **one env var** — no code changes:

```bash
# OpenAI
export ASSISTANT_LLM_BACKEND=openai
export ASSISTANT_LLM_MODEL=gpt-4o-mini
export OPENAI_API_KEY=sk-...

# Azure OpenAI
export ASSISTANT_LLM_BACKEND=azure

# Anthropic Claude
export ASSISTANT_LLM_BACKEND=anthropic
export ASSISTANT_LLM_MODEL=claude-sonnet-4-20250514

pip install langchain langchain-openai langgraph   # install the provider SDK
```

If initialization fails for any reason, it **automatically falls back** to the offline stub.

### Evaluation & Continuous Improvement

```bash
# Evaluate response quality against 6 golden Q&A cases
python -m assistant.eval.run

# Build an SFT dataset from docs, code, interaction logs, and thumbs-up feedback
python -m assistant.finetune.dataset   # → data/datasets/sft.jsonl (84+ examples)

# Run LoRA supervised fine-tuning (requires finetune extras + GPU)
python -m assistant.finetune.train --base google/flan-t5-small
```

The feedback loop: user 👍 an answer → it's promoted into the training set →
next fine-tune pass → improved model → better answers → repeat.

---

## 📁 Project Structure

```
apiforge-lab/
├── public/
│   └── favicon.svg
│
├── src/                              # 🎨 React Frontend
│   ├── components/
│   │   ├── Navbar.jsx                # responsive nav with animated mobile menu
│   │   ├── Footer.jsx                # footer with platform + connect links
│   │   └── chat/
│   │       └── ChatWidget.jsx        # real-time streaming AI chat widget
│   ├── pages/                        # one component per route (9 pages)
│   │   ├── Landing.jsx               # hero, features grid, architecture, tech stack
│   │   ├── ApiPlayground.jsx         # interactive mock API tester
│   │   ├── DbSandbox.jsx             # SQL/NoSQL query sandbox
│   │   ├── Workflows.jsx             # BPMN workflow visualizer
│   │   ├── Events.jsx                # Kafka/MQTT event simulator
│   │   ├── Dashboard.jsx             # live metrics, charts, health cards
│   │   ├── Documentation.jsx         # interactive learning docs
│   │   ├── Architecture.jsx          # system architecture explorer
│   │   └── ApiReference.jsx          # endpoint catalog with copy-paste examples
│   ├── data/
│   │   └── apiPlaygroundData.js      # extracted mock data (clean separation)
│   ├── hooks/
│   │   ├── useClipboard.js           # shared copy-to-clipboard hook
│   │   └── index.js                  # barrel export
│   ├── lib/
│   │   └── api.js                    # SSE streaming client for the assistant
│   ├── App.jsx                       # root: HashRouter + AnimatePresence + ChatWidget
│   ├── main.jsx                      # React 19 createRoot entry point
│   └── index.css                     # Tailwind v4 theme (dark, glass-morphism)
│
├── assistant/                        # 🤖 AI Project Assistant (Python)
│   ├── __init__.py                   # package entry + version
│   ├── config.py                     # env-driven settings + feature flags
│   ├── llm/                          # pluggable LLM backends
│   │   ├── base.py                   # abstract BaseLLM interface
│   │   ├── stub.py                   # offline extractive stub (default)
│   │   ├── langchain_backend.py      # LangChain adapter (OpenAI/Azure/Anthropic)
│   │   └── factory.py                # backend factory + auto-fallback
│   ├── rag/                          # Retrieval-Augmented Generation pipeline
│   │   ├── loader.py                 # walks repo, collects 39+ source documents
│   │   ├── chunker.py                # structural chunking with overlap
│   │   ├── embeddings.py             # sentence-transformers + hashing fallback
│   │   ├── store.py                  # FAISS + pure-Python vector store
│   │   └── retriever.py              # top-k semantic retrieval + persistence
│   ├── agent/                        # intelligent reasoning agent
│   │   ├── state.py                  # typed agent state (TypedDict)
│   │   ├── nodes.py                  # route / retrieve / reason / critique nodes
│   │   └── graph.py                  # LangGraph workflow + linear fallback
│   ├── memory/
│   │   └── session.py                # per-session conversational memory (persisted)
│   ├── tools/                        # LangChain-compatible codebase tools
│   │   ├── codebase.py               # search, read, list_modules, detect_issues
│   │   └── registry.py               # tool registry + LangChain adapter
│   ├── prompts/
│   │   └── templates.py              # system prompts, intent routing, message assembly
│   ├── observability/
│   │   ├── logging.py                # structured logging + JSONL audit trail
│   │   └── tracing.py                # LangSmith wrapper (no-op if unconfigured)
│   ├── api/
│   │   ├── schemas.py                # request/response shapes (no pydantic needed)
│   │   └── app.py                    # FastAPI app: /health, /chat, /chat/stream, etc.
│   ├── cli/
│   │   ├── index.py                  # build/refresh RAG index
│   │   ├── serve.py                  # launch FastAPI with uvicorn
│   │   └── chat.py                   # interactive streaming terminal chatbot
│   ├── finetune/
│   │   ├── dataset.py                # SFT dataset builder (docs/code/logs/feedback)
│   │   ├── train.py                  # LoRA SFT scaffold (clearly marked, needs GPU)
│   │   └── feedback.py               # feedback capture for improvement loop
│   └── eval/
│       ├── testset.py                # 6 curated golden Q&A about the project
│       └── run.py                    # DeepEval harness + offline lexical fallback
│
├── tests/
│   ├── test_apiforge_lab.py          # 124 Playwright e2e tests
│   └── test_assistant.py             # 16 AI assistant unit/integration tests
│
├── .github/workflows/deploy.yml      # CI/CD: auto-deploy to GitHub Pages
├── requirements-ai.txt               # Python deps (all optional, commented guide)
├── pyproject.toml                     # Python package config + CLI entry points
├── vite.config.js                     # Vite + React + Tailwind plugin config
├── eslint.config.js                   # ESLint rules
├── package.json                       # npm scripts + frontend dependencies
└── index.html                         # SPA shell
```

---

## 📸 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero section, feature cards, architecture overview, tech stack |
| `/api-playground` | API Playground | Interactive REST API tester with mock endpoints and history |
| `/db-sandbox` | Database Sandbox | SQL/NoSQL query editor with schema exploration |
| `/workflows` | Workflows | BPMN-style workflow visualizer with step-by-step execution |
| `/events` | Events | Kafka & MQTT event publisher with live event stream |
| `/dashboard` | Dashboard | Real-time metrics, charts, and service health monitoring |
| `/docs` | Documentation | Interactive learning docs from beginner to advanced |
| `/architecture` | Architecture | System architecture diagrams and explanations |
| `/api-reference` | API Reference | Complete endpoint catalog with request/response examples |

---

## 🌐 Deployment

### Automatic (GitHub Actions)

Every push to `main` triggers the CI/CD pipeline:

1. **Checkout** → **Install deps** (`npm ci`) → **Build** (`npm run build`) → **Deploy** `dist/` to GitHub Pages

Live at: **https://shivamsharma008.github.io/apiforge-lab/**

### Manual

```bash
npm run build
# Deploy the dist/ folder to any static host
```

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_ASSISTANT_API` | `http://127.0.0.1:8000` | Assistant API URL for the React chat widget |
| `ASSISTANT_LLM_BACKEND` | `stub` | LLM backend: `stub`, `openai`, `azure`, `anthropic` |
| `ASSISTANT_LLM_MODEL` | `stub-rag-1` | Model name (e.g. `gpt-4o-mini`) |
| `ASSISTANT_API_PORT` | `8000` | FastAPI server port |
| `ASSISTANT_RETRIEVAL_K` | `5` | Number of chunks retrieved per query |
| `ASSISTANT_CHUNK_SIZE` | `900` | Characters per chunk |
| `ASSISTANT_LOG_LEVEL` | `INFO` | Logging verbosity |
| `LANGCHAIN_TRACING_V2` | `false` | Enable LangSmith tracing |
| `LANGCHAIN_API_KEY` | — | LangSmith API key (when tracing enabled) |

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| Frontend Pages | 9 interactive routes |
| React Components | 12+ (pages, layout, chat widget) |
| Automated Tests | **140 total** (124 e2e + 16 assistant) |
| AI Index Size | 586 chunks from 39 source files |
| ESLint Errors | **0** |
| Build Time | <1 second (Vite 8) |
| Bundle Size | ~275 KB gzipped |
| Python Modules | 13 packages, 30+ modules |
| SFT Dataset | 84+ training examples (auto-generated) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

<div align="center">

**© 2024-2026 APIForge Lab | Made with ❤️ by Senior SDET SHIVAM SHARMA**

[⬆ Back to Top](#-apiforge-lab)

</div>
