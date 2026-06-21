import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Login from '../Login';

vi.mock('../../api/auth', () => ({ loginUser: vi.fn() }));
vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ login: vi.fn() }),
}));

import { loginUser } from '../../api/auth';

function renderLogin(route = '/login') {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[route]}>
        <Login />
      </MemoryRouter>
    </I18nProvider>
  );
}

describe('Login page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the login form with heading', () => {
    renderLogin();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue your conversations')).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders Google sign-in button', () => {
    renderLogin();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('renders the ChatSphere brand link', () => {
    renderLogin();
    expect(screen.getByText('ChatSphere')).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    renderLogin();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('renders create account link', () => {
    renderLogin();
    expect(screen.getByText('Create one')).toBeInTheDocument();
  });

  it('allows typing in email and password fields', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('toggles password visibility', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = passwordInput.parentElement!.querySelector('button[type="button"]')!;
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submits login form with credentials', async () => {
    vi.mocked(loginUser).mockResolvedValue({
      user: { username: 'testuser', email: 'test@example.com' },
      accessToken: 'token123',
    } as any);

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
