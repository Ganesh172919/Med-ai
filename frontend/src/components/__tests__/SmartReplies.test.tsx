import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../api/ai', () => ({
  getSmartReplies: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import SmartReplies from '../SmartReplies';
import { getSmartReplies } from '../../api/ai';

const defaultProps = {
  messages: [
    { role: 'assistant', content: 'How can I help you today?' },
  ],
  onSelect: vi.fn(),
  enabled: true,
};

describe('SmartReplies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getSmartReplies as any).mockResolvedValue({ suggestions: ['Thanks!', 'Tell me more', 'Help me code'] });
  });

  it('renders nothing when disabled', () => {
    render(<SmartReplies {...defaultProps} enabled={false} />);
    expect(screen.queryByText('Quick replies')).toBeNull();
  });

  it('renders nothing when messages empty', () => {
    render(<SmartReplies {...defaultProps} messages={[]} />);
    expect(screen.queryByText('Quick replies')).toBeNull();
  });

  it('hides suggestions when last message is from user', () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    render(<SmartReplies {...defaultProps} messages={messages} />);
    expect(screen.queryByText('Quick replies')).toBeNull();
  });

  it('fetches suggestions for non-user last message', async () => {
    render(<SmartReplies {...defaultProps} />);
    await waitFor(() => {
      expect(getSmartReplies).toHaveBeenCalled();
    });
  });

  it('displays suggestions after loading', async () => {
    render(<SmartReplies {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Thanks!')).toBeDefined();
      expect(screen.getByText('Tell me more')).toBeDefined();
      expect(screen.getByText('Help me code')).toBeDefined();
    });
  });

  it('calls onSelect when suggestion clicked', async () => {
    const onSelect = vi.fn();
    render(<SmartReplies {...defaultProps} onSelect={onSelect} />);
    await waitFor(() => {
      expect(screen.getByText('Thanks!')).toBeDefined();
    });
    await userEvent.click(screen.getByText('Thanks!'));
    expect(onSelect).toHaveBeenCalledWith('Thanks!');
  });

  it('hides suggestions after selection', async () => {
    render(<SmartReplies {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Thanks!')).toBeDefined();
    });
    await userEvent.click(screen.getByText('Thanks!'));
    await waitFor(() => {
      expect(screen.queryByText('Quick replies')).toBeNull();
    });
  });

  it('shows refresh button', async () => {
    render(<SmartReplies {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Refresh suggestions')).toBeDefined();
    });
  });
});
