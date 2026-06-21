import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import SoloChat from '../SoloChat';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

vi.mock('../../api/ai', () => ({
  fetchAvailableModels: vi.fn().mockResolvedValue([
    { id: 'model1', name: 'Model 1', provider: 'openrouter' },
  ]),
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
    removeConversation: vi.fn(),
    startNewChat: vi.fn(),
  }),
}));

vi.mock('../../store/chatStore', () => ({
  useChatStore: () => ({
    activeConversationId: null,
    conversations: [],
    updateConversationInsight: vi.fn(),
    clearMessages: vi.fn(),
  }),
}));

vi.mock('../../utils/aiModels', () => ({
  getModelGroups: () => [{ provider: 'openrouter', models: [{ id: 'model1', name: 'Model 1' }] }],
}));

vi.mock('../../utils/format', () => ({
  formatDate: (d: string) => d,
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function renderSoloChat() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <SoloChat />
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('SoloChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderSoloChat();
    expect(container).toBeInTheDocument();
  });

  it('renders the navbar', () => {
    renderSoloChat();
    expect(document.querySelector('nav')).toBeInTheDocument();
  });
});
