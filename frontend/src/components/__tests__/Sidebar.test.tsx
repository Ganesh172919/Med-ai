import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

vi.mock('../../store/chatStore', () => ({
  useChatStore: () => ({
    conversations: [],
    activeConversationId: null,
    setActiveConversation: vi.fn(),
  }),
}));

vi.mock('../../utils/format', () => ({
  formatDate: (d: string) => d,
}));

describe('Sidebar', () => {
  const defaultProps = {
    isOpen: true,
    onToggle: vi.fn(),
    onNewChat: vi.fn(),
    onDeleteConversation: vi.fn(),
  };

  it('renders chat history title', () => {
    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Chat History')).toBeInTheDocument();
  });

  it('shows new chat button', () => {
    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByTitle('New chat (Ctrl+K)')).toBeInTheDocument();
  });

  it('shows empty state when no conversations', () => {
    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  it('shows start chatting message', () => {
    render(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Start a new chat to begin')).toBeInTheDocument();
  });
});
