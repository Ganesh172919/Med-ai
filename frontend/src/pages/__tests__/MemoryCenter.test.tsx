import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import MemoryCenter from '../MemoryCenter';

vi.mock('../../api/memory', () => ({
  fetchMemoryEntries: vi.fn().mockResolvedValue([]),
  deleteMemoryEntry: vi.fn(),
  updateMemoryEntry: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function renderMemoryCenter() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <MemoryCenter />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('MemoryCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    renderMemoryCenter();
    await waitFor(() => {
      expect(screen.getByText('What I know about you')).toBeInTheDocument();
    });
  });

  it('renders the subtitle', async () => {
    renderMemoryCenter();
    await waitFor(() => {
      expect(screen.getByText(/Review, edit, pin, or delete/)).toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    renderMemoryCenter();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search memory/)).toBeInTheDocument();
    });
  });

  it('shows memories count label', async () => {
    renderMemoryCenter();
    await waitFor(() => {
      expect(screen.getByText('Memories')).toBeInTheDocument();
    });
  });

  it('shows pinned count label', async () => {
    renderMemoryCenter();
    await waitFor(() => {
      expect(screen.getByText('Pinned')).toBeInTheDocument();
    });
  });

  it('shows empty state when no memories', async () => {
    renderMemoryCenter();
    await waitFor(() => {
      expect(screen.getByText(/No memories found/)).toBeInTheDocument();
    });
  });
});
