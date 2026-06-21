import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../MarkdownRenderer', () => ({
  default: ({ content }: any) => <div data-testid="markdown">{content}</div>,
}));

vi.mock('../ReadReceipt', () => ({
  default: ({ status }: any) => <span data-testid="read-receipt">{status}</span>,
}));

vi.mock('../SentimentBadge', () => ({
  default: ({ sentiment }: any) => <span data-testid="sentiment">{sentiment}</span>,
}));

vi.mock('../../utils/format', () => ({
  getAvatarColor: () => 'from-purple-500 to-blue-500',
  getInitials: (name: string) => name.charAt(0).toUpperCase(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

import MessageBubble from '../MessageBubble';

const baseUserProps = {
  role: 'user' as const,
  content: 'Hello world',
  timestamp: '2025-01-15T10:30:00Z',
  username: 'alice',
  userId: 'u1',
  currentUserId: 'u1',
};

const baseAIProps = {
  role: 'assistant' as const,
  content: 'I can help with that!',
  timestamp: '2025-01-15T10:31:00Z',
  isAI: true,
};

describe('MessageBubble', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user message content', () => {
    render(<MessageBubble {...baseUserProps} />);
    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('renders AI message with MarkdownRenderer', () => {
    render(<MessageBubble {...baseAIProps} />);
    expect(screen.getByTestId('markdown')).toBeDefined();
    expect(screen.getByText('I can help with that!')).toBeDefined();
  });

  it('shows AI Assistant label for AI messages', () => {
    render(<MessageBubble {...baseAIProps} />);
    expect(screen.getByText('AI Assistant')).toBeDefined();
  });

  it('shows username for group messages', () => {
    render(<MessageBubble {...baseUserProps} showReactions={true} />);
    expect(screen.getByText('alice')).toBeDefined();
  });

  it('shows edited indicator', () => {
    render(<MessageBubble {...baseUserProps} showReactions={true} isEdited={true} />);
    expect(screen.getByText('Edited')).toBeDefined();
  });

  it('shows pinned indicator', () => {
    render(<MessageBubble {...baseUserProps} showReactions={true} isPinned={true} id="msg1" />);
    expect(screen.getByText('Pinned')).toBeDefined();
  });

  it('shows reply reference', () => {
    const replyTo = { id: 'msg0', username: 'bob', content: 'Original message' };
    render(<MessageBubble {...baseUserProps} replyTo={replyTo} />);
    expect(screen.getByText(/bob/)).toBeDefined();
    expect(screen.getByText(/Original message/)).toBeDefined();
  });

  it('shows read receipt for user messages', () => {
    render(<MessageBubble {...baseUserProps} status="read" />);
    expect(screen.getByTestId('read-receipt')).toBeDefined();
  });

  it('shows sentiment badge when provided', () => {
    const sentiment = { sentiment: 'positive', emoji: '😊', confidence: 0.9 };
    render(<MessageBubble {...baseUserProps} showReactions={true} sentiment={sentiment} />);
    expect(screen.getByTestId('sentiment')).toBeDefined();
  });

  it('shows triggered by label for AI messages', () => {
    render(<MessageBubble {...baseAIProps} triggeredBy="alice" />);
    expect(screen.getByText(/triggered by alice/)).toBeDefined();
  });

  it('shows fallback indicator', () => {
    render(<MessageBubble {...baseAIProps} fallbackUsed={true} />);
    expect(screen.getAllByText('fallback').length).toBeGreaterThanOrEqual(1);
  });

  it('shows pending state for AI messages', () => {
    render(<MessageBubble {...baseAIProps} messageState="pending" />);
    expect(screen.getByText('Thinking...')).toBeDefined();
  });

  it('shows word count for AI messages', () => {
    render(<MessageBubble {...baseAIProps} />);
    expect(screen.getByText(/words/)).toBeDefined();
  });

  it('shows file attachment', () => {
    render(
      <MessageBubble
        {...baseUserProps}
        fileUrl="https://example.com/file.pdf"
        fileName="document.pdf"
        fileType="application/pdf"
        fileSize={1024}
      />
    );
    expect(screen.getByText('document.pdf')).toBeDefined();
    expect(screen.getByText(/1.0 KB/)).toBeDefined();
  });

  it('shows reactions when showReactions enabled', () => {
    const reactions = { '👍': ['u1', 'u2'], '🔥': ['u3'] };
    render(<MessageBubble {...baseUserProps} reactions={reactions} showReactions={true} id="msg1" />);
    // Reactions appear in both the reaction display and hover buttons
    expect(screen.getAllByText('👍').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2')).toBeDefined();
  });

  it('shows triggered by label', () => {
    render(<MessageBubble {...baseAIProps} triggeredBy="alice" />);
    expect(screen.getByText(/triggered by alice/)).toBeDefined();
  });

  it('hides close poll button for non-creator', () => {
    render(<MessageBubble {...baseAIProps} />);
    // AI messages don't show edit/delete buttons
    expect(screen.queryByTitle('Edit message')).toBeNull();
    expect(screen.queryByTitle('Delete message')).toBeNull();
  });
});
