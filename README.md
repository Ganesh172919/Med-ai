# ✦ ChatSphere

> **AI-native multi-provider chat platform** — Solo AI conversations, collaborative group rooms, real-time messaging, persistent memory, and a multi-provider AI gateway.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-2D2D2D?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, data flows, and diagrams |
| [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) | Key technical decisions and rationale |
| [ROADMAP.md](./ROADMAP.md) | Feature plans and milestones |
| [API.md](./API.md) | Complete REST API and Socket.IO documentation |
| [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) | Frontend architecture, patterns, and styling |
| [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) | MongoDB optimization, indexing, and scaling |
| [SECURITY.md](./SECURITY.md) | Security architecture and threat model |
| [PERFORMANCE.md](./PERFORMANCE.md) | Performance optimization strategies |
| [CODE_REVIEW.md](./CODE_REVIEW.md) | Code review checklist and standards |
| [KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md) | Keyboard shortcut reference |
| [FAQ.md](./FAQ.md) | Frequently asked questions |
| [PROJECT_MAP.md](./PROJECT_MAP.md) | Visual file index and purpose guide |
| [LEARNING_GUIDE.md](./LEARNING_GUIDE.md) | Visual guide for understanding the codebase |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute to the project |
| [TESTING.md](./TESTING.md) | Testing guide and best practices |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and their solutions |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and roadmap |

---

## 🚀 Features

### Solo AI Chat
- Dedicated Solo Chat page (`/chat`) with a three-panel layout: conversation sidebar, main chat area, and a conversation insights panel.
- **Separate API Provider & Model selection** — Users pick an API provider (e.g. Together AI, Groq, Gemini, OpenRouter) and then choose a model from that provider independently. Both selections persist across sessions via localStorage.
- Bottom-docked composer with inline provider/model selectors, file attachment support, grammar suggestions, and AI-powered smart replies.
- Conversation history sidebar with real-time timestamps and delete support.
- Conversation insights panel (summarize, extract tasks, extract decisions) powered by the selected AI model.
- Full message metadata display including provider, model, token usage, processing time, and fallback indicators.

### Room / Group Chat
- Create and join chat rooms with real-time messaging via Socket.IO.
- AI can be triggered in rooms using `@ai` mentions (opt-in interaction model).
- Room insights, pinned messages, polls, member management, typing indicators, and read receipts.
- Report and moderation system for room messages.

### Dashboard
- Overview of recent conversations, rooms, and activity analytics.
- Analytics charts for usage metrics.

### Search
- Full-text search across conversations, rooms, and messages.

### User Management
- JWT access/refresh token authentication with Google OAuth support.
- User profile management, settings, and theme customization.
- Admin dashboard for platform management.
- Password reset flow (forgot password, reset via email).

### AI Capabilities
- **Multi-provider AI gateway** — Supports OpenRouter, Gemini Direct, xAI Grok Direct, Groq Direct, Together AI, and Hugging Face.
- Model discovery via `GET /api/ai/models` with a client-facing `auto` option.
- Smart replies — AI-generated reply suggestions based on conversation context.
- Grammar checking and correction suggestions.
- Sentiment analysis on messages.
- AI memory — extraction, retrieval, and governance across conversations.
- Conversation insights — summaries, task extraction, decision extraction.
- File analysis — Upload images, PDFs, code, and text files for AI analysis.

### UI / UX
- Dark-themed, glassmorphic design with neon-purple/blue accents.
- Responsive layout with collapsible sidebars.
- Smooth animations via Framer Motion.
- Compact, docked composer with inline model controls.
- **Syntax-highlighted code blocks** with 100+ language support via react-syntax-highlighter.
- User avatar badges and online status indicators.
- Clean navbar with profile dropdown menu.
- **Accessibility**: Skip-to-content, ARIA live regions, keyboard navigation, prefers-reduced-motion support.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ChatSphere Client                       │
│  React 18 + TypeScript + Vite + Zustand + Framer Motion     │
├─────────────────────────────────────────────────────────────┤
│  Pages: Dashboard, SoloChat, GroupChat, Rooms, Projects,    │
│  MemoryCenter, Search, Settings, Admin, Profile, Export      │
├─────────────────────────────────────────────────────────────┤
│  State: Zustand (auth, chat, rooms) + Context (theme)       │
├─────────────────────────────────────────────────────────────┤
│  API: Axios (REST) + Socket.IO (Real-time)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP + WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│                    ChatSphere Server                          │
│  Express + Socket.IO + MongoDB + Passport                    │
├─────────────────────────────────────────────────────────────┤
│  Routes: auth, chat, rooms, users, search, ai, projects,    │
│  settings, polls, groups, moderation, export, admin, memory  │
├─────────────────────────────────────────────────────────────┤
│  Socket Handlers (modular):                                  │
│  socket/handlers/{room, typing, message, reaction, ai, pin}  │
├─────────────────────────────────────────────────────────────┤
│  Services: gemini (multi-provider AI), memory, auth, email   │
├─────────────────────────────────────────────────────────────┤
│  Middleware: auth, security, rateLimit, compression, validate │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       MongoDB                                │
│  Models: User, Message, Room, Conversation, MemoryEntry,    │
│  Project, Poll, Report, RefreshToken, ConversationInsight   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript 5.6, Vite 6, Zustand 5, Framer Motion |
| **Styling** | Tailwind CSS 3.4, custom navy/neon palette, glassmorphism |
| **Backend** | Express 4, Socket.IO 4, Mongoose 8 |
| **Database** | MongoDB |
| **AI** | Multi-provider routing (OpenRouter, Gemini, Grok, Groq, Together, HuggingFace) |
| **Auth** | JWT access/refresh tokens + Google OAuth 2.0 |
| **Testing** | Vitest (frontend), Jest (backend) |
| **Linting** | ESLint with TypeScript and React plugins |

---

## 📦 Project Structure

```
chatsphere/
├── backend/
│   ├── index.js              # Server entry point (Express + Socket.IO setup)
│   ├── socket/               # Modular Socket.IO handlers
│   │   ├── index.js          # Connection lifecycle + handler wiring
│   │   ├── state.js          # Shared in-memory state
│   │   ├── helpers.js        # Utility functions
│   │   ├── formatMessage.js  # Message DTO formatter
│   │   └── handlers/
│   │       ├── room.js       # join_room, leave_room
│   │       ├── typing.js     # typing_start, typing_stop
│   │       ├── message.js    # send, reply, edit, delete, mark_read
│   │       ├── reaction.js   # add_reaction
│   │       ├── ai.js         # trigger_ai
│   │       └── pin.js        # pin_message, unpin_message
│   ├── routes/               # Express API routes
│   ├── models/               # Mongoose schemas
│   ├── services/             # Business logic (AI, auth, memory, etc.)
│   ├── middleware/            # Express + Socket.IO middleware
│   ├── helpers/              # Validation and logging utilities
│   ├── utils/                # Token generation
│   ├── config/               # DB and Passport configuration
│   └── __tests__/            # Backend tests
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Root component with routing
│   │   ├── main.tsx          # Entry point (StrictMode enabled)
│   │   ├── pages/            # Route-level components (lazy-loaded)
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Zustand state stores
│   │   ├── context/          # React context (theme)
│   │   ├── api/              # API client modules
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript type definitions
│   └── ...
│
└── *.md                      # Documentation files
```

---

## 🏁 Local Setup

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **API key** for at least one AI provider

### Backend

1. Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

2. Configure environment variables:

```env
MONGO_URI=mongodb://localhost:27017/chatsphere
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-secret-here
CLIENT_URL=http://localhost:5173
PORT=3000

# At least one AI provider key is required
OPENROUTER_API_KEY=your-key-here
# OR
GEMINI_API_KEY=your-key-here
# OR
GROQ_API_KEY=your-key-here
```

3. Install and run:

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Open

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

---

## ✅ Verification

```bash
# Build frontend
cd frontend
npm run build

# Syntax-check all backend files
cd ../backend
node -e "require('fs').readdirSync('.').filter(f=>f.endsWith('.js')).forEach(f=>{try{require('./'+f)}catch(e){if(e.code!=='MODULE_NOT_FOUND')console.log(f,e.message)}})"

# Run tests
cd frontend && npm test
cd ../backend && npm test
```

---

## 🔒 Security

- JWT with short-lived access tokens (15min) and refresh token rotation
- bcrypt password hashing (12 salt rounds)
- Comprehensive security headers (CSP, HSTS, X-Frame-Options)
- Input validation middleware with composable chains
- Rate limiting at multiple levels (API, auth, AI, socket flood)
- Sensitive data redaction in logs
- Directory traversal protection on file serving
- Hierarchical role-based access control (creator > admin > moderator > member)

See [SECURITY.md](./SECURITY.md) for the full security architecture.

---

## 🧪 Testing

```bash
# Frontend tests (Vitest)
cd frontend
npm test              # Run once
npm run test:watch    # Watch mode

# Backend tests (Jest)
cd backend
npm test
```

See [TESTING.md](./TESTING.md) for testing guidelines.

---

## 📖 Learning Resources

- [LEARNING_GUIDE.md](./LEARNING_GUIDE.md) — Visual guide for understanding the codebase
- [PROJECT_MAP.md](./PROJECT_MAP.md) — File-by-file purpose guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture with diagrams
- [FAQ.md](./FAQ.md) — Common questions answered

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:

- Setting up the development environment
- Code style and conventions
- Pull request process
- Architecture decisions

---

## 📄 License

This project is for educational and portfolio purposes.
