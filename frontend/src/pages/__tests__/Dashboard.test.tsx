import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Dashboard from '../Dashboard';

// Mock the dashboard API
vi.mock('../../api/dashboard', () => ({
  fetchDashboard: vi.fn(),
}));

import { fetchDashboard } from '../../api/dashboard';

const mockDashboardData = {
  stats: {
    totalConversations: 12,
    totalRooms: 5,
    totalMessagesSent: 248,
    messagesToday: 15,
  },
  recentRooms: [
    {
      id: 'room1',
      name: 'Cardiology',
      tags: ['heart', 'ecg'],
      currentUserRole: 'creator',
    },
  ],
  activity: [
    {
      id: 'act1',
      content: 'Discussed ECG findings',
      type: 'message',
      roomName: 'Cardiology',
      timestamp: new Date().toISOString(),
    },
  ],
};

function renderDashboard() {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    </I18nProvider>
  );
}

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard header', async () => {
    vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData as any);
    renderDashboard();
    expect(screen.getByText('Clinical Command Center')).toBeInTheDocument();
  });

  it('shows loading skeletons initially', () => {
    vi.mocked(fetchDashboard).mockImplementation(() => new Promise(() => {})); // never resolves
    renderDashboard();
    // Should show loading skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays stats after loading', async () => {
    vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData as any);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('248')).toBeInTheDocument(); // totalMessagesSent
    });

    expect(screen.getByText('12')).toBeInTheDocument(); // totalConversations
    expect(screen.getByText('5')).toBeInTheDocument(); // totalRooms
    expect(screen.getByText('15')).toBeInTheDocument(); // messagesToday
  });

  it('displays stat labels', async () => {
    vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData as any);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Consultations')).toBeInTheDocument();
    });

    expect(screen.getByText('Patient Rooms')).toBeInTheDocument();
    expect(screen.getByText('Clinical Notes')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('displays quick action links', () => {
    vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData as any);
    renderDashboard();

    expect(screen.getByText('Clinical AI Consult')).toBeInTheDocument();
    expect(screen.getByText('Medical Records')).toBeInTheDocument();
    expect(screen.getByText('Search Records')).toBeInTheDocument();
    // "Case Files" appears in Navbar too, so check for multiple
    expect(screen.getAllByText('Case Files').length).toBeGreaterThanOrEqual(1);
  });

  it('displays recent activity after loading', async () => {
    vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData as any);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Discussed ECG findings')).toBeInTheDocument();
    });
  });

  it('shows empty state when no activity', async () => {
    vi.mocked(fetchDashboard).mockResolvedValue({
      ...mockDashboardData,
      activity: [],
    } as any);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });

  it('renders the sidebar with ChatSphere branding', async () => {
    vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData as any);
    renderDashboard();

    await waitFor(() => {
      const branding = screen.getAllByText('ChatSphere');
      expect(branding.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders keyboard shortcut hints', async () => {
    vi.mocked(fetchDashboard).mockResolvedValue(mockDashboardData as any);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+/')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    vi.mocked(fetchDashboard).mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Clinical Command Center')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
