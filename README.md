# 🔥 APIForge Lab

### Interactive API, Database & Workflow Testing Playground

> **A microservices-based platform where users can learn, build, and test APIs, databases, workflows, Kafka events, and MQTT integrations — all in one place.**

> **Made by Senior SDET SHIVAM SHARMA** ❤️

---

## 🚀 Features

| Module | Description |
|--------|-------------|
| **API Playground** | Create, test, and simulate REST APIs with real-time response validation |
| **Database Sandbox** | Practice SQL & NoSQL with PostgreSQL, MySQL, MongoDB sandboxes |
| **Workflow Engine** | Design and execute BPMN workflows with Camunda-style orchestration |
| **Event Simulator** | Publish and consume Kafka & MQTT events in real-time |
| **Dashboard** | Live metrics, charts, system health monitoring |
| **Learning Labs** | Interactive tutorials from beginner to advanced |

## 🏗️ Architecture

```
Frontend (React + Vite)
   │
   ▼
API Gateway
   │
   ├── Auth Service (PostgreSQL)
   ├── Project Service (PostgreSQL)
   ├── API Sandbox Service (MongoDB/PostgreSQL)
   ├── DB Sandbox Service (Multi-DB)
   ├── Test Runner Service (Redis/PostgreSQL)
   ├── Workflow Service (Camunda)
   ├── Event Service (Kafka/MQTT)
   ├── Learning Service (PostgreSQL)
   └── Audit Service (PostgreSQL)
```

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **Charts**: Recharts

## 📦 Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd apiforge-lab

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deploy to GitHub Pages

```bash
npm run build
# Deploy the `dist` folder to GitHub Pages
```

## 📁 Project Structure

```
apiforge-lab/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── ApiPlayground.jsx
│   │   ├── DbSandbox.jsx
│   │   ├── Workflows.jsx
│   │   ├── Events.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## 📸 Pages

- **/** — Landing page with hero, features, architecture, and tech stack
- **/api-playground** — Interactive API testing with mock endpoints
- **/db-sandbox** — SQL query editor with simulated database
- **/workflows** — BPMN-style workflow visualizer with execution
- **/events** — Kafka & MQTT event publisher and live stream
- **/dashboard** — Metrics, charts, and system health

---

**© 2024-2026 APIForge Lab | Made by Senior SDET SHIVAM SHARMA**
