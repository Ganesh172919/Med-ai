import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from '../../store/authStore';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', username: 'alice' },
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateTokens: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Protected content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateTokens: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <p>Protected content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children when admin is required and user is admin', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', username: 'alice', isAdmin: true },
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateTokens: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin>
          <p>Admin content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('redirects to dashboard when admin is required but user is not admin', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', username: 'alice', isAdmin: false },
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateTokens: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute requireAdmin>
          <p>Admin content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('redirects to dashboard when admin is required but user has no isAdmin field', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', username: 'alice' },
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateTokens: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute requireAdmin>
          <p>Admin content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });
});
