import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatAnnouncer, TypingAnnouncer, ConnectionAnnouncer } from '../LiveRegion';

describe('ChatAnnouncer', () => {
  it('renders with aria-live="polite" when message present', () => {
    const { container } = render(<ChatAnnouncer newMessage={{ username: 'Alice', content: 'Hello' }} />);
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
  });

  it('announces new message from user', () => {
    render(<ChatAnnouncer newMessage={{ username: 'Alice', content: 'Hello' }} />);
    expect(screen.getByText('Alice said: Hello')).toBeInTheDocument();
  });

  it('announces new AI message', () => {
    render(<ChatAnnouncer newMessage={{ username: 'AI', content: 'Response', isAI: true }} />);
    expect(screen.getByText('AI Assistant said: Response')).toBeInTheDocument();
  });

  it('announces system message', () => {
    render(<ChatAnnouncer newMessage={{ username: 'system', content: 'User joined', isSystem: true }} />);
    expect(screen.getByText('User joined')).toBeInTheDocument();
  });

  it('returns null when no message', () => {
    const { container } = render(<ChatAnnouncer newMessage={null} />);
    expect(container.textContent).toBe('');
  });
});

describe('TypingAnnouncer', () => {
  it('announces single user typing', () => {
    render(<TypingAnnouncer users={['Alice']} />);
    expect(screen.getByText('Alice is typing')).toBeInTheDocument();
  });

  it('announces two users typing', () => {
    render(<TypingAnnouncer users={['Alice', 'Bob']} />);
    expect(screen.getByText('Alice and Bob are typing')).toBeInTheDocument();
  });

  it('announces three+ users typing', () => {
    render(<TypingAnnouncer users={['Alice', 'Bob', 'Charlie']} />);
    expect(screen.getByText('Alice and 2 others are typing')).toBeInTheDocument();
  });

  it('returns null when no users', () => {
    const { container } = render(<TypingAnnouncer users={[]} />);
    expect(container.textContent).toBe('');
  });
});

describe('ConnectionAnnouncer', () => {
  it('announces connected status', () => {
    render(<ConnectionAnnouncer status="connected" />);
    expect(screen.getByText('Connected to chat')).toBeInTheDocument();
  });

  it('announces disconnected status', () => {
    render(<ConnectionAnnouncer status="disconnected" />);
    expect(screen.getByText('Disconnected from chat. Messages may not be sent.')).toBeInTheDocument();
  });

  it('announces reconnecting status', () => {
    render(<ConnectionAnnouncer status="reconnecting" />);
    expect(screen.getByText('Reconnecting to chat...')).toBeInTheDocument();
  });

  it('uses assertive for disconnected', () => {
    const { container } = render(<ConnectionAnnouncer status="disconnected" />);
    const region = container.querySelector('[aria-live="assertive"]');
    expect(region).toBeInTheDocument();
  });

  it('uses polite for connected', () => {
    const { container } = render(<ConnectionAnnouncer status="connected" />);
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
  });
});
