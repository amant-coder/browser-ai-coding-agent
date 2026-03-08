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
- 🔐 **Auth / User Accounts** — Email/password registration + login, JWT tokens, role-based access (FREE/PRO/ADMIN)
- 🚀 **Live Preview + Deploy** — Instant preview with Blob URL sharing, one-click deploy to Vercel or GitHub Pages
- 💳 **Credit-Based Usage** — Per-action credit deduction, balance dashboard, admin panel, Bucket4j rate limiting

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
| Security | Spring Security + JWT (jjwt) |
| Database | PostgreSQL + Spring Data JPA + Flyway |
| Cache | Redis (Lettuce) |
| Rate Limiting | Bucket4j |
| Python Sandbox | Pyodide (WASM) |
| JS Sandbox | WebContainers |
| Storage | OPFS + IndexedDB |
| Git | isomorphic-git |
| Deploy | Vercel API / GitHub Pages API |
| Charts | Recharts |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- **Java** 17+ and **Maven** 3.9+
- **PostgreSQL** (for auth, credits, deployments)
- **Redis** (for session caching and rate limiting)

---

### 1. Clone the repo

```bash
git clone https://github.com/amant-coder/browser-ai-coding-agent.git
cd browser-ai-coding-agent
```

---

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

**Required variables:**

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini Pro API key |
| `DATABASE_URL` | PostgreSQL JDBC URL (e.g. `jdbc:postgresql://localhost:5432/browserai`) |
| `DATABASE_USERNAME` | PostgreSQL username |
| `DATABASE_PASSWORD` | PostgreSQL password |
| `REDIS_HOST` | Redis host (default: `localhost`) |
| `REDIS_PORT` | Redis port (default: `6379`) |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRATION_MS` | JWT expiry in ms (default: `86400000` = 24h) |

**Optional variables:**

| Variable | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel API token for one-click deploy |
| `GITHUB_TOKEN` | GitHub personal access token for Pages deploy |
| `STRIPE_SECRET_KEY` | Stripe secret key (future monetisation) |

---

### 3. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE browserai;
```

Flyway migrations run automatically on startup and create all required tables.

---

### 4. Start the Spring Boot backend

```bash
cd backend
GEMINI_API_KEY=your_key \
  DATABASE_URL=jdbc:postgresql://localhost:5432/browserai \
  DATABASE_USERNAME=postgres \
  DATABASE_PASSWORD=your_password \
  REDIS_HOST=localhost \
  JWT_SECRET=your-secret \
  mvn spring-boot:run
```

The backend starts on **http://localhost:8080** and exposes:

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login, returns JWT + user | Public |
| `POST` | `/api/auth/refresh` | Refresh JWT token | Bearer |
| `GET`  | `/api/auth/me` | Get current user | Bearer |
| `POST` | `/api/auth/logout` | Logout (client-side) | Bearer |
| `POST` | `/api/chat` | Proxy chat to Gemini | Open |
| `GET`  | `/api/search?q=` | Web search via DuckDuckGo | Open |
| `POST` | `/api/deploy/vercel` | Deploy project to Vercel | Optional Bearer |
| `POST` | `/api/deploy/github-pages` | Deploy to GitHub Pages | Optional Bearer |
| `GET`  | `/api/deploy/status/:id` | Get deployment status | Open |
| `GET`  | `/api/credits/balance` | Get credit balance | Bearer |
| `POST` | `/api/credits/deduct` | Deduct credits for an action | Bearer |
| `GET`  | `/api/credits/usage` | Paginated usage history | Bearer |
| `GET`  | `/api/credits/admin/users` | All users + balances | Admin |
| `POST` | `/api/credits/admin/grant` | Grant credits to a user | Admin |

---

### 5. Configure and start the frontend

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
│   │   ├── AgentApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java        # JWT filter chain + CORS
│   │   │   ├── JwtAuthFilter.java         # JWT request filter
│   │   │   ├── RedisConfig.java           # Redis connection factory
│   │   │   ├── RateLimitConfig.java       # Bucket4j rate-limit buckets
│   │   │   ├── WebMvcConfig.java          # Interceptor registry
│   │   │   ├── CorsConfig.java            # (delegated to SecurityConfig)
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── controller/
│   │   │   ├── AgentController.java       # POST /api/chat
│   │   │   ├── SearchController.java      # GET  /api/search
│   │   │   ├── AuthController.java        # /api/auth/*
│   │   │   ├── DeployController.java      # /api/deploy/*
│   │   │   └── CreditController.java      # /api/credits/*
│   │   ├── service/
│   │   │   ├── GeminiService.java
│   │   │   ├── SearchService.java
│   │   │   ├── JwtService.java
│   │   │   ├── UserService.java
│   │   │   ├── CreditService.java
│   │   │   ├── VercelDeployService.java
│   │   │   └── GitHubPagesService.java
│   │   ├── model/
│   │   │   ├── User.java / UserRole.java
│   │   │   ├── Deployment.java
│   │   │   ├── UsageEvent.java
│   │   │   ├── CreditLedger.java
│   │   │   └── CreditCosts.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── DeploymentRepository.java
│   │   │   ├── UsageEventRepository.java
│   │   │   └── CreditLedgerRepository.java
│   │   └── interceptor/
│   │       └── RateLimitInterceptor.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/
│   │       ├── V1__create_users_table.sql
│   │       ├── V2__create_deployments_table.sql
│   │       ├── V3__create_usage_events_table.sql
│   │       ├── V4__create_credit_ledger_table.sql
│   │       └── V5__seed_default_credits.sql
│   └── pom.xml
├── src/                            # ← React + TypeScript frontend
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginPage.tsx          # Sign in / sign up form
│   │   │   ├── UserAvatar.tsx         # Top-right avatar dropdown
│   │   │   └── ProtectedRoute.tsx     # Auth-gated route wrapper
│   │   ├── Credits/
│   │   │   ├── CreditBadge.tsx        # Balance badge in top nav
│   │   │   ├── UsageDashboard.tsx     # Charts + usage table
│   │   │   └── AdminPanel.tsx         # Admin-only user management
│   │   ├── Preview/
│   │   │   ├── index.tsx              # iframe preview
│   │   │   ├── PreviewToolbar.tsx     # URL bar + share + deploy
│   │   │   └── DeployModal.tsx        # Vercel / GitHub Pages deploy dialog
│   │   ├── Editor/
│   │   ├── Terminal/
│   │   ├── Chat/
│   │   ├── FileTree/
│   │   └── Layout/
│   ├── store/
│   │   ├── index.ts                   # Main Zustand store
│   │   ├── authStore.ts               # Auth state (user, token, actions)
│   │   └── creditsStore.ts            # Credits state (balance, history)
│   ├── hooks/
│   │   ├── useAgent.ts
│   │   ├── useAuth.ts                 # Auth hook
│   │   ├── useCredits.ts              # Credits hook with cost constants
│   │   ├── usePreview.ts              # Preview URL management
│   │   └── useDeploy.ts               # Deploy + status polling
│   ├── agent/
│   │   ├── gemini.ts
│   │   ├── tools.ts
│   │   └── loop.ts                    # Credit deduction integrated
│   ├── sandbox/
│   ├── filesystem/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
└── vite.config.ts
```

---

## 🔐 Auth Flow

```
User submits email/password
        │
        ▼
POST /api/auth/register OR /api/auth/login
        │
        ▼
Spring Boot validates + returns { token, user }
        │
        ▼
Frontend stores token in Zustand (persisted to localStorage)
        │
        ▼
All subsequent requests include Authorization: Bearer <token>
        │
        ▼
JwtAuthFilter validates token + sets SecurityContext
```

New users start with **FREE** role and **100 credits** (seeded by Flyway V5).

---

## 💳 Credit System

Each agent action consumes credits:

| Action | Cost |
|---|---|
| PLAN step | 2 credits |
| ACT step | 3 credits |
| OBSERVE step | 1 credit |
| WEB_SEARCH | 2 credits |
| DEPLOY | 10 credits |

**Rate limits** (via Bucket4j):

| Role | Limit |
|---|---|
| FREE | 10 agent actions / hour |
| PRO | 200 agent actions / hour |
| ADMIN | Unlimited |

---

## 🤖 How the Agent Works

```
User types a request
        │
        ▼
  🧠 PLAN  (Gemini Pro, via Spring Boot) → deducts 2 credits
        │
        ▼
  🔧 ACT   (write_file, run_code, etc.) → deducts 3 credits
        │
        ▼
  👁️ OBSERVE (read result)              → deducts 1 credit
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
| `search_web` | Search for docs/answers (2 credits) |
| `install_package` | pip/npm install packages |

---

## 🌐 Deploy for Free

### Backend (any JVM host — e.g. Railway, Render, Fly.io)

```bash
cd backend
mvn package -DskipTests
java -jar target/agent-backend-0.1.0.jar
```

Set all required env vars on your host.

### Frontend — Vercel

```bash
npx vercel --prod
```

Set `VITE_BACKEND_URL` to your deployed backend URL.

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
- [Recharts](https://recharts.org/)
- [Bucket4j](https://bucket4j.com/)

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