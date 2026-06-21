import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Settings from '../Settings';

vi.mock('../../api/settings', () => ({
  fetchSettings: vi.fn(),
  updateSettings: vi.fn(),
}));

vi.mock('../../api/moderation', () => ({
  getBlockedUsers: vi.fn().mockResolvedValue([]),
  unblockUser: vi.fn(),
}));

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    setAccentColor: vi.fn(),
    setCustomTheme: vi.fn(),
    setThemeMode: vi.fn(),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import { fetchSettings } from '../../api/settings';

const mockSettings = {
  theme: { mode: 'dark', customTheme: 'default' },
  accentColor: '#A855F7',
  notifications: { sound: true, desktop: true, mentions: true, replies: true },
  aiFeatures: { smartReplies: true, sentimentAnalysis: false, grammarCheck: false },
};

function renderSettings() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <Settings />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchSettings).mockResolvedValue(mockSettings);
  });

  it('shows loading skeleton initially', () => {
    renderSettings();
    // Should show skeleton placeholders while loading
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders settings title after loading', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('renders subtitle after loading', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Customize your ChatSphere experience')).toBeInTheDocument();
    });
  });

  it('shows back to dashboard link after loading', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByLabelText('Back to dashboard')).toBeInTheDocument();
    });
  });

  it('renders accent color section', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Accent Color')).toBeInTheDocument();
    });
  });

  it('renders notification settings section', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('renders AI features section', async () => {
    renderSettings();
    await waitFor(() => {
      expect(screen.getByText('AI Features')).toBeInTheDocument();
    });
  });

  it('shows multiple settings sections after loading', async () => {
    renderSettings();
    await waitFor(() => {
      const sections = screen.getAllByText(/accent color|notifications|ai features/i);
      expect(sections.length).toBeGreaterThanOrEqual(2);
    });
  });
});
