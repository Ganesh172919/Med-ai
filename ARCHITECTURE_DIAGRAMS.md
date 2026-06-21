# 🏗️ ChatSphere Architecture Diagrams

> Interactive Mermaid diagrams for visualizing the ChatSphere architecture.
> These diagrams render on GitHub, GitLab, and most Markdown viewers.

---

## System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[🌐 Browser]
        React[React 18 SPA]
        Zustand[Zustand State]
        SocketClient[Socket.IO Client]
    end

    subgraph "Server Layer"
        Express[Express HTTP Server]
        SocketServer[Socket.IO Server]
        Passport[Passport Auth]
    end

    subgraph "Data Layer"
        MongoDB[(MongoDB)]
        InMemory[(In-Memory Maps)]
    end

    subgraph "AI Layer"
        OpenRouter[OpenRouter]
        Gemini[Google Gemini]
        Groq[Groq]
        Together[Together AI]
        Grok[xAI Grok]
        HuggingFace[Hugging Face]
    end

    Browser --> React
    React --> Zustand
    React --> SocketClient
    React -->|REST API| Express
    SocketClient -->|WebSocket| SocketServer

    Express --> Passport
    Express --> MongoDB
    SocketServer --> MongoDB
    SocketServer --> InMemory

    Express --> OpenRouter
    Express --> Gemini
    Express --> Groq
    Express --> Together
    Express --> Grok
    Express --> HuggingFace
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant G as Google OAuth

    Note over U,G: Registration Flow
    U->>F: Enter credentials
    F->>B: POST /api/auth/register
    B->>DB: Create user (bcrypt hash)
    B->>F: { user, accessToken }
    F->>F: Store in Zustand + localStorage

    Note over U,G: Login Flow
    U->>F: Enter email/password
    F->>B: POST /api/auth/login
    B->>DB: Verify credentials
    B->>F: { user, accessToken } + httpOnly cookie
    F->>F: Store in Zustand

    Note over U,G: Token Refresh Flow
    F->>B: POST /api/auth/refresh (cookie)
    B->>DB: Rotate refresh token
    B->>F: New accessToken + cookie
    F->>F: Update Zustand

    Note over U,G: Google OAuth Flow
    U->>F: Click "Sign in with Google"
    F->>G: Redirect to Google
    G->>F: Callback with auth code
    F->>B: POST /api/auth/google/exchange
    B->>DB: Find/create user
    B->>F: { user, accessToken }
```

---

## Real-Time Chat Architecture

```mermaid
sequenceDiagram
    participant A as User A
    participant S as Socket.IO Server
    participant B as Backend
    participant DB as MongoDB
    participant C as User B

    Note over A,C: Message Flow
    A->>S: send_message({roomId, content})
    S->>S: Flood control check
    S->>S: Verify room membership
    S->>B: Create Message document
    B->>DB: Save message
    B->>S: Message saved
    S->>S: Check delivery status
    S->>C: receive_message(data)
    S->>A: ack({success, messageId})

    Note over A,C: AI Response Flow
    A->>S: trigger_ai({roomId, prompt})
    S->>S: Check AI quota
    S->>B: sendGroupMessage(history, prompt)
    B->>B: Select AI provider/model
    B->>B: Call AI API
    B->>S: AI response
    S->>DB: Save AI message
    S->>C: ai_response(message)
    S->>A: ack({success, message})
```

---

## AI Provider Routing

```mermaid
graph TD
    Request[AI Request] --> Auto{Auto Mode?}
    Auto -->|Yes| Complexity[Analyze Complexity]
    Auto -->|No| Direct[Use Selected Model]

    Complexity --> Low[Low Complexity]
    Complexity --> Medium[Medium Complexity]
    Complexity --> High[High Complexity]

    Low --> FastModels[Fast Models<br/>Groq, Gemini Flash]
    Medium --> BalancedModels[Balanced Models<br/>GPT-4, Claude]
    High --> PowerfulModels[Powerful Models<br/>GPT-4, Claude Opus]

    FastModels --> Try[Try Primary Model]
    BalancedModels --> Try
    PowerfulModels --> Try
    Direct --> Try

    Try --> Success{Success?}
    Success -->|Yes| Response[Return Response]
    Success -->|No| Fallback[Try Fallback Model]
    Fallback --> Try

    style Request fill:#A855F7,color:white
    style Response fill:#22C55E,color:white
    style Fallback fill:#F97316,color:white
```

---

## Database Schema (ER Diagram)

```mermaid
erDiagram
    User {
        string username PK
        string email
        string passwordHash
        string avatar
        string displayName
        string bio
        string authProvider
        string onlineStatus
        datetime lastSeen
        boolean isAdmin
        array blockedUsers
    }

    Room {
        string name
        string description
        string visibility
        string privateJoinKey
        string creatorId FK
        array members
        array pinnedMessages
        array aiHistory
    }

    Message {
        string roomId FK
        string userId
        string username
        string content
        boolean isAI
        string status
        map reactions
        boolean isPinned
        boolean isEdited
        boolean isDeleted
        string fileUrl
        string modelId
        string provider
    }

    Conversation {
        string userId FK
        string title
        array messages
        string projectId FK
        string sourceType
    }

    MemoryEntry {
        string userId FK
        string summary
        string details
        array tags
        string fingerprint
        float confidenceScore
        float importanceScore
        boolean pinned
    }

    Project {
        string userId FK
        string name
        string description
        string instructions
        string context
        array files
    }

    User ||--o{ Room : "creates"
    User ||--o{ Conversation : "owns"
    User ||--o{ MemoryEntry : "has"
    User ||--o{ Project : "owns"
    Room ||--o{ Message : "contains"
    Conversation ||--o{ Message : "contains"
```

---

## Socket.IO Event Flow

```mermaid
stateDiagram-v2
    [*] --> Connected: JWT Auth
    Connected --> InRoom: join_room
    InRoom --> InRoom: send_message
    InRoom --> InRoom: reply_message
    InRoom --> InRoom: add_reaction
    InRoom --> InRoom: trigger_ai
    InRoom --> InRoom: edit_message
    InRoom --> InRoom: delete_message
    InRoom --> InRoom: pin_message
    InRoom --> InRoom: typing_start
    InRoom --> InRoom: typing_stop
    InRoom --> InRoom: mark_read
    InRoom --> Connected: leave_room
    Connected --> [*]: disconnect

    note right of InRoom
        Flood control: 30 events/10s
        Typing auto-clear: 3s
        Edit window: 15 min
    end note
```

---

## Frontend Component Hierarchy

```mermaid
graph TD
    App[App.tsx] --> EB[ErrorBoundary]
    EB --> TP[ThemeProvider]
    TP --> Router[BrowserRouter]
    Router --> STC[SkipToContent]
    Router --> Toaster[Toaster]
    Router --> Suspense[Suspense]

    Suspense --> Landing[Landing]
    Suspense --> Login[Login]
    Suspense --> Register[Register]
    Suspense --> Dashboard[Dashboard]
    Suspense --> SoloChat[SoloChat]
    Suspense --> GroupChat[GroupChat]
    Suspense --> Rooms[Rooms]
    Suspense --> Projects[Projects]
    Suspense --> Memory[MemoryCenter]
    Suspense --> Search[SearchPage]
    Suspense --> Settings[Settings]
    Suspense --> Admin[AdminDashboard]

    SoloChat --> Navbar[Navbar]
    SoloChat --> MB[MessageBubble]
    SoloChat --> SR[SmartReplies]
    SoloChat --> GS[GrammarSuggestion]
    SoloChat --> CIP[ConversationInsightsPanel]
    SoloChat --> PMS[ProviderModelSelector]

    GroupChat --> Navbar
    GroupChat --> MB
    GroupChat --> TI[TypingIndicator]
    GroupChat --> UL[UserList]
    GroupChat --> PM[PinnedMessages]
    GroupChat --> MM[MemberManagement]
    GroupChat --> PKM[PrivateKeyModal]

    style App fill:#A855F7,color:white
    style SoloChat fill:#3B82F6,color:white
    style GroupChat fill:#3B82F6,color:white
```

---

## State Management Architecture

```mermaid
graph LR
    subgraph "Zustand Stores"
        AuthStore[authStore<br/>user, token, isAuthenticated<br/>persisted to localStorage]
        ChatStore[chatStore<br/>conversations, messages<br/>persisted to localStorage]
        RoomStore[roomStore<br/>currentRoom, messages<br/>ephemeral]
    end

    subgraph "React Context"
        ThemeCtx[ThemeContext<br/>theme, accentColor<br/>persisted to localStorage]
    end

    subgraph "Local State"
        PageState[Page-level useState<br/>UI state, forms, etc.]
    end

    AuthStore --> API[API Layer]
    ChatStore --> API
    RoomStore --> Socket[Socket.IO]
    ThemeCtx --> CSS[CSS Custom Properties]
    PageState --> UI[UI Components]

    style AuthStore fill:#A855F7,color:white
    style ChatStore fill:#3B82F6,color:white
    style RoomStore fill:#22C55E,color:white
    style ThemeCtx fill:#F97316,color:white
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production"
        CDN[CDN / Static Files]
        LB[Load Balancer]
        Server1[Server Instance 1]
        Server2[Server Instance 2]
        MongoDB[(MongoDB Atlas)]
        Redis[(Redis - Future)]
    end

    subgraph "Development"
        Vite[Vite Dev Server :5173]
        Nodemon[Nodemon :3000]
        LocalMongo[(Local MongoDB)]
    end

    CDN --> LB
    LB --> Server1
    LB --> Server2
    Server1 --> MongoDB
    Server2 --> MongoDB
    Server1 -.-> Redis
    Server2 -.-> Redis

    Vite -->|Proxy| Nodemon
    Nodemon --> LocalMongo

    style CDN fill:#A855F7,color:white
    style MongoDB fill:#22C55E,color:white
    style Redis fill:#F97316,color:white
```

---

## Security Layers

```mermaid
graph TB
    subgraph "Client Security"
        CSP[CSP Headers]
        XSS[XSS Protection]
        HTTPS[HTTPS Only]
    end

    subgraph "Transport Security"
        CORS[CORS Policy]
        HSTS[HSTS Headers]
        TLS[TLS 1.3]
    end

    subgraph "Authentication"
        JWT[JWT Access Token<br/>15min expiry]
        Refresh[Refresh Token<br/>7 day, httpOnly cookie]
        OAuth[Google OAuth 2.0]
    end

    subgraph "Authorization"
        RBAC[Role-Based Access<br/>creator > admin > mod > member]
        RoomAuth[Room Membership]
        BlockCheck[Block Relationships]
    end

    subgraph "Input Validation"
        Sanitize[HTML Sanitization]
        Validate[Schema Validation]
        RateLimit[Rate Limiting]
        Flood[Flood Control]
    end

    CSP --> XSS
    CORS --> HSTS
    JWT --> Refresh
    RBAC --> RoomAuth
    Sanitize --> Validate
    RateLimit --> Flood

    style JWT fill:#A855F7,color:white
    style RBAC fill:#3B82F6,color:white
    style RateLimit fill:#F97316,color:white
```

---

## Memory System Architecture

```mermaid
graph TD
    Chat[Chat Message] --> Extract{Extract Memory}
    Extract --> Deterministic[Regex Patterns<br/>name, location, preferences]
    Extract --> AI[AI Extraction<br/>LLM analysis]

    Deterministic --> Dedupe[Deduplication<br/>fingerprint check]
    AI --> Dedupe

    Dedupe --> Store[(MemoryEntry<br/>MongoDB)]

    Retrieve[New Chat] --> Search[Search Memories]
    Search --> Score[Score & Rank]
    Score --> Inject[Inject into Prompt]

    Store --> Search

    Score --> TextScore[Text Relevance × 0.45]
    Score --> Importance[Importance × 0.2]
    Score --> Confidence[Confidence × 0.15]
    Score --> Recency[Recency × 0.1]
    Score --> Usage[Usage Count × 0.01]
    Score --> Pinned[Pinned Bonus × 0.15]

    style Extract fill:#A855F7,color:white
    style Score fill:#3B82F6,color:white
    style Store fill:#22C55E,color:white
```

---

## Performance Optimization Map

```mermaid
graph LR
    subgraph "Frontend Optimizations"
        Lazy[Lazy Loading<br/>All 16 pages]
        Chunks[Code Splitting<br/>3 vendor chunks]
        Memo[React.memo<br/>RoomCard, ReadReceipt]
        Skeleton[Skeleton Loading<br/>All pages]
        PathAlias[Path Aliases<br/>@/* imports]
    end

    subgraph "Backend Optimizations"
        Compress[Gzip Compression<br/>1KB threshold]
        Pool[Connection Pool<br/>maxPoolSize: 10]
        Index[DB Indexes<br/>Compound indexes]
        Cache[Model Catalog<br/>30min TTL]
        Flood2[Flood Control<br/>30 events/10s]
    end

    subgraph "Network Optimizations"
        CORS2[CORS Config]
        Proxy[Dev Proxy]
        WS[WebSocket<br/>Persistent connection]
    end

    Lazy --> Chunks
    Chunks --> Memo
    Compress --> Pool
    Pool --> Index

    style Lazy fill:#A855F7,color:white
    style Compress fill:#3B82F6,color:white
    style WS fill:#22C55E,color:white
```

---

*Generated for ChatSphere — AI-powered multi-provider chat platform*
