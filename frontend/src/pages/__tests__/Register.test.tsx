import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Register from '../Register';

vi.mock('../../api/auth', () => ({ registerUser: vi.fn() }));
vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ login: vi.fn() }),
}));

import { registerUser } from '../../api/auth';

function renderRegister() {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/register']}>
        <Register />
      </MemoryRouter>
    </I18nProvider>
  );
}

describe('Register page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the registration form heading', () => {
    renderRegister();
    expect(screen.getByText('Create account')).toBeInTheDocument();
    expect(screen.getByText('Join the thinking revolution')).toBeInTheDocument();
  });

  it('renders all form inputs', () => {
    renderRegister();
    expect(screen.getByPlaceholderText('thinker_42')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    // Password and confirm password both use ••••••••
    expect(screen.getAllByPlaceholderText('••••••••').length).toBe(2);
  });

  it('renders Google sign-up button', () => {
    renderRegister();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    renderRegister();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('allows typing in all form fields', () => {
    renderRegister();
    const usernameInput = screen.getByPlaceholderText('thinker_42');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'Password1!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password1!' } });

    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInputs[0]).toHaveValue('Password1!');
    expect(passwordInputs[1]).toHaveValue('Password1!');
  });

  it('shows password strength indicators when typing', () => {
    renderRegister();
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(passwordInputs[0], { target: { value: 'Ab1!' } });

    expect(screen.getByText('6+ characters')).toBeInTheDocument();
    expect(screen.getByText('Uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('Number')).toBeInTheDocument();
    expect(screen.getByText('Special character')).toBeInTheDocument();
  });

  it('shows mismatch warning when passwords differ', () => {
    renderRegister();
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'Password1!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Different1!' } });

    expect(screen.getByText(/don't match/i)).toBeInTheDocument();
  });

  it('submits registration form', async () => {
    vi.mocked(registerUser).mockResolvedValue({
      user: { username: 'testuser', email: 'test@example.com' },
      accessToken: 'token123',
    } as any);

    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('thinker_42'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'Password1!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password1!' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith('testuser', 'test@example.com', 'Password1!');
    });
  });
});
