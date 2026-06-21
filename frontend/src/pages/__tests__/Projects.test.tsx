import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Projects from '../Projects';

vi.mock('../../api/projects', () => ({
  fetchProjects: vi.fn().mockResolvedValue([]),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

vi.mock('../../api/ai', () => ({
  fetchAvailableModels: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../api/conversations', () => ({
  runConversationAction: vi.fn(),
}));

vi.mock('../../api/rooms', () => ({
  uploadFile: vi.fn(),
}));

vi.mock('../../hooks/useChat', () => ({
  useChat: () => ({
    messages: [],
    sendMessage: vi.fn(),
    isLoading: false,
    isStreaming: false,
  }),
}));

vi.mock('../../store/chatStore', () => ({
  useChatStore: () => ({
    clearMessages: vi.fn(),
  }),
}));

vi.mock('../../utils/aiModels', () => ({
  getModelGroups: () => [],
}));

vi.mock('../../utils/format', () => ({
  formatDate: (d: string) => d,
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function renderProjects() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <Projects />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('Projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the projects header', async () => {
    renderProjects();
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  it('shows the subtitle', async () => {
    renderProjects();
    await waitFor(() => {
      expect(screen.getByText(/Persistent AI workspaces/)).toBeInTheDocument();
    });
  });

  it('shows new project button', async () => {
    renderProjects();
    await waitFor(() => {
      expect(screen.getByText('New Project')).toBeInTheDocument();
    });
  });

  it('shows feature cards', async () => {
    renderProjects();
    await waitFor(() => {
      expect(screen.getByText('Persistent brief')).toBeInTheDocument();
      expect(screen.getByText('Reusable files')).toBeInTheDocument();
      expect(screen.getByText('Focused history')).toBeInTheDocument();
    });
  });

  it('shows empty state when no projects', async () => {
    renderProjects();
    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });
  });

  it('shows create project button in empty state', async () => {
    renderProjects();
    await waitFor(() => {
      expect(screen.getByText('Create a project')).toBeInTheDocument();
    });
  });
});
