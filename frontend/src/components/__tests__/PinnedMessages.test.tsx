import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PinnedMessages from '../PinnedMessages';

vi.mock('../../api/users', () => ({
  getPinnedMessages: vi.fn().mockResolvedValue([]),
}));

describe('PinnedMessages', () => {
  it('does not render when isOpen is false', () => {
    render(<PinnedMessages roomId="room1" isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Pinned Messages')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(<PinnedMessages roomId="room1" isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Pinned Messages')).toBeInTheDocument();
  });

  it('shows empty state when no pinned messages', async () => {
    render(<PinnedMessages roomId="room1" isOpen={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('No pinned messages')).toBeInTheDocument();
    });
  });

  it('shows close button', () => {
    render(<PinnedMessages roomId="room1" isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByLabelText('Close pinned messages')).toBeInTheDocument();
  });

  it('shows pin count', () => {
    render(<PinnedMessages roomId="room1" isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
