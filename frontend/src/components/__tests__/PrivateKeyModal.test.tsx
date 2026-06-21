/**
 * =============================================================================
 * PrivateKeyModal Component Tests
 * =============================================================================
 *
 * Tests for the private room join key modal.
 *
 * WHY THESE TESTS MATTER:
 * - Private rooms require key validation
 * - Modal must handle open/close states correctly
 * - Input must auto-uppercase for consistency
 * - Validation must enforce 16-character requirement
 * =============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrivateKeyModal from '../PrivateKeyModal';
import type { Room } from '../../api/rooms';

const mockRoom: Room = {
  id: 'room-123',
  name: 'Test Private Room',
  description: 'A private room for testing',
  visibility: 'private',
  tags: [],
  maxUsers: 50,
  members: [],
  messageCount: 0,
  creatorId: 'user-1',
  createdAt: new Date().toISOString(),
};

describe('PrivateKeyModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <PrivateKeyModal
        room={mockRoom}
        isOpen={false}
        isJoining={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByText('Private Room')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <PrivateKeyModal
        room={mockRoom}
        isOpen={true}
        isJoining={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Private Room')).toBeInTheDocument();
    expect(screen.getByText('Test Private Room')).toBeInTheDocument();
  });

  it('shows room name in the modal', () => {
    render(
      <PrivateKeyModal
        room={mockRoom}
        isOpen={true}
        isJoining={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Test Private Room')).toBeInTheDocument();
  });

  it('has a key input field', () => {
    render(
      <PrivateKeyModal
        room={mockRoom}
        isOpen={true}
        isJoining={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Room Key')).toBeInTheDocument();
  });

  it('auto-uppercases input', async () => {
    const user = userEvent.setup();

    render(
      <PrivateKeyModal
        room={mockRoom}
        isOpen={true}
        isJoining={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const input = screen.getByLabelText('Room Key');
    await user.type(input, 'abcd');
    expect(input).toHaveValue('ABCD');
  });

  it('shows character count', async () => {
    const user = userEvent.setup();

    render(
      <PrivateKeyModal
        room={mockRoom}
        isOpen={true}
        isJoining={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const input = screen.getByLabelText('Room Key');
    await user.type(input, 'ABCDEFGH');
    expect(screen.getByText('8/16')).toBeInTheDocument();
  });

  it('disables submit when key is not 16 characters', () => {
    render(
      <PrivateKeyModal
        room={mockRoom}
        isOpen={true}
        isJoining={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const submitButton = screen.getByText('Join with Key');
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state when joining', () => {
    render(
      <PrivateKeyModal
        room={mockRoom}
        isOpen={true}
        isJoining={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Joining...')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <PrivateKeyModal
        room={mockRoom}
        isOpen={true}
        isJoining={false}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
