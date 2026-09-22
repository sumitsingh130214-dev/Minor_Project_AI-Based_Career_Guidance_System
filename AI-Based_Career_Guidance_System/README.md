# CareerAI Pro

> Enterprise-Grade AI-Powered Career Guidance, Psychometric Assessment, and Learning Roadmap Hub.

Designed and developed by **Ansar**, **CareerAI Pro** is a fully production-ready full-stack platform designed to guide students and professionals into customized, high-yield career paths through psychometric algorithms, interactive mock interviews, resume analyzer scoring, and visual milestone roadmaps.

---

## 🎯 Core Capabilities
- **Aptitude & Cognitive Assessment**: Custom-timed modules calculating MBTI types, Big Five traits, and logical reasoning indexes.
- **Dynamic Learning Roadmaps**: 90-day linear milestone structures generated on-the-fly, backed by a persistent progress tracker with interactive task checkmarks.
- **AI Chat Counselor & Voice Synthesis**: Fluent bilingual chat supporting text-to-speech audio rendering.
- **Mock Interview Simulator**: Dynamic live interview questions with AI scoring feedback.
- **Job & Scholar matching**: Deep job market indexing paired with local scholarship guides.

---

## 🏗️ Architecture & Technologies
- **Frontend**: Single-Page Application (SPA) powered by **React 19**, **Vite 6**, **Tailwind CSS 4**, and **Lucide Icons**.
- **Backend**: **Node.js** with **Express.js** acting as an asset server and secure API gateway proxy.
- **AI Integration**: Lazy-initialized **Google GenAI SDK** (`@google/genai`) wrapping Gemini models server-side for maximum API key security.
- **Storage**: Lightweight, persistent file-based JSON store (`db_store.json`) that manages ACID-safe read/writes.

---

## ⚡ Setup & Local Execution

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm (v9.x+)

### Installation
1. Clone your repository.
2. Initialize environment variables from example:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` to configure your `GEMINI_API_KEY`.
4. Install package dependencies:
   ```bash
   npm install
   ```

### Execution Commands

#### Development Mode
Runs the local Vite bundler and backend livereload:
```bash
npm run dev
```

#### Production Compilation & Bundling
Performs compilation of the frontend SPA alongside bundling of the custom server.ts to a single `.cjs` module inside `dist/`:
```bash
npm run build
```

#### Production Execution
Launches the standalone bundled service:
```bash
npm start
```

---

## 🐳 Containerization with Docker

This application includes a production-tuned multi-stage `Dockerfile` keeping runner containers extremely slim (~100MB).

### Single Container Build
```bash
docker build -t careerai-pro .
docker run -p 3000:3000 -e GEMINI_API_KEY="your-api-key" careerai-pro
```

### Docker Compose Orchestration
```bash
docker-compose up --build
```

---

## 🌐 Dynamic Port Resolution
To ensure deployability across server providers (Heroku, Render, AWS Elastic Beanstalk, Railway, etc.), the application uses a dynamic, non-blocking port lookup utility:
1. It reads the standard `$PORT` environment variable.
2. If `$PORT` is already in use by another local process, it automatically increments and tests consecutive ports until a free socket is bound.
3. This completely prevents startup collision errors on shared hosts.

---

## 📦 Multi-Platform Deployment Guides

- **Render**: Connect your GitHub repository to Render and choose the **Web Service** blueprint. Render will automatically read `render.yaml`.
- **Vercel**: Deploy instantly using `vercel.json` included in this repo.
- **Netlify**: Perfect for front-end SPA static asset deployment using `netlify.toml`.
- **Railway**: Deploys the service automatically by scanning the `Dockerfile`.

---

### Credits
- **Designed & Developed by Ansar**
- **Developed by Ansar**
- **© 2026 Ansar. All Rights Reserved.**
