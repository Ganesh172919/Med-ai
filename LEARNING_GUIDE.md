# ChatSphere Visual Learning Guide

A beginner-friendly, visual guide to understanding ChatSphere's architecture.

---

## Table of Contents

- [What is ChatSphere?](#what-is-chatsphere)
- [How the Pieces Fit Together](#how-the-pieces-fit-together)
- [Frontend Explained](#frontend-explained)
- [Backend Explained](#backend-explained)
- [Real-time Magic (Socket.IO)](#real-time-magic-socketio)
- [AI Gateway](#ai-gateway)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [Key Patterns & Concepts](#key-patterns--concepts)

---

## What is ChatSphere?

ChatSphere is like Slack, but with AI built in. Users can:
- Chat with AI privately (Solo Chat)
- Create rooms and chat with others + AI (Group Chat)
- Use multiple AI providers (OpenRouter, Gemini, Groq, etc.)

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChatSphere                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   👤 Solo Chat          👥 Group Rooms         🤖 AI Gateway   │
│   ┌─────────┐          ┌─────────────┐        ┌─────────────┐  │
│   │ Private │          │ Team chat   │        │ Multiple AI │  │
│   │ AI chat │          │ with AI     │        │ providers   │  │
│   │ history │          │ @ai mentions│        │ one gateway │  │
│   └─────────┘          └─────────────┘        └─────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## How the Pieces Fit Together

Think of ChatSphere like a restaurant:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Restaurant Analogy                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🍽️ Frontend (Dining Room)                                      │
│  ├── What customers see and interact with                       │
│  ├── React components = tables, chairs, menus                   │
│  └── User clicks = ordering food                                │
│                                                                 │
│  👨‍🍳 Backend (Kitchen)                                           │
│  ├── Processes orders (API requests)                            │
│  ├── Express routes = different stations                        │
│  └── Business logic = recipes                                   │
│                                                                 │
│  📦 Database (Pantry)                                           │
│  ├── Stores all ingredients (data)                              │
│  ├── MongoDB = refrigerator + shelves                           │
│  └── Mongoose = organization system                             │
│                                                                 │
│  🤖 AI Gateway (Special Chef)                                    │
│  ├── Handles AI requests                                        │
│  ├── Multiple AI providers = different cuisines                 │
│  └── Automatic fallback = backup recipes                        │
│                                                                 │
│  📡 Socket.IO (Waiter)                                           │
│  ├── Real-time communication                                    │
│  ├── Carries messages between tables                            │
│  └── Instant updates (no waiting)                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Explained

### Component Tree

```
App.tsx
├── ThemeProvider          # Dark/light theme
├── Router                 # Page navigation
│   ├── Landing           # Public landing page
│   ├── Login             # Auth page
│   ├── Register          # Sign up page
│   ├── Dashboard         # Main dashboard
│   ├── SoloChat          # AI chat page
│   │   ├── Navbar        # Top bar
│   │   ├── Sidebar       # Conversation list
│   │   ├── MessageBubble # Chat messages
│   │   └── Composer      # Input area
│   ├── GroupChat         # Room chat page
│   ├── Rooms             # Room browser
│   ├── Profile           # User profile
│   ├── Settings          # User settings
│   └── AdminDashboard    # Admin panel
└── Toaster               # Notifications
```

### State Management (Zustand)

Zustand is like a shared notebook that any component can read/write:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Zustand Stores                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  authStore.ts                                                   │
│  ├── user: { id, username, email, avatar }                     │
│  ├── isAuthenticated: boolean                                   │
│  ├── login(data) → save user + token                           │
│  └── logout() → clear user + token                             │
│                                                                 │
│  chatStore.ts                                                   │
│  ├── conversations: Conversation[]                              │
│  ├── activeConversationId: string                               │
│  ├── addMessage(convId, message)                                │
│  ├── updateConversationInsight(convId, insight)                 │
│  └── setActiveConversation(id)                                  │
│                                                                 │
│  roomStore.ts                                                   │
│  ├── rooms: Room[]                                              │
│  ├── activeRoom: Room | null                                    │
│  └── setRooms(rooms) / setActiveRoom(room)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow in Solo Chat

```
User types message
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Composer   │────►│  useChat()   │────►│  POST /chat  │
│   Component  │     │  Hook        │     │  API call    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │   Backend    │
                                          │   processes  │
                                          └──────┬───────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Display    │◄────│  chatStore   │◄────│  Response    │
│   Message    │     │  updates     │     │  + save DB   │
│   Bubble     │     │  state       │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Backend Explained

### Request Lifecycle

```
HTTP Request Arrives
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    Express Middleware Chain                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CORS Middleware                                          │
│     └── Allows frontend (localhost:5173) to call API         │
│                                                              │
│  2. JSON Parser                                              │
│     └── Parses request body as JSON                          │
│                                                              │
│  3. Cookie Parser                                            │
│     └── Reads cookies (for refresh tokens)                   │
│                                                              │
│  4. Passport Initialize                                      │
│     └── Sets up Google OAuth                                 │
│                                                              │
│  5. Request Logger                                           │
│     └── Logs method, path, duration                          │
│                                                              │
│  6. Rate Limiter                                             │
│     └── 100 requests per 15 min per IP                       │
│                                                              │
│  7. Route Handler                                            │
│     └── Specific business logic                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
Response sent to client
```

### Route → Controller → Service Pattern

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Route      │────►│  Controller  │────►│   Service    │
│   /api/chat  │     │  Validates   │     │  Business    │
│   POST       │     │  input       │     │  logic       │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │   Model      │
                                          │  (Mongoose)  │
                                          │  Save to DB  │
                                          └──────────────┘
```

**Example: Sending a chat message**

```javascript
// Route (chat.js)
router.post('/', authMiddleware, async (req, res) => {
  // 1. Get data from request
  const { message, modelId } = req.body;
  
  // 2. Call service
  const response = await chatService.sendMessage(message, modelId);
  
  // 3. Return response
  res.json({ success: true, message: response });
});

// Service (gemini.js)
async function sendMessage(message, modelId) {
  // 1. Resolve which AI model to use
  const model = resolveModel(modelId);
  
  // 2. Call AI provider
  const result = await callAIProvider(model, message);
  
  // 3. Save to database
  await saveToConversation(result);
  
  // 4. Return formatted response
  return formatResponse(result);
}
```

---

## Real-time Magic (Socket.IO)

### How Socket.IO Works

```
Traditional HTTP:
  Client: "Give me new messages" (polling every 5 seconds)
  Server: "Here are messages" (or "Nothing new")

Socket.IO:
  Client: "I'm connected, tell me when something happens"
  Server: "New message!" (instant push)
  Server: "User joined!" (instant push)
  Server: "Someone typing..." (instant push)
```

### Socket.IO Event Flow

```
┌─────────────┐                              ┌─────────────┐
│   User A    │                              │   User B    │
│   (Sender)  │                              │  (Receiver) │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  1. Type message                           │
       │  2. Click send                             │
       │                                            │
       ▼                                            │
┌──────────────┐                                    │
│  emit(       │                                    │
│  'send_msg', │                                    │
│  {roomId,    │                                    │
│   content}   │                                    │
│  )           │                                    │
└──────┬───────┘                                    │
       │                                            │
       ▼                                            │
┌──────────────────────────────────────────────────┐
│              Socket.IO Server                    │
│                                                  │
│  1. Receive event                                │
│  2. Validate input                               │
│  3. Save to MongoDB                              │
│  4. Broadcast to room:                           │
│     io.to(roomId).emit('receive_message', msg)  │
│                                                  │
└──────┬──────────────────────────────────┬────────┘
       │                                  │
       │                                  │
       ▼                                  ▼
┌──────────────┐                   ┌──────────────┐
│   User A    │                   │   User B    │
│   sees msg  │                   │   sees msg  │
│   instantly │                   │   instantly │
└─────────────┘                   └─────────────┘
```

### Room System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Room Architecture                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Room: "AI Research Lab"                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Members: [Alice, Bob, Charlie]                         │   │
│  │                                                         │   │
│  │  Socket.IO Room: "room_abc123"                          │   │
│  │  ├── Alice's socket ──► connected                       │   │
│  │  ├── Bob's socket ──► connected                         │   │
│  │  └── Charlie's socket ──► disconnected                  │   │
│  │                                                         │   │
│  │  Messages:                                              │   │
│  │  ├── "Hello everyone!" (Alice)                          │   │
│  │  ├── "@ai explain transformers" (Bob)                   │   │
│  │  └── "Here's the paper..." (Charlie)                    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  When Alice sends a message:                                    │
│  1. Alice's client → emit('send_message') → Server             │
│  2. Server saves to MongoDB                                    │
│  3. Server → io.to(roomId).emit('receive_message')             │
│  4. Bob's client receives instantly                             │
│  5. Charlie's client receives when they reconnect              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Gateway

### Multi-Provider Routing

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Gateway (gemini.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User selects model: "openai/gpt-5.4-mini"                     │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  resolveModel()                         │   │
│  │                                                         │   │
│  │  1. Check if model exists in available models           │   │
│  │  2. If not found → use default model                    │   │
│  │  3. Return { id, provider, label }                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Provider Dispatch                          │   │
│  │                                                         │   │
│  │  provider === 'openrouter' → runOpenRouterRequest()     │   │
│  │  provider === 'gemini'     → runGeminiRequest()         │   │
│  │  provider === 'grok'       → runGrokRequest()           │   │
│  │  provider === 'groq'       → runGroqDirectRequest()     │   │
│  │  provider === 'together'   → runTogetherRequest()       │   │
│  │  provider === 'huggingface'→ runHuggingFaceRequest()    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Fallback Chain                             │   │
│  │                                                         │   │
│  │  If primary model fails:                                │   │
│  │  1. Try next model in ranked list                       │   │
│  │  2. Up to 6 attempts                                   │   │
│  │  3. Diversify across providers                          │   │
│  │  4. Return first successful response                    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Model Catalog System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Model Catalog                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  On server startup:                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  refreshModelCatalogs()                                 │   │
│  │                                                         │   │
│  │  Fetches from all configured providers:                 │   │
│  │  ├── OpenRouter: /api/v1/models                        │   │
│  │  ├── Gemini: /v1beta/models?key=...                    │   │
│  │  ├── Grok: /v1/models                                  │   │
│  │  ├── Together: /v1/models                              │   │
│  │  └── Groq: /openai/v1/models                           │   │
│  │                                                         │   │
│  │  Result: List of { id, label, provider, supportsFiles } │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TTL: 30 minutes (auto-refresh)                                │
│  Fallback: Hardcoded default models if API fails               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Design

### Collections and Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Collections                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │    Users     │         │    Rooms     │                     │
│  ├──────────────┤         ├──────────────┤                     │
│  │ username     │◄────────│ creatorId    │                     │
│  │ email        │   │     │ name         │                     │
│  │ passwordHash │   │     │ members[]    │                     │
│  │ avatar       │   │     │ visibility   │                     │
│  │ settings{}   │   │     └──────┬───────┘                     │
│  └──────────────┘   │            │                              │
│         │           │            │                              │
│         │           │            ▼                              │
│         │           │     ┌──────────────┐                     │
│         │           │     │   Messages   │                     │
│         │           │     ├──────────────┤                     │
│         │           └────►│ userId       │                     │
│         │                 │ roomId ──────┼──► Room             │
│         │                 │ content      │                     │
│         │                 │ isAI         │                     │
│         │                 │ reactions{}  │                     │
│         │                 │ status       │                     │
│         │                 └──────────────┘                     │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │ Conversations│         │ MemoryEntries│                     │
│  ├──────────────┤         ├──────────────┤                     │
│  │ userId ──────┼────────►│ userId       │                     │
│  │ title        │         │ summary      │                     │
│  │ messages[]   │         │ tags[]       │                     │
│  │ insight{}    │         │ source       │                     │
│  └──────────────┘         └──────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why MongoDB?

```
┌─────────────────────────────────────────────────────────────────┐
│              Why MongoDB for ChatSphere?                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Flexible Schema                                             │
│     Messages can have different fields (reactions, files, etc.) │
│     No need to alter tables when adding features                │
│                                                                 │
│  ✅ JSON Native                                                 │
│     Frontend sends/receives JSON                                │
│     MongoDB stores JSON (BSON)                                  │
│     No conversion needed                                        │
│                                                                 │
│  ✅ Scalable                                                    │
│     Horizontal scaling with sharding                            │
│     Good for high-write workloads (chat messages)               │
│                                                                 │
│  ✅ Rich Queries                                                │
│     Full-text search built-in                                   │
│     Aggregation pipeline for analytics                          │
│                                                                 │
│  ⚠️ Trade-offs                                                  │
│     No ACID transactions (until 4.0+)                           │
│     No joins (must do in application)                           │
│     More memory usage than SQL                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### JWT Token Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User logs in                                                │
│     └── POST /api/auth/login { email, password }               │
│                                                                 │
│  2. Server validates credentials                                │
│     ├── Check email exists                                      │
│     ├── Compare password with bcrypt                            │
│     └── Generate tokens                                         │
│                                                                 │
│  3. Server returns tokens                                       │
│     ├── Access Token (15 min) → Authorization header           │
│     └── Refresh Token (7 days) → httpOnly cookie               │
│                                                                 │
│  4. Client uses Access Token                                    │
│     └── Authorization: Bearer <access_token>                   │
│                                                                 │
│  5. When Access Token expires                                   │
│     └── POST /api/auth/refresh (uses Refresh Token cookie)     │
│         └── Returns new Access Token + new Refresh Token        │
│                                                                 │
│  Security Notes:                                                │
│  ├── Refresh Token in httpOnly cookie (can't be read by JS)    │
│  ├── Access Token short-lived (15 min) limits damage if stolen │
│  └── Token rotation prevents replay attacks                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Patterns & Concepts

### Pattern: Data Transfer Object (DTO)

```
Database Document          →    API Response
┌─────────────────┐        ┌─────────────────┐
│ _id: ObjectId   │        │ id: "abc123"    │
│ roomId: ObjectId│   →    │ roomId: "xyz"   │
│ reactions: Map  │        │ reactions: {}   │
│ isDeleted: true │        │ content: "🗑️"   │
│ __v: 0          │        │ (no __v)        │
└─────────────────┘        └─────────────────┘

Why: Clean API, hide internals, consistent format
Where: formatMessage() in index.js
```

### Pattern: Middleware Chain

```
Request → [CORS] → [JSON] → [Auth] → [Rate Limit] → [Route Handler] → Response

Each middleware can:
├── Modify request (add user, parse body)
├── Short-circuit (return error)
└── Pass to next middleware
```

### Pattern: Event-Driven Architecture

```
User Action → Event → Handler → State Change → Broadcast

Examples:
├── send_message → save DB → receive_message to all
├── typing_start → timeout → typing_stop
└── trigger_ai → process → ai_response
```

### Pattern: Fallback Chain

```
Primary Model → [Fail] → Backup 1 → [Fail] → Backup 2 → [Success]

Why: Resilience against provider outages
How: buildFallbackModelChain() ranks models by provider diversity
```

---

## Glossary

| Term | Definition |
|------|------------|
| **JWT** | JSON Web Token - signed token containing user info |
| **Socket.IO** | Real-time bidirectional event-based communication |
| **ODM** | Object-Document Mapping (Mongoose for MongoDB) |
| **CORS** | Cross-Origin Resource Sharing - allows different ports |
| **Middleware** | Functions that run before route handlers |
| **Provider** | AI service (OpenRouter, Gemini, Groq, etc.) |
| **Fallback** | Backup model when primary fails |
| **DTO** | Data Transfer Object - formatted data for API |
| **TTL** | Time To Live - how long data is valid |
| **BSON** | Binary JSON - MongoDB's storage format |
