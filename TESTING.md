# ChatSphere Testing Guide

## Overview

ChatSphere uses:
- **Frontend**: Vitest + React Testing Library
- **Backend**: Jest (planned)

---

## Frontend Tests

### Running Tests

```powershell
cd frontend

# Run all tests once
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage
npm run test -- --coverage
```

### Test File Locations

```
frontend/src/
├── utils/__tests__/
│   ├── format.test.ts        # Date/time formatting
│   ├── errors.test.ts        # Error message extraction
│   └── aiModels.test.ts      # AI model grouping
├── store/__tests__/
│   └── authStore.test.ts     # Auth state management
└── components/__tests__/
    └── ErrorBoundary.test.tsx # Error boundary component
```

### Writing Tests

#### Component Tests

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Utility Tests

```ts
import { describe, it, expect } from 'vitest';
import { myUtility } from '../myUtility';

describe('myUtility', () => {
  it('handles normal input', () => {
    expect(myUtility('input')).toBe('output');
  });

  it('handles edge cases', () => {
    expect(myUtility(null)).toBe('');
    expect(myUtility('')).toBe('');
  });
});
```

### Testing Patterns

#### Testing Async Operations

```tsx
import { render, screen, waitFor } from '@testing-library/react';

it('loads data asynchronously', async () => {
  render(<AsyncComponent />);

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

#### Testing Error States

```tsx
it('shows error message on failure', async () => {
  // Mock API to reject
  vi.mocked(apiCall).mockRejectedValue(new Error('API Error'));

  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText('API Error')).toBeInTheDocument();
  });
});
```

#### Testing with Context/Providers

```tsx
import { ThemeProvider } from '../context/ThemeContext';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
}

it('renders with theme', () => {
  renderWithProviders(<ThemedComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

---

## Backend Tests

### Running Tests

```powershell
cd backend

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Test File Locations

```
backend/
└── __tests__/
    └── validate.test.js  # Validation helper tests
```

### Writing Tests

```javascript
const { myFunction } = require('../helpers/myHelper');

describe('myFunction', () => {
  it('handles normal input', () => {
    expect(myFunction('input')).toBe('output');
  });

  it('handles edge cases', () => {
    expect(myFunction(null)).toBe('');
  });
});
```

---

## Test Coverage

### Current Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| `utils/format` | 8 | High |
| `utils/errors` | 5 | High |
| `utils/aiModels` | 9 | High |
| `store/authStore` | 3 | Medium |
| `components/ErrorBoundary` | 5 | High |
| `helpers/validate` | 25 | High |

### Coverage Goals

- **Unit tests**: All utility functions
- **Component tests**: All interactive components
- **Integration tests**: API endpoints
- **E2E tests**: Critical user flows (future)

---

## Best Practices

### DO

- Test behavior, not implementation
- Use descriptive test names
- Test edge cases and error states
- Mock external dependencies
- Keep tests independent

### DON'T

- Test implementation details
- Write tests that depend on other tests
- Mock everything (test real behavior when possible)
- Skip error state testing
- Leave console.log in tests

---

## Continuous Integration

### GitHub Actions (Recommended)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd frontend && npm ci && npm test
      - run: cd backend && npm ci && npm test
```

---

## Debugging Tests

### Frontend

```powershell
# Run specific test file
npm run test -- format.test.ts

# Run tests matching pattern
npm run test -- --grep "formatDate"

# Debug in browser
# Add debug() from @testing-library/react
import { debug } from '@testing-library/react';
render(<Component />);
debug(); // Prints DOM to console
```

### Backend

```powershell
# Run specific test file
npx jest validate.test.js

# Run with verbose output
npx jest --verbose
```
