import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Profile from '../Profile';

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../../api/users', () => ({
  updateProfile: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import { useAuthStore } from '../../store/authStore';

const mockUser = {
  username: 'alice',
  email: 'alice@example.com',
  displayName: 'Alice W',
  bio: 'Test bio',
  avatar: null,
  authProvider: 'local',
  createdAt: '2024-01-15T00:00:00Z',
};

function renderProfile() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <Profile />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      setUser: vi.fn(),
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateTokens: vi.fn(),
    });
  });

  it('renders the page title', () => {
    renderProfile();
    expect(screen.getByText('My Profile')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderProfile();
    expect(screen.getByText('Customize your appearance and information')).toBeInTheDocument();
  });

  it('shows back to dashboard link', () => {
    renderProfile();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  it('shows display name input with user value', () => {
    renderProfile();
    const input = screen.getByPlaceholderText('Your display name');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Alice W');
  });

  it('shows bio textarea with user value', () => {
    renderProfile();
    const textarea = screen.getByPlaceholderText('Tell us about yourself...');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test bio');
  });

  it('shows account information section', () => {
    renderProfile();
    expect(screen.getByText('Account Information')).toBeInTheDocument();
  });

  it('displays username', () => {
    renderProfile();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('displays email', () => {
    renderProfile();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('displays auth provider', () => {
    renderProfile();
    // authProvider 'local' is rendered with capitalize CSS class
    expect(screen.getByText(/local/i)).toBeInTheDocument();
  });

  it('shows save button', () => {
    renderProfile();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('shows avatar initials when no avatar image', () => {
    renderProfile();
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('shows avatar change button', () => {
    renderProfile();
    expect(screen.getByLabelText('Change avatar')).toBeInTheDocument();
  });
});
