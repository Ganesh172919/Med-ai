import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GoogleCallback from '../GoogleCallback';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../api/auth', () => ({
  exchangeGoogleCode: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import { exchangeGoogleCode } from '../../api/auth';
import toast from 'react-hot-toast';

describe('GoogleCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?code=test123']}>
        <GoogleCallback />
      </MemoryRouter>
    );
    expect(screen.getByText('Signing you in...')).toBeInTheDocument();
    expect(screen.getByText('Completing Google sign-in securely')).toBeInTheDocument();
  });

  it('redirects to login when error param is present', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?error=access_denied']}>
        <GoogleCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Google sign-in failed. Please try again.');
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('redirects to login when code is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback']}>
        <GoogleCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Authentication failed because the Google login code is missing.'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('calls exchangeGoogleCode with the code', async () => {
    vi.mocked(exchangeGoogleCode).mockResolvedValue({
      user: { username: 'test', displayName: 'Test' },
      accessToken: 'token123',
    });
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?code=authcode123']}>
        <GoogleCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(exchangeGoogleCode).toHaveBeenCalledWith('authcode123');
    });
  });

  it('shows welcome toast on success', async () => {
    vi.mocked(exchangeGoogleCode).mockResolvedValue({
      user: { username: 'alice', displayName: 'Alice' },
      accessToken: 'tok',
    });
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?code=code1']}>
        <GoogleCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Welcome, Alice!');
    });
  });

  it('navigates to dashboard on success', async () => {
    vi.mocked(exchangeGoogleCode).mockResolvedValue({
      user: { username: 'bob', displayName: 'Bob' },
      accessToken: 'tok',
    });
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?code=code2']}>
        <GoogleCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('shows error toast when exchange fails', async () => {
    vi.mocked(exchangeGoogleCode).mockRejectedValue(new Error('Network error'));
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?code=badcode']}>
        <GoogleCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Google sign-in could not be completed.');
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=google_exchange_failed', { replace: true });
    });
  });
});
