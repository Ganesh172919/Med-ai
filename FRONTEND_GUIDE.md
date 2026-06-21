# ChatSphere Frontend Architecture Guide

## Overview

The frontend is a React 18 SPA built with TypeScript, Vite, Zustand, and Tailwind CSS.

---

## Tech Stack

| Technology | Purpose | Why chosen |
|------------|---------|------------|
| React 18 | UI library | Industry standard, large ecosystem |
| TypeScript | Type safety | Catches bugs at compile time |
| Vite | Build tool | Fast HMR, ESM-native |
| Zustand | State management | Minimal boilerplate, no providers |
| Tailwind CSS | Styling | Utility-first, no CSS conflicts |
| Framer Motion | Animations | Declarative, performant |
| React Router 7 | Routing | File-based, lazy loading |
| Socket.IO Client | Real-time | WebSocket with fallback |
| Axios | HTTP client | Interceptors, request cancellation |
| Lucide React | Icons | Tree-shakeable, consistent |

---

## Directory Structure

```
frontend/src/
├── api/                    # API client layer
│   ├── axios.ts            # Base Axios instance + interceptors
│   ├── auth.ts             # Auth endpoints
│   ├── chat.ts             # Solo chat endpoints
│   ├── rooms.ts            # Room management
│   └── ...                 # Domain-specific APIs
│
├── components/             # Reusable UI components
│   ├── Navbar.tsx          # Top navigation
│   ├── Modal.tsx           # Dialog component
│   ├── MessageBubble.tsx   # Chat message display
│   ├── ErrorBoundary.tsx   # Error catching
│   ├── Skeleton.tsx        # Loading placeholders
│   └── ...                 # Other UI components
│
├── context/                # React Context providers
│   └── ThemeContext.tsx     # Theme management
│
├── hooks/                  # Custom React hooks
│   ├── useChat.ts          # Solo chat logic
│   └── useSocket.ts        # Socket.IO connection
│
├── pages/                  # Route-level pages
│   ├── Landing.tsx         # Public landing page
│   ├── SoloChat.tsx        # AI chat interface
│   ├── GroupChat.tsx       # Room chat interface
│   └── ...                 # Other pages
│
├── store/                  # Zustand state stores
│   ├── authStore.ts        # Authentication state
│   ├── chatStore.ts        # Chat conversations
│   └── roomStore.ts        # Room state
│
├── types/                  # TypeScript types
│   └── chat.ts             # Chat-related types
│
└── utils/                  # Utility functions
    ├── aiModels.ts         # Model grouping logic
    ├── errors.ts           # Error handling
    └── format.ts           # Date/text formatting
```

---

## Key Patterns

### 1. Component Pattern

```tsx
// PascalCase filename, default export
// Props interface defined above component
interface MyComponentProps {
  title: string;
  onSelect: (id: string) => void;
}

export default function MyComponent({ title, onSelect }: MyComponentProps) {
  return <div>{title}</div>;
}
```

### 2. State Management (Zustand)

```ts
// store/chatStore.ts
import { create } from 'zustand';

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  setActiveId: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeId: null,
  setActiveId: (id) => set({ activeId: id }),
}));
```

**Why Zustand over Redux:**
- No boilerplate (no actions, reducers, dispatch)
- No Provider wrapper needed
- Works outside React (in Socket.IO handlers)
- Smaller bundle size

### 3. API Layer

```ts
// api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Send cookies
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh, retry request
    }
    return Promise.reject(error);
  }
);
```

### 4. Custom Hooks

```ts
// hooks/useChat.ts
export function useChat() {
  const { conversations, activeId } = useChatStore();

  const sendMessage = async (content: string, options?: SendMessageOptions) => {
    // API call, update store, handle errors
  };

  return { sendMessage, isLoading, conversations };
}
```

### 5. Lazy Loading

```tsx
// App.tsx
const SoloChat = lazy(() => import('./pages/SoloChat'));

// Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/chat" element={<SoloChat />} />
  </Routes>
</Suspense>
```

---

## Styling System

### Tailwind CSS Classes

```tsx
// Layout
<div className="flex items-center justify-between gap-4">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Typography
<h1 className="font-display text-2xl font-semibold text-white">
<p className="text-sm text-gray-400 leading-relaxed">

// Colors (custom theme)
<div className="bg-navy-900 text-white">
<span className="text-neon-purple">

// Responsive
<div className="hidden sm:block lg:flex">
```

### Glassmorphism Pattern

```tsx
<div className="
  bg-navy-800/60           /* Semi-transparent background */
  backdrop-blur-xl          /* Blur effect */
  border border-navy-700/50 /* Subtle border */
  rounded-xl                /* Rounded corners */
  shadow-2xl shadow-black/30 /* Shadow */
">
```

### Animation Pattern

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

---

## Data Flow

### Solo Chat Flow

```
User Input → useChat.sendMessage() → POST /api/chat
    ↓
Response → chatStore.addMessage() → UI updates
    ↓
MessageBubble renders with MarkdownRenderer
```

### Real-time Room Flow

```
Socket.IO connect → useSocket hook
    ↓
join_room event → Server adds to room
    ↓
send_message → Server broadcasts → receive_message
    ↓
All clients update UI instantly
```

---

## Testing

### Component Tests

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Store Tests

```ts
import { useChatStore } from '../chatStore';

it('sets active conversation', () => {
  useChatStore.getState().setActiveId('conv-1');
  expect(useChatStore.getState().activeId).toBe('conv-1');
});
```

---

## Accessibility

### Built-in Support

- SkipToContent link for keyboard users
- ARIA labels on interactive elements
- Focus management in Modal
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatible

### Guidelines

```tsx
// Always add aria-label to icon buttons
<button aria-label="Close dialog">
  <X size={16} />
</button>

// Use semantic HTML
<nav role="navigation" aria-label="Main navigation">
<main id="main-content" tabIndex={-1}>

// Indicate state
<button aria-expanded={isOpen}>
<button aria-current={active ? 'page' : undefined}>
```

---

## Performance

### Code Splitting

- Lazy load all pages
- Dynamic imports for heavy components
- Separate vendor chunks

### Optimization

- Memoize expensive computations with `useMemo`
- Callback stabilization with `useCallback`
- Virtual lists for long message histories (future)

---

## Common Tasks

### Adding a New Page

1. Create `frontend/src/pages/MyPage.tsx`
2. Add lazy import in `App.tsx`
3. Add route in `<Routes>`
4. Add nav link in `Navbar.tsx`

### Adding a New API Endpoint

1. Add function in `frontend/src/api/myApi.ts`
2. Use in component or hook
3. Handle loading/error states

### Adding a New Store

1. Create `frontend/src/store/myStore.ts`
2. Define state interface
3. Create store with `create()`
4. Use in components with `useMyStore()`
