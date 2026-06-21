# Contributing to ChatSphere

Welcome! This guide will help you get started contributing to ChatSphere, whether you're fixing a bug, adding a feature, or improving documentation.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Testing](#testing)
- [Common Tasks](#common-tasks)

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **MongoDB** 6+ (local or Atlas)
- **Git**
- **npm** (comes with Node.js)

### Setup

```powershell
# 1. Clone the repository
git clone https://github.com/your-username/chatsphere.git
cd chatsphere

# 2. Backend setup
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and at least one AI provider key
npm install
npm run dev
# Backend runs on http://localhost:3000

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Verify Setup

```powershell
# Check backend health
curl http://localhost:3000/api/health

# Check frontend builds
cd frontend
npm run build

# Check backend syntax
cd backend
Get-ChildItem -Path . -Recurse -Filter *.js -File |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
  ForEach-Object { node --check $_.FullName }
```

---

## Project Structure

```
chatsphere/
├── backend/                    # Express + Socket.IO server
│   ├── config/                 # DB and Passport config
│   ├── controllers/            # Request handlers
│   ├── helpers/                # Utility functions
│   ├── middleware/              # Express/Socket middleware
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic
│   └── utils/                  # Token utilities
│
├── frontend/                   # React + TypeScript app
│   └── src/
│       ├── api/                # Axios API clients
│       ├── components/         # Reusable UI components
│       ├── context/            # React Context providers
│       ├── hooks/              # Custom hooks
│       ├── pages/              # Route-level pages
│       ├── store/              # Zustand stores
│       ├── types/              # TypeScript types
│       └── utils/              # Utility functions
│
└── docs/                       # Documentation
```

### Key Files

| File | Purpose |
|------|---------|
| `backend/index.js` | Server entry point, Socket.IO setup |
| `backend/services/gemini.js` | AI gateway (multi-provider routing) |
| `frontend/src/App.tsx` | Router and route definitions |
| `frontend/src/hooks/useChat.ts` | Solo chat logic |
| `frontend/src/store/chatStore.ts` | Chat state management |

---

## Development Workflow

### 1. Create a Branch

```powershell
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write code that follows the existing style
- Add comments for non-trivial logic
- Update types if adding new data structures

### 3. Test Your Changes

```powershell
# Frontend tests
cd frontend
npm run test

# Frontend build check
npm run build

# Backend syntax check
cd ../backend
node --check index.js
```

### 4. Commit and Push

```powershell
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

- Target the `main` branch
- Fill in the PR template
- Link related issues

---

## Code Style

### TypeScript/JavaScript

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JS/TS, double for JSX
- **Semicolons**: Yes
- **Line length**: 100 chars soft limit
- **Naming**:
  - Variables/functions: `camelCase`
  - Components: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case` for utils, `PascalCase` for components

### React Components

```tsx
// Good: Functional component with typed props
interface MyComponentProps {
  title: string;
  count?: number;
  onSelect: (id: string) => void;
}

export default function MyComponent({ title, count = 0, onSelect }: MyComponentProps) {
  return (
    <div className="...">
      <h2>{title}</h2>
      <span>{count}</span>
    </div>
  );
}
```

### Backend Routes

```javascript
// Good: Express route with validation
router.post('/endpoint', authMiddleware, async (req, res) => {
  try {
    const { field } = req.body;
    if (!field) {
      return res.status(400).json({ error: 'Field is required' });
    }

    const result = await someService(field);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Endpoint error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes nor adds |
| `test` | Adding/fixing tests |
| `chore` | Build process, tooling |

### Examples

```
feat(chat): add file attachment support to solo chat
fix(socket): prevent duplicate messages on reconnect
docs(readme): update setup instructions
refactor(ai): extract model resolution into separate module
test(auth): add login endpoint unit tests
```

---

## Pull Requests

### PR Template

```markdown
## What does this PR do?

Brief description of the change.

## Why is this needed?

Context or issue reference.

## How was this tested?

- [ ] Manual testing
- [ ] Unit tests added
- [ ] Build passes

## Screenshots (if UI changes)

[Add screenshots here]

## Checklist

- [ ] Code follows project style
- [ ] Self-reviewed the diff
- [ ] Comments added for complex logic
- [ ] Types updated if needed
- [ ] No console.log left in production code
```

### Review Guidelines

- **Be constructive**: Suggest improvements, don't just criticize
- **Ask questions**: "Why did you choose X over Y?" is better than "X is wrong"
- **Approve with nits**: Small style issues shouldn't block merging
- **Test locally**: Pull the branch and verify it works

---

## Testing

### Frontend Tests

```powershell
cd frontend

# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
```

### Writing Tests

```typescript
// Example: Component test
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders the title', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## Common Tasks

### Adding a New API Endpoint

1. Create route in `backend/routes/`
2. Add middleware if needed (auth, validation)
3. Create service function in `backend/services/`
4. Mount route in `backend/index.js`
5. Add frontend API client in `frontend/src/api/`

### Adding a New Page

1. Create page in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/Navbar.tsx`
4. Use `ProtectedRoute` if auth required

### Adding a New Model

1. Create schema in `backend/models/`
2. Add indexes for common queries
3. Export the model
4. Use in routes/services

### Adding a New Socket Event

1. Add handler in `backend/index.js` socket section
2. Add flood control check
3. Validate input
4. Emit response events
5. Add client listener in frontend hook

---

## Getting Help

- **Issues**: Check existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
