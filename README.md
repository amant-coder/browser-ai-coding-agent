# 🤖 Browser AI Coding Agent

A fully browser-based AI coding agent powered by **Google Gemini Pro** — no server required! Write, run, and debug code using natural language, entirely in your browser.

> Inspired by Emergent.sh — but **free**, **open**, and **yours**.

---

## ✨ Features

- 🧠 **Gemini Pro AI** — Powered by Google's Gemini Pro API
- 📝 **Monaco Editor** — VS Code-like editor in the browser
- 🐍 **Pyodide** — Run Python code directly in the browser (WASM)
- 🟨 **WebContainers** — Run Node.js/npm projects in the browser
- 🗂️ **OPFS File System** — Persistent local file storage in the browser
- 🔁 **Agent Loop** — Plan → Act → Observe → Repeat
- 🖥️ **xterm.js Terminal** — Real terminal emulator in the browser
- 🎨 **Tailwind CSS + shadcn/ui** — Beautiful, modern UI
- 🌐 **100% Free** — No server, no cost, no data uploaded

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Editor | Monaco Editor |
| Terminal | xterm.js |
| LLM | Google Gemini Pro API |
| Agent | LangChain.js + Vercel AI SDK |
| Python Sandbox | Pyodide (WASM) |
| JS Sandbox | WebContainers |
| Storage | OPFS + IndexedDB |
| Git | isomorphic-git |
| Deploy | Vercel / GitHub Pages |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/amant-coder/browser-ai-coding-agent.git
cd browser-ai-coding-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Gemini Pro API Key

Create a `.env` file in the root:

```env
VITE_GEMINI_API_KEY=your_gemini_pro_api_key_here
```

> Get your free Gemini Pro API key at: https://aistudio.google.com/app/apikey

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
browser-ai-coding-agent/
├── public/
├── src/
│   ├── components/
│   │   ├── Editor/          # Monaco Editor component
│   │   ├── Terminal/        # xterm.js terminal component
│   │   ├── Chat/            # AI chat panel
│   │   ├── FileTree/        # File explorer sidebar
│   │   └── Layout/          # Main layout wrapper
│   ├── agent/
│   │   ├── gemini.ts        # Gemini Pro API connector
│   │   ├── tools.ts         # Agent tools (read, write, run)
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
  🧠 PLAN  (Gemini Pro breaks task into steps)
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
| `search_web` | Search for docs/answers |
| `install_package` | pip/npm install packages |

---

## 🌐 Deploy for Free

### Vercel
```bash
npx vercel --prod
```

### GitHub Pages
Push to main branch — GitHub Actions will auto-deploy.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙏 Credits

Built with ❤️ using:
- [Google Gemini Pro](https://aistudio.google.com)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Pyodide](https://pyodide.org/)
- [LangChain.js](https://js.langchain.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [xterm.js](https://xtermjs.org/)