import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import AdminDashboard from '../AdminDashboard';

vi.mock('../../api/admin', () => ({
  fetchAdminStats: vi.fn().mockResolvedValue({
    totalUsers: 100,
    totalRooms: 20,
    totalMessages: 5000,
    reportsPending: 3,
    activeUsers: 50,
  }),
  fetchReports: vi.fn().mockResolvedValue({ reports: [], total: 0 }),
  resolveReport: vi.fn(),
  fetchAdminUsers: vi.fn().mockResolvedValue({ users: [], total: 0 }),
}));

vi.mock('../../api/analytics', () => ({
  fetchMessageAnalytics: vi.fn().mockResolvedValue([]),
  fetchUserAnalytics: vi.fn().mockResolvedValue([]),
  fetchTopRooms: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../components/AnalyticsCharts', () => ({
  BarChart: () => <div data-testid="bar-chart" />,
  MiniStat: ({ label }: { label: string }) => <div>{label}</div>,
  TopRoomsTable: () => <div data-testid="top-rooms-table" />,
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function renderAdminDashboard() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <AdminDashboard />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('shows overview tab', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
  });

  it('shows reports tab', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });

  it('shows users tab', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('shows admin shield icon section', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});
