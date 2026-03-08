# 🤖 Browser AI Coding Agent

A browser-based AI coding agent powered by **Google Gemini Pro** — featuring a **Java Spring Boot** backend and a **React + TypeScript** frontend. Write, run, and debug code using natural language.

> Inspired by Emergent.sh — but **free**, **open**, and **yours**.

---

## ✨ Features

- 🧠 **Gemini Pro AI** — Powered by Google's Gemini Pro API (routed securely through the Spring Boot backend)
- 📝 **Monaco Editor** — VS Code-like editor in the browser
- 🐍 **Pyodide** — Run Python code directly in the browser (WASM)
- 🟨 **WebContainers** — Run Node.js/npm projects in the browser
- 🗂️ **OPFS File System** — Persistent local file storage in the browser
- 🔁 **Agent Loop** — Plan → Act → Observe → Repeat
- 🖥️ **xterm.js Terminal** — Real terminal emulator in the browser
- 🎨 **Tailwind CSS + shadcn/ui** — Beautiful, modern UI
- 🔒 **Secure API key handling** — Gemini key stays server-side, never exposed to the browser

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Editor | Monaco Editor |
| Terminal | xterm.js |
| LLM | Google Gemini Pro API |
| Agent | Custom agent loop (plan → act → observe) |
| **Backend** | **Java 17 + Spring Boot 3** |
| Python Sandbox | Pyodide (WASM) |
| JS Sandbox | WebContainers |
| Storage | OPFS + IndexedDB |
| Git | isomorphic-git |
| Deploy | Vercel / GitHub Pages (frontend) + any JVM host (backend) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- **Java** 17+ and **Maven** 3.9+

---

### 1. Clone the repo

```bash
git clone https://github.com/amant-coder/browser-ai-coding-agent.git
cd browser-ai-coding-agent
```

---

### 2. Start the Spring Boot backend

```bash
cd backend
GEMINI_API_KEY=your_gemini_pro_api_key_here mvn spring-boot:run
```

The backend starts on **http://localhost:8080** and exposes:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chat` | Proxy multi-turn conversation to Gemini |
| `GET`  | `/api/search?q=` | Proxy web search via DuckDuckGo |

> **Tip:** You can also set `GEMINI_API_KEY` as a persistent environment variable
> or provide it in `backend/src/main/resources/application.properties` for local
> development (do **not** commit real keys).

---

### 3. Configure the frontend

Create a `.env` file in the project root (copy from `.env.example`):

```env
VITE_BACKEND_URL=http://localhost:8080
```

> The frontend no longer calls the Gemini API directly, so `VITE_GEMINI_API_KEY`
> is not required when the backend is running.

---

### 4. Install frontend dependencies and start the dev server

```bash
cd ..          # back to project root
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
browser-ai-coding-agent/
├── backend/                        # ← Java Spring Boot backend
│   ├── src/main/java/com/browserai/agent/
│   │   ├── AgentApplication.java   # Spring Boot entry point
│   │   ├── config/
│   │   │   ├── CorsConfig.java     # CORS configuration
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── controller/
│   │   │   ├── AgentController.java   # POST /api/chat
│   │   │   └── SearchController.java  # GET  /api/search
│   │   ├── service/
│   │   │   ├── GeminiService.java     # Gemini API proxy
│   │   │   └── SearchService.java     # DuckDuckGo proxy
│   │   └── model/
│   │       ├── ChatRequest.java
│   │       ├── ChatResponse.java
│   │       └── SearchResponse.java
│   ├── src/main/resources/application.properties
│   └── pom.xml
├── public/
├── src/                            # ← React + TypeScript frontend
│   ├── components/
│   │   ├── Editor/          # Monaco Editor component
│   │   ├── Terminal/        # xterm.js terminal component
│   │   ├── Chat/            # AI chat panel
│   │   ├── FileTree/        # File explorer sidebar
│   │   └── Layout/          # Main layout wrapper
│   ├── agent/
│   │   ├── gemini.ts        # Backend API client (replaces direct Gemini calls)
│   │   ├── tools.ts         # Agent tools (read, write, run, search)
│   │   └── loop.ts          # Agent plan→act→observe loop
│   ├── sandbox/
│   │   ├── pyodide.ts       # Python WASM sandbox
│   │   └── webcontainer.ts  # Node.js sandbox
│   ├── filesystem/
│   │   └── opfs.ts          # OPFS file system manager
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🤖 How the Agent Works

```
User types a request
        │
        ▼
  🧠 PLAN  (Gemini Pro, via Spring Boot backend)
        │
        ▼
  🔧 ACT   (Agent picks a tool: write_file, run_code, search)
        │
        ▼
  👁️ OBSERVE (Agent reads output/result)
        │
        ▼
  🔁 REPEAT until task is done
        │
        ▼
  ✅ RESPOND to user
```

---

## 🧰 Agent Tools

| Tool | Description |
|---|---|
| `write_file` | Create or edit a file |
| `read_file` | Read file contents |
| `run_python` | Execute Python via Pyodide |
| `run_javascript` | Execute JS via WebContainers |
| `list_files` | Show file tree |
| `search_web` | Search for docs/answers (via Spring Boot → DuckDuckGo) |
| `install_package` | pip/npm install packages |

---

## 🌐 Deploy for Free

### Backend (any JVM host — e.g. Railway, Render, Fly.io)

```bash
cd backend
mvn package -DskipTests
java -jar target/agent-backend-0.1.0.jar
```

Set `GEMINI_API_KEY` and `CORS_ALLOWED_ORIGINS` as environment variables on your host.

### Frontend — Vercel

```bash
npx vercel --prod
```

Set `VITE_BACKEND_URL` to your deployed backend URL in the Vercel dashboard.

### Frontend — GitHub Pages

Push to main branch — GitHub Actions will auto-deploy.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙏 Credits

Built with ❤️ using:
- [Google Gemini Pro](https://aistudio.google.com)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Pyodide](https://pyodide.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [xterm.js](https://xtermjs.org/)