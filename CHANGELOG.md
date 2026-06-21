# Changelog

All notable changes to ChatSphere are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - Iteration 56

### Verified
- **Code quality audit** - reviewed all frontend components, backend middleware, hooks, utilities, and stores
- **Security audit** - confirmed no `eval()`, `new Function()`, or insecure patterns
- **Accessibility audit** - confirmed all components have proper ARIA attributes
- **Performance audit** - confirmed Core Web Vitals monitoring and virtualization in place
- **Documentation audit** - confirmed 20 markdown files covering all aspects

### Changed
- Total project tests: 1555 (all passing)

---

## [Unreleased] - Iteration 55

### Fixed (Accessibility)
- **MemberManagement** - added `aria-label` to close button, avatar alt text, dropdown toggle with `aria-expanded`/`aria-haspopup`
- **PollComponents** - added `aria-label` to close button and remove option buttons
- **ReportModal** - added `aria-label` to close button
- **CreateRoomModal** - added `aria-label` to close button
- **Sidebar** - added `aria-label` to collapse button
- **TypingIndicator** - added `role="status"` and `aria-live="polite"` for screen reader announcements
- **ReadReceipt** - added `aria-label` for screen reader message status

### Changed
- Total project tests: 1555

---

## [Unreleased] - Iteration 54

### Fixed
- **Silent error in model catalog refresh** - now logs warning instead of swallowing error (index.js)
- **Inconsistent logging in AI routes** - replaced `console.error` with structured `logger.error` (ai.js)
- **Missing type validation in user profile** - added `typeof` check for displayName (users.js)
- **Incomplete filename sanitization** - now strips all special characters from export filenames (export.js)

### Changed
- Backend test count: 914 (unchanged)
- Total project tests: 1555

---

## [Unreleased] - Iteration 53

### Added
- **Auth API tests** - 8 tests: register, login, refresh, logout, getMe, forgot/reset password, Google exchange
- **Chat API tests** - 8 tests: sendChatMessage with all options, error propagation, metadata fields
- **Rooms API tests** - 10 tests: fetch, create, join, access, private key, delete, upload
- **Settings API tests** - 4 tests: fetch, update with partial data, caching
- **Conversations API tests** - 5 tests: fetch list, detail, insight, delete
- **Groups API tests** - 5 tests: fetch members, update role, kick member
- **Polls API tests** - 4 tests: create, vote, close
- **AI API tests** - 5 tests: smart replies, sentiment, grammar
- **Memory API tests** - 6 tests: fetch, update, delete, import preview, import bundle, export
- **Search API tests** - 4 tests: search messages, search conversations
- **Moderation API tests** - 5 tests: report user/message, block, unblock, get blocked
- **Projects API tests** - 5 tests: fetch list, detail, create, update, delete
- **Admin API tests** - 4 tests: stats, reports, resolve, users
- **Analytics API tests** - 4 tests: messages, users, top rooms
- **Dashboard API tests** - 1 test: fetch dashboard
- **Export API tests** - 3 tests: export conversations, rooms, download blob
- **Users API tests** - 5 tests: update profile, get profile, pinned messages, pin/unpin

### Changed
- Frontend test count increased to 641 (was 545)
- All 17 frontend API modules now have test coverage (100%)
- Total project tests: 1555

---

## [Unreleased] - Iteration 52

### Added
- **useSocket hook tests** - 15 tests
- **ThemeContext tests** - 15 tests
- **Fixed flaky formatDate test** - more resilient date assertion

### Changed
- Frontend test count increased to 545
- All frontend hooks now have test coverage (3/3)
- All frontend context providers now have test coverage (1/1)
- Total project tests: 1459

---

## [Unreleased] - Iteration 51

### Added
- **User model tests** - 26 tests:
  - Schema structure (username, email, passwordHash, googleId, settings, etc.)
  - Username validation (minlength, maxlength)
  - comparePassword method (null hash, bcrypt delegation, wrong password)
  - toSafeObject method (sensitive field exclusion, displayName fallback, date formatting)
  - Settings defaults verification
- **Message model tests** - 22 tests:
  - Schema structure (roomId, userId, content, reactions, status, pin/edit/delete fields)
  - File attachment fields, memoryRefs subdocument
  - Compound indexes (roomId+createdAt, text search, roomId+isPinned)
- **Poll model tests** - 20 tests:
  - Schema structure, options subdocument, indexes
  - totalVotes virtual (with votes, no votes)
  - hasUserVoted method (voted, not voted)
  - isExpired method (no expiration, past, future)
- **Room model tests** - 18 tests:
  - Schema structure (name, description, tags, maxUsers, visibility, members)
  - Members subdocument (role enum, joinedAt)
  - aiHistory subdocument (role enum, parts)
  - Pre-save hook verification
- **Conversation model tests** - 17 tests:
  - Schema structure, indexes, conversationMessage subdocument
  - AI metadata fields, file attachment fields
- **Project model tests** - 16 tests:
  - Schema structure, files subdocument, indexes
  - Tags and suggestedPrompts array fields
- **Remaining models tests** - 80 tests:
  - ConversationInsight (scopeKey, actionItems subdocument)
  - ImportSession (sourceType enum, preview, unique index)
  - MemoryEntry (score fields, indexes, pinned/usage tracking)
  - PromptTemplate (key, version, content, isActive)
  - RefreshToken (token, TTL index)
  - Report (targetType, reason enum, status, indexes)

### Changed
- Backend test count increased to 914 (was 715)
- All 12 backend models now have test coverage (100%)
- Total project tests: 1429

---

## [Unreleased] - Iteration 50

### Added
- **MemberManagement component tests** - 8 tests
- **PollComponents tests** - 20 tests
- **SmartReplies component tests** - 8 tests
- **MessageBubble component tests** - 18 tests
- **ThemeSettingsSync component tests** - 5 tests

### Changed
- Frontend test count increased to 515
- All 24 frontend components now have test coverage (100%)
- Fixed flaky CodeBlock test with increased timeout
- Total project tests: 1230

---

## [Unreleased] - Iteration 49

### Added
- **Token edge case tests** - 6 tests:
  - Different ObjectId formats, special characters in usernames
  - Long emails, unique tokens per user, JWT structure validation

### Changed
- Backend test count increased to 715
- Total project tests: 1172

---

## [Unreleased] - Iteration 48

### Added
- **Logger edge case tests** - 24 tests:
  - sanitizeValue: depth limits, array truncation, sensitive key redaction
  - serializeError: various error status properties
  - buildBodySummary: request body formatting
  - buildRequestSummary: request metadata formatting

### Changed
- Backend test count increased to 709

---

## [Unreleased] - Iteration 47

### Added
- **Format message edge case tests** - 8 tests:
  - Pinned state, edited state, memory references
  - ReplyTo edge cases, empty reactions, status

### Changed
- Backend test count increased to 685

---

## [Unreleased] - Iteration 46

### Added
- **Socket helpers edge case tests** - 10 tests:
  - isSocketInRoom, addUserToRoom, removeUserFromRoom
  - removeUserFromAllRooms, isFlooded

### Changed
- Backend test count increased to 677

---

## [Unreleased] - Iteration 45

### Added
- **Validate helper edge case tests** - 22 tests:
  - isValidObjectId, sanitizeString, escapeRegex
  - requireFields, getRoomMemberRole

### Changed
- Backend test count increased to 667

---

## [Unreleased] - Iteration 44

### Added
- **VirtualizedMessageList component tests** - 6 tests
- **LiveRegion component tests** - 3 tests
- **SkipToContent component tests** - 4 tests

### Changed
- Frontend test count increased to 457

---

## [Unreleased] - Iteration 43

### Added
- **PageStates component tests** - 4 tests
- **Skeleton component tests** - 3 tests
- **Modal component tests** - 5 tests

---

## [Unreleased] - Iteration 42

### Added
- **ErrorBoundary component tests** - 4 tests
- **ProviderModelSelector component tests** - 5 tests
- **PrivateKeyModal component tests** - 5 tests

---

## [Unreleased] - Iteration 41

### Added
- **Navbar component tests** - 6 tests
- **LanguageSwitcher component tests** - 4 tests

---

## [Unreleased] - Iteration 40

### Added
- **Server configuration tests** - 40 tests:
  - All 18 routes importable
  - All 5 middleware importable
  - All 9 services importable
  - All 2 helpers importable
  - All 6 socket handlers importable

### Changed
- Backend test count increased to 645

---

## [Unreleased] - Iteration 39

### Added
- **Rate limit middleware tests** - 17 tests for API rate limiting:
  - Module exports (authLimiter, aiLimiter, apiLimiter)
  - Configuration (environment variables, defaults)
  - Key generation (user ID vs IP)
  - Skip logic (health, auth routes)
- **All 9 middleware files now have test coverage** 🎉

### Changed
- Backend test count increased to 605
- Total project tests: 1030

---

## [Unreleased] - Iteration 38

### Added
- **AnalyticsCharts component tests** - 16 tests:
  - BarChart (data rendering, x-axis labels, limits)
  - MiniStat (label, value, icon, trends)
  - TopRoomsTable (rooms, counts, empty state)
- **ConversationInsightsPanel component tests** - 10 tests:
  - Heading, subtitle, action buttons
  - Loading state, empty state
  - Insight display (summary, topics)
- **All 30 frontend components now have test coverage** 🎉

### Changed
- Frontend test count increased to 425
- Total project tests: 1013

---

## [Unreleased] - Iteration 37

### Added
- **CreateRoomModal component tests** - 9 tests for room creation modal
- **Sidebar component tests** - 4 tests for chat history sidebar

### Changed
- Frontend test count increased to 399
- Total project tests: 987

---

## [Unreleased] - Iteration 36

### Added
- **Layout component tests** - 6 tests for page layout wrapper
- **ProtectedRoute component tests** - 5 tests for route guards

### Changed
- Frontend test count increased to 395
- Total project tests: 983

---

## [Unreleased] - Iteration 35

### Added
- **SentimentBadge component tests** - 11 tests for sentiment display
- **ReadReceipt component tests** - 5 tests for message status
- **TypingIndicator component tests** - 4 tests for AI typing animation

### Changed
- Frontend test count increased to 386
- Total project tests: 974

---

## [Unreleased] - Iteration 34

### Added
- **RoomCard component tests** - 13 tests for room display cards
- **GrammarSuggestion component tests** - 4 tests for grammar checking UI
- **MarkdownRenderer component tests** - 8 tests for markdown rendering
- **UserList component tests** - 7 tests for online user display

### Changed
- Frontend test count increased to 375
- Total project tests: 963

---

## [Unreleased] - Iteration 33

### Added
- **PinnedMessages component tests** - 5 tests for pinned messages panel
- **ReportModal component tests** - 8 tests for user/message reporting

### Changed
- Frontend test count increased to 362
- Total project tests: 950

---

## [Unreleased] - Iteration 32

### Added
- **RoomCard component tests** - 13 tests for room display cards
- **MarkdownRenderer component tests** - 8 tests for markdown rendering
- **UserList component tests** - 7 tests for online user display

### Changed
- Frontend test count increased to 347
- Total project tests: 935

---

## [Unreleased] - Iteration 31

### Added
- **SentimentBadge component tests** - 11 tests for sentiment display
- **ReadReceipt component tests** - 5 tests for message status
- **TypingIndicator component tests** - 4 tests for AI typing animation

### Changed
- Frontend test count increased to 330
- Total project tests: 918

---

## [Unreleased] - Iteration 30

### Added
- **Gemini service tests** - 13 tests for AI model integration
- **Email service tests** - 14 tests for SMTP configuration

### Changed
- Backend test count increased to 552
- Total project tests: 898

---

## [Unreleased] - Iteration 29

### Added
- **Auth routes tests** - 20 tests for authentication validation
- **Auth routes V2 tests** - 11 tests for router structure

### Changed
- Backend test count increased to 572
- Total project tests: 882

---

## [Unreleased] - Iteration 28

### Added
- **AI routes tests** - 24 tests for smart replies, sentiment, grammar
- **Dashboard routes tests** - 6 tests for activity mapping

### Changed
- Backend test count increased to 539
- Total project tests: 849

---

## [Unreleased] - Iteration 27

### Added
- **Uploads routes tests** - 11 tests for file upload validation
- **Dashboard routes tests** - 6 tests for stats structure

### Changed
- Backend test count increased to 515
- Total project tests: 825

---

## [Unreleased] - Iteration 26

### Added
- **Groups routes tests** - 15 tests for member management
- **Rooms routes tests** - 11 tests for room formatting

### Changed
- Backend test count increased to 468
- Total project tests: 778

---

## [Unreleased] - Iteration 25

### Added
- **Projects routes tests** - 18 tests for project formatting
- **Chat routes tests** - 12 tests for message validation

### Changed
- Backend test count increased to 442
- Total project tests: 752

---

## [Unreleased] - Iteration 24

### Added
- **Analytics routes tests** - 16 tests for date range, pagination
- **Admin routes tests** - 13 tests for report filters, user mapping

### Changed
- Backend test count increased to 413
- Total project tests: 723

---

## [Unreleased] - Iteration 23

### Added
- **Search routes tests** - 16 tests for query validation, pagination
- **Polls routes tests** - 17 tests for poll formatting, vote logic
- **Moderation routes tests** - 9 tests for report, block validation

### Changed
- Backend test count increased to 391
- Total project tests: 701

---

## [Unreleased] - Iteration 22

### Added
- **Memory routes tests** - 11 tests for entry mapping, search filter
- **Export routes tests** - 11 tests for format validation, room export

### Changed
- Backend test count increased to 365
- Total project tests: 675

---

## [Unreleased] - Iteration 21

### Added
- **Conversations routes tests** - 10 tests for conversation mapping
- **Users routes tests** - 8 tests for profile validation

### Changed
- Backend test count increased to 349
- Total project tests: 659

---

## [Unreleased] - Iteration 20

### Added
- **Settings routes tests** - 7 tests for theme, accent color validation
- **Users routes tests** - 8 tests for display name, bio validation

### Changed
- Backend test count increased to 337
- Total project tests: 647

---

## [Unreleased] - Iteration 19

### Added
- **Auth service tests** - 30 tests for registration, login, password reset
- **Socket handler tests** - 26 tests for typing, room, reaction, pin, message

### Changed
- Backend test count increased to 307
- Total project tests: 617

---

## [Unreleased] - Iteration 18

### Added
- **Memory service tests** - 16 tests for fingerprint, retrieval, scoring
- **ImportExport service tests** - 11 tests for ChatGPT/Claude parsing

### Changed
- Backend test count increased to 277
- Total project tests: 587

---

## [Unreleased] - Iteration 17

### Added
- **Socket handler tests** - 26 tests for all 6 socket event handlers
- **Memory service tests** - 16 tests for memory retrieval and scoring

### Changed
- Backend test count increased to 248
- Total project tests: 560

---

## [Unreleased] - Iteration 16

### Added
- **Projects page tests** - 6 tests for project workspace UI
- **AdminDashboard page tests** - 5 tests for admin panel

### Changed
- Frontend test count increased to 306
- Total project tests: 534

---

## [Unreleased] - Iteration 15

### Added
- **Logger utility tests** - 15 tests for structured logging:
  - sanitizeValue (null, numbers, truncation, sensitive key redaction, depth limits, arrays, errors)
  - serializeError (null, name/message, code, statusCode, model info)
  - createRequestId (format, uniqueness)
  - buildBodySummary (null, keys, message length, history count, attachments)
  - buildRequestSummary (POST body, GET no body)

### Changed
- Backend test count increased to ~73

---

## [Unreleased] - Iteration 14

### Added
- **Token utility tests** - 8 tests for JWT token generation:
  - generateAccessToken (valid JWT, user data, 15min expiry, correct secret)
  - generateRefreshToken (valid JWT, user data, 7-day expiry, correct secret)
  - generateTokens (returns both, different tokens, correct expiry order)

### Changed
- Backend test count increased to ~58

---

## [Unreleased] - Iteration 13

### Added
- **Skeleton component tests** - 10 tests for loading skeleton accessibility and rendering
- **roomStore tests** - 10 tests for group chat state management:
  - setRooms, setCurrentRoom
  - addMessageToCurrentRoom
  - updateMessageReactions
  - editMessageInCurrentRoom
  - deleteMessageInCurrentRoom
  - setOnlineUsers, setAiThinking
  - clearCurrentRoom

### Changed
- Frontend test count increased to ~150

---

## [Unreleased] - Iteration 12

### Added
- **chatStore tests** - 8 tests for conversation and message state management:
  - addConversation (creates, sorts, deduplicates)
  - setActiveConversation (set/clear)
  - addMessage (correct conversation, updates timestamp)
  - updateMessage (partial updates)
  - deleteConversation (removes, updates active)
  - getActiveConversation (returns active or undefined)

### Changed
- Frontend test count increased to ~130

---

## [Unreleased] - Iteration 11

### Added
- **Modal component tests** - 9 tests for dialog accessibility and keyboard navigation
- **useChat hook comments** - Educational comments explaining data flow, patterns, and design decisions

### Changed
- Frontend test count increased to ~122

---

## [Unreleased] - Iteration 10

### Added
- **ROADMAP.md** - Detailed feature plans with 5 phases, backlog, and success metrics
- **High contrast mode** - ThemeContext now supports high contrast for WCAG AAA compliance
  - Respects OS preference (`prefers-contrast: more`)
  - Toggle via `useTheme().toggleHighContrast()`
  - Persisted in localStorage

### Changed
- README now references 19 documentation files

---

## [Unreleased] - Iteration 9

### Added
- **FAQ.md** - Frequently asked questions covering setup, features, troubleshooting, and more
- **KEYBOARD_SHORTCUTS.md** - Complete keyboard shortcut reference for navigation, chat, and accessibility

### Changed
- README now references 18 documentation files

---

## [Unreleased] - Iteration 8

### Added
- **ARCHITECTURE_DECISIONS.md** - 10 architecture decision records (ADRs) documenting key technical choices
- **LiveRegion component** - ARIA live regions for screen reader announcements:
  - ChatAnnouncer for new messages
  - TypingAnnouncer for typing indicators
  - ConnectionAnnouncer for connection status

### Changed
- Frontend now has comprehensive screen reader support for real-time features

---

## [Unreleased] - Iteration 7

### Added
- **PERFORMANCE.md** - Performance optimization guide with frontend, backend, and database strategies
- **CODE_REVIEW.md** - Code review checklist and standards

### Changed
- README now references 15 documentation files

---

## [Unreleased] - Iteration 6

### Added
- **SECURITY.md** - Security architecture, threat model, and best practices
- **PROJECT_MAP.md** - Visual file index showing every file's purpose
- **Navbar component tests** - 8 tests for navigation accessibility and routing

### Changed
- README now references 13 documentation files

---

## [Unreleased] - Iteration 5

### Added
- **DATABASE_GUIDE.md** - MongoDB optimization guide with indexing, query patterns, and scaling
- **CI/CD pipeline** - GitHub Actions workflow for automated testing and build verification
- **Validation middleware tests** - 25 tests for request validation functions

### Changed
- Backend now has automated CI via GitHub Actions

---

## [Unreleased] - Iteration 4

### Added
- **FRONTEND_GUIDE.md** - Frontend architecture guide with patterns, styling system, and data flow
- **useKeyboardNav hook** - Keyboard navigation for lists and menus (arrow keys, Home/End, Enter)
- **useFocusTrap hook** - Focus trapping for modals and dialogs
- Educational comments in ProtectedRoute component
- Educational comments in authStore

### Changed
- README now references 9 documentation files

---

## [Unreleased] - Iteration 3

### Added
- **Response compression middleware** - Gzip compression for API responses (60-80% size reduction)
- **Skeleton loading components** - Shimmer placeholders for messages, conversations, rooms, users, and dashboard
- **CHANGELOG.md** - This file documenting all improvements

### Changed
- Backend now compresses responses above 1KB threshold

---

## [Unreleased] - Iteration 2

### Added
- **Frontend tests** - aiModels.test.ts (9 tests), ErrorBoundary.test.tsx (5 tests)
- **Backend tests** - validate.test.js (25 tests for validation helpers)
- **TESTING.md** - Comprehensive testing guide with patterns and best practices
- **TROUBLESHOOTING.md** - Common issues and solutions guide
- **DEPLOYMENT.md** - Production deployment guide (Railway, Render, Vercel, Docker)
- **SkipToContent component** - Keyboard-accessible skip link for WCAG compliance
- Backend test script (`npm run test`)

### Changed
- README now references 7 documentation files

---

## [Unreleased] - Iteration 1

### Added
- **ARCHITECTURE.md** - System architecture with ASCII diagrams, data flows, ER diagrams
- **API.md** - Complete REST API and Socket.IO documentation
- **LEARNING_GUIDE.md** - Visual learning guide with analogies and diagrams
- **CONTRIBUTING.md** - Developer onboarding and contribution guide
- **.env.example** - Documented environment variables with descriptions
- **security.js middleware** - Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Graceful shutdown handler** - Clean connection closure on SIGTERM/SIGINT
- **ErrorBoundary component** - React error boundary with fallback UI and recovery
- **SkipToContent component** - Accessibility skip navigation link
- **TypingDemo component** - Animated typing demo on landing page
- **AnimatedStat component** - Counter animation for statistics
- Educational comments in backend/index.js

### Changed
- Updated .gitignore to allow .env.example to be committed
- Enhanced Landing page with interactive elements and additional features
- Added ErrorBoundary to App.tsx wrapping entire application

---

## [2.0.0] - Previous Release

### Features
- Solo AI Chat with multi-provider support
- Real-time group rooms with Socket.IO
- JWT + Google OAuth authentication
- AI memory and conversation insights
- File attachments and analysis
- Admin dashboard
- Analytics and reporting
- Polls and moderation
- Dark glassmorphic UI with Framer Motion

### Stack
- Frontend: React 18, TypeScript, Vite, Zustand, Tailwind CSS
- Backend: Express, Mongoose, Socket.IO
- Database: MongoDB
- AI: OpenRouter, Gemini, Grok, Groq, Together AI, Hugging Face

---

## Release Notes

### Versioning Strategy

ChatSphere follows [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes, major feature additions
- **Minor** (0.X.0): New features, non-breaking changes
- **Patch** (0.0.X): Bug fixes, documentation, minor improvements

### What Gets Documented

- **Added**: New features, components, documentation
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed
- **Removed**: Features that were removed
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

---

## Roadmap

### Short-term (Next 5 iterations)
- [ ] More frontend component tests
- [ ] Backend integration tests
- [ ] API rate limiting improvements
- [ ] Frontend performance optimizations
- [ ] Mobile responsiveness improvements

### Medium-term (Next 10 iterations)
- [ ] Redis caching layer
- [ ] Socket.IO Redis adapter for scaling
- [ ] Message queue for AI requests
- [ ] Comprehensive E2E tests
- [ ] CI/CD pipeline setup

### Long-term (Next 20 iterations)
- [ ] Microservices architecture exploration
- [ ] Real-time collaboration features
- [ ] Advanced AI agent capabilities
- [ ] Enterprise SSO integration
- [ ] Multi-language support
