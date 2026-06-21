import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../ForgotPassword';

vi.mock('../../api/auth', () => ({
  forgotPassword: vi.fn(),
}));

import { forgotPassword } from '../../api/auth';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <ForgotPassword />
    </MemoryRouter>
  );
}

describe('ForgotPassword page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the form heading', () => {
    renderPage();
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
  });

  it('renders the email input', () => {
    renderPage();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderPage();
    expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
  });

  it('renders back to login link', () => {
    renderPage();
    expect(screen.getByText(/Back to Login/)).toBeInTheDocument();
  });

  it('allows typing in email field', () => {
    renderPage();
    const input = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input).toHaveValue('test@example.com');
  });

  it('submits the form and shows success state', async () => {
    vi.mocked(forgotPassword).mockResolvedValue(undefined);
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Check your email/)).toBeInTheDocument();
    });
  });

  it('shows email in success message', async () => {
    vi.mocked(forgotPassword).mockResolvedValue(undefined);
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'alice@test.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    });
  });
});
