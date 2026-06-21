import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import GroupChat from '../GroupChat';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

vi.mock('../../api/ai', () => ({
  fetchAvailableModels: vi.fn().mockResolvedValue([
    { id: 'model1', name: 'Model 1', provider: 'openrouter' },
  ]),
}));

vi.mock('../../api/groups', () => ({
  fetchMembers: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../api/rooms', () => ({
  fetchRoomAccess: vi.fn().mockResolvedValue({ isMember: true }),
  fetchRoomById: vi.fn().mockResolvedValue({ id: 'room1', name: 'Test Room', members: [] }),
  fetchRoomPrivateKey: vi.fn().mockResolvedValue(null),
  joinRoomById: vi.fn(),
  uploadFile: vi.fn(),
}));

vi.mock('../../hooks/useSocket', () => ({
  useSocket: () => ({
    socket: null,
    joinRoom: vi.fn(),
    leaveRoom: vi.fn(),
    sendMessage: vi.fn(),
    sendFileMessage: vi.fn(),
    replyMessage: vi.fn(),
    addReaction: vi.fn(),
    triggerAi: vi.fn(),
    editMessage: vi.fn(),
    deleteMessage: vi.fn(),
    emitTyping: vi.fn(),
    stopTyping: vi.fn(),
    pinMessage: vi.fn(),
    unpinMessage: vi.fn(),
  }),
}));

vi.mock('../../store/roomStore', () => ({
  useRoomStore: () => ({
    currentRoom: null,
    setCurrentRoom: vi.fn(),
    addMessageToCurrentRoom: vi.fn(),
    updateMessageReactions: vi.fn(),
    editMessageInCurrentRoom: vi.fn(),
    deleteMessageInCurrentRoom: vi.fn(),
    updateMessageStatusInCurrentRoom: vi.fn(),
    setMessagePinnedState: vi.fn(),
    onlineUsers: [],
    setOnlineUsers: vi.fn(),
    aiThinking: false,
    setAiThinking: vi.fn(),
    clearCurrentRoom: vi.fn(),
  }),
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user1', username: 'testuser' },
  }),
}));

vi.mock('../../utils/aiModels', () => ({
  getModelGroups: () => [{ provider: 'openrouter', models: [{ id: 'model1', name: 'Model 1' }] }],
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

function renderGroupChat() {
  return render(
    <MemoryRouter initialEntries={['/group/room1']}>
      <I18nProvider>
        <Routes>
          <Route path="/group/:roomId" element={<GroupChat />} />
        </Routes>
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('GroupChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderGroupChat();
    expect(container).toBeInTheDocument();
  });

  it('renders the navbar', () => {
    renderGroupChat();
    expect(document.querySelector('nav')).toBeInTheDocument();
  });
});
