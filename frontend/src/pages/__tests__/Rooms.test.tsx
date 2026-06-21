import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Rooms from '../Rooms';

vi.mock('../../api/rooms', () => ({
  fetchRooms: vi.fn().mockResolvedValue([]),
  createRoom: vi.fn(),
  joinRoomById: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function renderRooms() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <Rooms />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('Rooms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    renderRooms();
    await waitFor(() => {
      expect(screen.getByText('Group Rooms')).toBeInTheDocument();
    });
  });

  it('shows create room button', async () => {
    renderRooms();
    await waitFor(() => {
      expect(screen.getByText('Create Room')).toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    renderRooms();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search rooms/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no rooms', async () => {
    renderRooms();
    await waitFor(() => {
      expect(screen.getByText(/No rooms yet/)).toBeInTheDocument();
    });
  });

  it('shows subtitle', async () => {
    renderRooms();
    await waitFor(() => {
      expect(screen.getByText(/@ai is always ready/)).toBeInTheDocument();
    });
  });
});
