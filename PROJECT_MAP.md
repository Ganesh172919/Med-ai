# ChatSphere Project Map

Visual guide to every file in the project and its purpose.

---

## Root Directory

```
chatsphere/
├── .github/workflows/     # CI/CD automation
│   └── ci.yml             # GitHub Actions test pipeline
│
├── .claude/               # Claude Code session data
│
├── backend/               # Express + Socket.IO server
├── frontend/              # React + TypeScript SPA
├── Med-ai/                # Medical AI module (separate)
├── temp-chatsphere/       # Legacy copy (do not modify)
│
├── ARCHITECTURE.md        # System architecture & diagrams
├── API.md                 # REST API & Socket.IO docs
├── CHANGELOG.md           # Version history
├── CONTRIBUTING.md        # Developer guide
├── DATABASE_GUIDE.md      # MongoDB optimization
├── DEPLOYMENT.md          # Production deployment
├── FRONTEND_GUIDE.md      # Frontend architecture
├── LEARNING_GUIDE.md      # Visual learning guide
├── PROJECT_MAP.md         # This file
├── README.md              # Project overview
├── SECURITY.md            # Security architecture
├── TESTING.md             # Testing guide
└── TROUBLESHOOTING.md     # Common issues
```

---

## Backend Structure

```
backend/
├── index.js               # Server entry point
│                          # - Express + Socket.IO setup
│                          # - Route mounting
│                          # - Socket event handlers
│                          # - Graceful shutdown
│
├── config/
│   ├── db.js              # MongoDB connection
│   └── passport.js        # Google OAuth strategy
│
├── controllers/
│   └── auth.controller.js # Auth business logic
│
├── helpers/
│   ├── logger.js          # Structured logging
│   └── validate.js        # Input validation utilities
│
├── middleware/
│   ├── admin.js           # Admin role check
│   ├── aiQuota.js         # AI rate limiting
│   ├── auth.js            # JWT verification
│   ├── compression.js     # Response gzip (NEW)
│   ├── rateLimit.js       # API rate limiting
│   ├── security.js        # Security headers (NEW)
│   ├── socketAuth.js      # Socket.IO JWT auth
│   ├── upload.js          # File upload (Multer)
│   └── validate.js        # Request validation (NEW)
│
├── models/
│   ├── Conversation.js    # Solo chat conversations
│   ├── ConversationInsight.js # AI insights
│   ├── ImportSession.js   # Data import
│   ├── MemoryEntry.js     # AI memory
│   ├── Message.js         # Chat messages
│   ├── Poll.js            # Room polls
│   ├── Project.js         # Project context
│   ├── PromptTemplate.js  # AI prompts
│   ├── RefreshToken.js    # JWT refresh tokens
│   ├── Report.js          # Content reports
│   ├── Room.js            # Chat rooms
│   └── User.js            # User accounts
│
├── routes/
│   ├── admin.js           # Admin endpoints
│   ├── ai.js              # AI model endpoints
│   ├── analytics.js       # Usage analytics
│   ├── auth.js            # Auth endpoints
│   ├── auth.routes.js     # Auth routes (alternate)
│   ├── chat.js            # Solo chat endpoints
│   ├── conversations.js   # Conversation CRUD
│   ├── dashboard.js       # Dashboard data
│   ├── export.js          # Data export
│   ├── groups.js          # Group management
│   ├── memory.js          # Memory CRUD
│   ├── moderation.js      # Content moderation
│   ├── polls.js           # Poll endpoints
│   ├── projects.js        # Project endpoints
│   ├── rooms.js           # Room CRUD
│   ├── search.js          # Full-text search
│   ├── settings.js        # User settings
│   ├── uploads.js         # File uploads
│   └── users.js           # User management
│
├── services/
│   ├── aiQuota.js         # AI quota management
│   ├── auth.service.js    # Auth logic
│   ├── conversationInsights.js # AI analysis
│   ├── email.js           # Email sending
│   ├── gemini.js          # AI gateway (multi-provider)
│   ├── importExport.js    # Data import/export
│   ├── memory.js          # Memory extraction
│   ├── messageFormatting.js # Message processing
│   └── promptCatalog.js   # AI prompt templates
│
├── utils/
│   └── token.js           # JWT generation
│
├── __tests__/             # Test files (NEW)
│   ├── validate.test.js           # Validation helper tests
│   └── validateMiddleware.test.js # Middleware tests
│
├── .env.example           # Environment template (NEW)
├── .gitignore
├── nodemon.json
├── package.json
└── package-lock.json
```

---

## Frontend Structure

```
frontend/
├── src/
│   ├── api/               # API client layer
│   │   ├── admin.ts       # Admin endpoints
│   │   ├── ai.ts          # AI model endpoints
│   │   ├── analytics.ts   # Analytics endpoints
│   │   ├── auth.ts        # Auth endpoints
│   │   ├── axios.ts       # Base Axios instance
│   │   ├── chat.ts        # Chat endpoints
│   │   ├── conversations.ts # Conversation endpoints
│   │   ├── dashboard.ts   # Dashboard endpoints
│   │   ├── export.ts      # Export endpoints
│   │   ├── groups.ts      # Group endpoints
│   │   ├── memory.ts      # Memory endpoints
│   │   ├── moderation.ts  # Moderation endpoints
│   │   ├── polls.ts       # Poll endpoints
│   │   ├── projects.ts    # Project endpoints
│   │   ├── rooms.ts       # Room endpoints
│   │   ├── search.ts      # Search endpoints
│   │   ├── settings.ts    # Settings endpoints
│   │   └── users.ts       # User endpoints
│   │
│   ├── components/        # Reusable UI components
│   │   ├── AnalyticsCharts.tsx    # Data visualization
│   │   ├── CodeBlock.tsx          # Syntax highlighting
│   │   ├── ConversationInsightsPanel.tsx # AI insights
│   │   ├── CreateRoomModal.tsx    # Room creation dialog
│   │   ├── ErrorBoundary.tsx      # Error catching (NEW)
│   │   ├── GrammarSuggestion.tsx  # Grammar checking
│   │   ├── Layout.tsx             # Page layout
│   │   ├── MarkdownRenderer.tsx   # Markdown rendering
│   │   ├── MemberManagement.tsx   # Room members
│   │   ├── MessageBubble.tsx      # Chat message
│   │   ├── Modal.tsx              # Dialog component
│   │   ├── Navbar.tsx             # Navigation bar
│   │   ├── PinnedMessages.tsx     # Pinned messages
│   │   ├── PollComponents.tsx     # Polls UI
│   │   ├── ProtectedRoute.tsx     # Auth guard
│   │   ├── ReadReceipt.tsx        # Read status
│   │   ├── ReportModal.tsx        # Content report
│   │   ├── RoomCard.tsx           # Room card
│   │   ├── SentimentBadge.tsx     # Sentiment display
│   │   ├── Sidebar.tsx            # Side panel
│   │   ├── Skeleton.tsx           # Loading states (NEW)
│   │   ├── SkipToContent.tsx      # A11y skip link (NEW)
│   │   ├── SmartReplies.tsx       # AI suggestions
│   │   ├── ThemeSettingsSync.tsx  # Theme sync
│   │   ├── TypingIndicator.tsx    # Typing status
│   │   └── UserList.tsx           # User list
│   │
│   ├── context/
│   │   └── ThemeContext.tsx # Theme management
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useChat.ts     # Solo chat logic
│   │   ├── useKeyboardNav.ts # Keyboard nav (NEW)
│   │   └── useSocket.ts   # Socket.IO connection
│   │
│   ├── pages/             # Route-level pages
│   │   ├── AdminDashboard.tsx # Admin panel
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── ExportChat.tsx     # Export page
│   │   ├── ForgotPassword.tsx # Password reset
│   │   ├── GoogleCallback.tsx # OAuth callback
│   │   ├── GroupChat.tsx      # Room chat
│   │   ├── Landing.tsx        # Landing page
│   │   ├── Login.tsx          # Login page
│   │   ├── MemoryCenter.tsx   # AI memory
│   │   ├── Profile.tsx        # User profile
│   │   ├── Projects.tsx       # Projects page
│   │   ├── Register.tsx       # Registration
│   │   ├── ResetPassword.tsx  # Password reset
│   │   ├── Rooms.tsx          # Room browser
│   │   ├── SearchPage.tsx     # Search page
│   │   ├── Settings.tsx       # User settings
│   │   └── SoloChat.tsx       # AI chat
│   │
│   ├── store/             # Zustand state stores
│   │   ├── authStore.ts       # Auth state
│   │   ├── chatStore.ts       # Chat state
│   │   ├── roomStore.ts       # Room state
│   │   └── __tests__/
│   │       └── authStore.test.ts # Store tests
│   │
│   ├── types/
│   │   └── chat.ts        # Chat type definitions
│   │
│   ├── utils/             # Utility functions
│   │   ├── aiModels.ts    # Model grouping
│   │   ├── errors.ts      # Error handling
│   │   ├── format.ts      # Date/text formatting
│   │   └── __tests__/
│   │       ├── aiModels.test.ts  # Model tests (NEW)
│   │       ├── errors.test.ts    # Error tests
│   │       └── format.test.ts    # Format tests
│   │
│   ├── test/
│   │   └── setup.ts       # Test configuration
│   │
│   ├── App.tsx            # Root component
│   ├── App.css            # Global styles
│   ├── index.css          # Tailwind imports
│   ├── main.tsx           # Entry point
│   └── vite-env.d.ts      # Vite types
│
├── public/
│   ├── favicon.svg        # Favicon
│   └── icons.svg          # Icon sprite
│
├── dist/                  # Build output
├── eslint.config.js       # ESLint config
├── index.html             # HTML template
├── package.json
├── postcss.config.js      # PostCSS config
├── tailwind.config.ts     # Tailwind config
├── theme-mapper.js        # Theme utilities
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
└── vitest.config.ts       # Vitest config
```

---

## File Purpose Quick Reference

### Backend - What Does What

| Purpose | File(s) |
|---------|---------|
| Server startup | `index.js` |
| Database connection | `config/db.js` |
| Authentication | `middleware/auth.js`, `middleware/socketAuth.js` |
| Authorization | `middleware/admin.js`, `helpers/validate.js` |
| Rate limiting | `middleware/rateLimit.js`, `middleware/aiQuota.js` |
| Security headers | `middleware/security.js` |
| Input validation | `middleware/validate.js`, `helpers/validate.js` |
| File uploads | `middleware/upload.js` |
| Response compression | `middleware/compression.js` |
| AI gateway | `services/gemini.js` |
| User management | `routes/users.js`, `models/User.js` |
| Chat messages | `routes/chat.js`, `models/Message.js` |
| Rooms | `routes/rooms.js`, `models/Room.js` |
| Memory | `routes/memory.js`, `models/MemoryEntry.js` |

### Frontend - What Does What

| Purpose | File(s) |
|---------|---------|
| Routing | `App.tsx` |
| State management | `store/*.ts` |
| API calls | `api/*.ts` |
| Authentication UI | `pages/Login.tsx`, `pages/Register.tsx` |
| Chat UI | `pages/SoloChat.tsx`, `components/MessageBubble.tsx` |
| Room UI | `pages/Rooms.tsx`, `pages/GroupChat.tsx` |
| Navigation | `components/Navbar.tsx` |
| Error handling | `components/ErrorBoundary.tsx` |
| Loading states | `components/Skeleton.tsx` |
| Accessibility | `components/SkipToContent.tsx`, `hooks/useKeyboardNav.ts` |
| Theming | `context/ThemeContext.tsx` |
| Real-time | `hooks/useSocket.ts` |

---

## Documentation Index

| File | Audience | Purpose |
|------|----------|---------|
| README.md | Everyone | Project overview, quick start |
| ARCHITECTURE.md | Developers | System design, data flows |
| API.md | Frontend devs | Endpoint reference |
| FRONTEND_GUIDE.md | Frontend devs | Component patterns, styling |
| DATABASE_GUIDE.md | Backend devs | MongoDB optimization |
| LEARNING_GUIDE.md | Beginners | Visual learning aids |
| CONTRIBUTING.md | Contributors | How to contribute |
| TESTING.md | QA/Devs | Testing practices |
| DEPLOYMENT.md | DevOps | Production deployment |
| SECURITY.md | Security | Threat model, best practices |
| TROUBLESHOOTING.md | Everyone | Common issues |
| CHANGELOG.md | Everyone | Version history |
| PROJECT_MAP.md | Everyone | This file |
