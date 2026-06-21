# Architecture Decision Records (ADR)

Key technical decisions made in ChatSphere and their rationale.

---

## ADR-001: MongoDB over PostgreSQL

**Status**: Accepted

**Context**: ChatSphere needs a database for users, messages, rooms, and AI data.

**Decision**: Use MongoDB with Mongoose ODM.

**Rationale**:
- Flexible schema for evolving message formats
- JSON-native (matches API responses)
- Good for high-write workloads (chat messages)
- Built-in full-text search
- Easy horizontal scaling with sharding

**Trade-offs**:
- ❌ No ACID transactions (until MongoDB 4.0+)
- ❌ No joins (must do in application)
- ❌ More memory usage than SQL
- ✅ Faster development iteration
- ✅ Better suited for document-style data

**Alternatives Considered**:
- PostgreSQL: Better for complex queries, but schema rigidity slows development
- DynamoDB: Serverless, but vendor lock-in

---

## ADR-002: Zustand over Redux

**Status**: Accepted

**Context**: Frontend needs state management for auth, chat, and room state.

**Decision**: Use Zustand.

**Rationale**:
- Minimal boilerplate (no actions, reducers, dispatch)
- No Provider wrapper needed
- Works outside React (Socket.IO handlers)
- Built-in persistence middleware
- Smaller bundle size (~1KB vs ~11KB)

**Trade-offs**:
- ❌ Less ecosystem tooling than Redux
- ❌ No time-travel debugging
- ✅ Faster development
- ✅ Smaller bundle
- ✅ Simpler API

**Alternatives Considered**:
- Redux Toolkit: More features, but more boilerplate
- Jotai/Recoil: Atomic state, but more complex for our use case
- React Context: Built-in, but no persistence, re-renders

---

## ADR-003: Multi-Provider AI Gateway

**Status**: Accepted

**Context**: Users want to use different AI models from different providers.

**Decision**: Build a unified gateway in `gemini.js` that routes to multiple providers.

**Rationale**:
- Users choose their preferred provider
- Automatic fallback if primary fails
- Model catalog refresh keeps options current
- Single API for all AI operations

**Providers Supported**:
- OpenRouter (multi-model gateway)
- Google Gemini (direct)
- xAI Grok (direct)
- Groq (fast inference)
- Together AI (open-source models)
- Hugging Face (open-source models)

**Trade-offs**:
- ❌ More complex error handling
- ❌ Multiple API keys to manage
- ✅ Provider diversity reduces single-point-of-failure
- ✅ Users get best model for their needs
- ✅ Competitive pricing options

---

## ADR-004: Socket.IO for Real-time

**Status**: Accepted

**Context**: Chat requires real-time message delivery, typing indicators, and presence.

**Decision**: Use Socket.IO.

**Rationale**:
- WebSocket with automatic fallback (long-polling)
- Built-in room support
- Event-based API (matches chat domain)
- Reconnection handling
- Wide ecosystem

**Trade-offs**:
- ❌ In-memory state (doesn't scale horizontally without Redis)
- ❌ Protocol overhead vs raw WebSocket
- ✅ Faster development
- ✅ Better developer experience
- ✅ Automatic reconnection

**Alternatives Considered**:
- Raw WebSocket: More performant, but more code
- Server-Sent Events: One-way only, need separate POST for sending
- Pusher/Ably: Managed service, but cost and vendor lock-in

---

## ADR-005: JWT + Refresh Token Auth

**Status**: Accepted

**Context**: Users need persistent sessions across page refreshes.

**Decision**: JWT access tokens (15 min) + httpOnly refresh tokens (7 days).

**Rationale**:
- Stateless authentication (no server-side session store)
- Access token in memory/localStorage for API calls
- Refresh token in httpOnly cookie (XSS-resistant)
- Token rotation on refresh prevents replay attacks

**Trade-offs**:
- ❌ Token size larger than session ID
- ❌ Can't revoke tokens (until expiry)
- ✅ No server-side session store needed
- ✅ Works across multiple servers
- ✅ Mobile-friendly

**Alternatives Considered**:
- Session-based: Requires server-side store (Redis)
- OAuth-only: Limited to Google users
- Magic links: Good for passwordless, but email dependency

---

## ADR-006: Framer Motion for Animations

**Status**: Accepted

**Context**: UI needs smooth animations for page transitions, modals, and interactions.

**Decision**: Use Framer Motion.

**Rationale**:
- Declarative API (matches React paradigm)
- Layout animations (shared elements)
- Gesture support (drag, hover, tap)
- Exit animations (AnimatePresence)
- Spring physics (natural feel)

**Trade-offs**:
- ❌ ~50KB bundle size
- ❌ Learning curve for advanced features
- ✅ Production-ready animations
- ✅ Accessibility-aware (respects prefers-reduced-motion)
- ✅ Active maintenance

**Alternatives Considered**:
- CSS animations: Limited (no exit animations, no layout)
- GSAP: More powerful, but imperative API
- React Spring: Similar, but less maintained

---

## ADR-007: Tailwind CSS for Styling

**Status**: Accepted

**Context**: Need a consistent, maintainable styling system.

**Decision**: Use Tailwind CSS.

**Rationale**:
- Utility-first (no CSS conflicts)
- Purges unused classes (small production bundle)
- Responsive design built-in
- Dark mode support
- Custom theme system

**Trade-offs**:
- ❌ Verbose JSX (many classes)
- ❌ Requires build step
- ✅ No CSS naming conflicts
- ✅ Consistent design system
- ✅ Fast prototyping

**Alternatives Considered**:
- CSS Modules: Scoped, but more boilerplate
- Styled Components: CSS-in-JS, but runtime overhead
- Vanilla CSS: Simple, but hard to maintain at scale

---

## ADR-008: Monolithic Backend

**Status**: Accepted

**Context**: Backend needs to handle API, WebSocket, and AI requests.

**Decision**: Single Express.js server with all routes.

**Rationale**:
- Simple deployment (single process)
- Easy development (one codebase)
- Shared state (Socket.IO rooms)
- Low operational complexity

**Trade-offs**:
- ❌ Single point of failure
- ❌ Can't scale individual services
- ✅ Simple to develop and deploy
- ✅ Low latency (in-process calls)
- ✅ Easy debugging

**Future**: May extract AI gateway to separate service for scaling.

---

## ADR-009: Vitest for Frontend Testing

**Status**: Accepted

**Context**: Need a test runner for React components and utilities.

**Decision**: Use Vitest.

**Rationale**:
- Native Vite integration (fast)
- Compatible with Jest API
- TypeScript support out of the box
- jsdom environment for DOM testing
- Snapshot testing

**Trade-offs**:
- ❌ Smaller ecosystem than Jest
- ❌ Some Jest plugins incompatible
- ✅ Faster test execution
- ✅ Better Vite integration
- ✅ Modern API

---

## ADR-010: File-based Routing Convention

**Status**: Accepted

**Context**: Need a clear routing structure for the frontend.

**Decision**: Manual route definition in App.tsx with lazy loading.

**Rationale**:
- Explicit route definitions (clear what exists)
- Lazy loading per route (code splitting)
- Protected route wrapper (auth guard)
- Suspense boundaries for loading states

**Trade-offs**:
- ❌ Manual route registration
- ❌ No automatic code splitting
- ✅ Full control over routing
- ✅ Clear route hierarchy
- ✅ Easy to understand

**Alternatives Considered**:
- File-based routing (Next.js style): Requires framework switch
- React Router data loaders: More complexity than needed

---

## Decision Log

| ID | Decision | Status | Date |
|----|----------|--------|------|
| 001 | MongoDB over PostgreSQL | Accepted | 2024-01 |
| 002 | Zustand over Redux | Accepted | 2024-01 |
| 003 | Multi-Provider AI Gateway | Accepted | 2024-02 |
| 004 | Socket.IO for Real-time | Accepted | 2024-01 |
| 005 | JWT + Refresh Token Auth | Accepted | 2024-01 |
| 006 | Framer Motion for Animations | Accepted | 2024-01 |
| 007 | Tailwind CSS for Styling | Accepted | 2024-01 |
| 008 | Monolithic Backend | Accepted | 2024-01 |
| 009 | Vitest for Frontend Testing | Accepted | 2024-03 |
| 010 | File-based Routing Convention | Accepted | 2024-01 |
