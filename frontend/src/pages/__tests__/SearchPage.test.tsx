import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import SearchPage from '../SearchPage';

vi.mock('../../api/search', () => ({
  searchMessages: vi.fn().mockResolvedValue({ results: [], total: 0, page: 1, totalPages: 0 }),
  searchConversations: vi.fn().mockResolvedValue({ results: [] }),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function renderSearchPage() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <SearchPage />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the page title', () => {
    renderSearchPage();
    expect(screen.getByText('Search Messages')).toBeInTheDocument();
  });

  it('shows search input', () => {
    renderSearchPage();
    expect(screen.getByPlaceholderText(/Search messages/)).toBeInTheDocument();
  });

  it('shows back to dashboard link', () => {
    renderSearchPage();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  it('shows subtitle', () => {
    renderSearchPage();
    expect(screen.getByText(/Search room messages and solo AI conversations/)).toBeInTheDocument();
  });

  it('has search input with id', () => {
    renderSearchPage();
    expect(document.getElementById('search-input')).toBeInTheDocument();
  });
});
