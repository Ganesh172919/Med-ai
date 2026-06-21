import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import VirtualizedMessageList from '../VirtualizedMessageList';

// Mock IntersectionObserver for jsdom
beforeAll(() => {
  class MockIntersectionObserver {
    callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

interface TestMsg {
  id: string;
  content: string;
}

function TestWrapper({ messages, alwaysRender }: { messages: TestMsg[]; alwaysRender?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={scrollRef} data-testid="scroll-container">
      <VirtualizedMessageList
        messages={messages}
        getKey={(m) => m.id}
        scrollRef={scrollRef}
        alwaysRender={alwaysRender ?? 5}
        overscan="100px"
        renderItem={(msg) => <div data-testid={`msg-${msg.id}`}>{msg.content}</div>}
      />
    </div>
  );
}

function generateMessages(count: number): TestMsg[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    content: `Message ${i}`,
  }));
}

describe('VirtualizedMessageList', () => {
  it('renders all messages when count is under alwaysRender', () => {
    const messages = generateMessages(3);
    render(<TestWrapper messages={messages} alwaysRender={5} />);
    expect(screen.getByText('Message 0')).toBeInTheDocument();
    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.getByText('Message 2')).toBeInTheDocument();
  });

  it('renders recent messages when count exceeds alwaysRender', () => {
    const messages = generateMessages(30);
    render(<TestWrapper messages={messages} alwaysRender={5} />);
    // Recent messages (last 5) should be rendered
    expect(screen.getByText('Message 29')).toBeInTheDocument();
    expect(screen.getByText('Message 28')).toBeInTheDocument();
    expect(screen.getByText('Message 27')).toBeInTheDocument();
    expect(screen.getByText('Message 26')).toBeInTheDocument();
    expect(screen.getByText('Message 25')).toBeInTheDocument();
  });

  it('renders placeholders for older messages', () => {
    const messages = generateMessages(30);
    const { container } = render(<TestWrapper messages={messages} alwaysRender={5} />);
    // Should have 30 data-msg-key divs total
    const msgDivs = container.querySelectorAll('[data-msg-key]');
    expect(msgDivs.length).toBe(30);
  });

  it('handles empty messages array', () => {
    const { container } = render(<TestWrapper messages={[]} />);
    expect(container.textContent).toBe('');
  });

  it('uses correct keys from getKey', () => {
    const messages = [
      { id: 'abc-123', content: 'Hello' },
      { id: 'def-456', content: 'World' },
    ];
    const { container } = render(<TestWrapper messages={messages} />);
    const msgDivs = container.querySelectorAll('[data-msg-key]');
    expect(msgDivs[0]).toHaveAttribute('data-msg-key', 'abc-123');
    expect(msgDivs[1]).toHaveAttribute('data-msg-key', 'def-456');
  });
});
