import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';

vi.mock('../../api/auth', () => ({
  resetPassword: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import { resetPassword } from '../../api/auth';
import toast from 'react-hot-toast';

function renderWithToken(token = 'abc123', email = 'test@example.com') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}&email=${email}`]}>
      <ResetPassword />
    </MemoryRouter>
  );
}

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows invalid reset link when token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );
    expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument();
  });

  it('shows invalid reset link when email is missing', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <ResetPassword />
      </MemoryRouter>
    );
    expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument();
  });

  it('renders reset form when token and email are present', () => {
    renderWithToken();
    expect(screen.getByText('Set New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
  });

  it('displays email in the form', () => {
    renderWithToken('tok', 'user@test.com');
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
  });

  it('shows request new reset link when invalid', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>
    );
    expect(screen.getByText(/Request New Reset Link/)).toBeInTheDocument();
  });

  it('shows back to login link', () => {
    renderWithToken();
    expect(screen.getByText(/Back to Login/)).toBeInTheDocument();
  });

  it('shows reset button', () => {
    renderWithToken();
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
  });
});
