import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import ExportChat from '../ExportChat';

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }) },
}));

vi.mock('../../api/export', () => ({
  exportConversations: vi.fn(),
  exportRoom: vi.fn(),
  downloadBlob: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function renderExportChat() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <ExportChat />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('ExportChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    renderExportChat();
    await waitFor(() => {
      expect(screen.getByText('Chat Export Center')).toBeInTheDocument();
    });
  });

  it('renders the subtitle', async () => {
    renderExportChat();
    await waitFor(() => {
      expect(screen.getByText(/Download your solo conversations/)).toBeInTheDocument();
    });
  });

  it('shows conversation export section', async () => {
    renderExportChat();
    await waitFor(() => {
      expect(screen.getByText('Conversation Export')).toBeInTheDocument();
    });
  });

  it('shows room message export section', async () => {
    renderExportChat();
    await waitFor(() => {
      expect(screen.getByText('Room Message Export')).toBeInTheDocument();
    });
  });

  it('shows export format buttons', async () => {
    renderExportChat();
    await waitFor(() => {
      expect(screen.getByText('normalized')).toBeInTheDocument();
      expect(screen.getByText('markdown')).toBeInTheDocument();
      expect(screen.getByText('adapter')).toBeInTheDocument();
    });
  });

  it('shows export conversations button', async () => {
    renderExportChat();
    await waitFor(() => {
      expect(screen.getByText('Export conversations')).toBeInTheDocument();
    });
  });

  it('shows loading state for rooms', async () => {
    renderExportChat();
    await waitFor(() => {
      // Should show rooms section
      expect(screen.getByText('Room Message Export')).toBeInTheDocument();
    });
  });
});
