import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../api/polls', () => ({
  createPoll: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { CreatePollModal, PollCard } from '../PollComponents';
import { createPoll } from '../../api/polls';

const mockPoll = {
  id: 'poll1',
  question: 'What is your favorite color?',
  options: [
    { index: 0, text: 'Red', votes: ['u1', 'u2'], percentage: 50, hasVoted: false },
    { index: 1, text: 'Blue', votes: ['u3'], percentage: 25, hasVoted: true },
    { index: 2, text: 'Green', votes: ['u4'], percentage: 25, hasVoted: false },
  ],
  totalVotes: 4,
  creatorId: 'u1',
  creatorUsername: 'alice',
  isClosed: false,
  isExpired: false,
  isAnonymous: false,
  allowMultipleVotes: false,
};

describe('CreatePollModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders question and options inputs', () => {
    render(<CreatePollModal roomId="room1" onCreated={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText('What do you want to ask?')).toBeDefined();
    expect(screen.getByPlaceholderText('Option 1')).toBeDefined();
    expect(screen.getByPlaceholderText('Option 2')).toBeDefined();
  });

  it('starts with 2 option fields', () => {
    render(<CreatePollModal roomId="room1" onCreated={vi.fn()} onClose={vi.fn()} />);
    const optionInputs = screen.getAllByPlaceholderText(/^Option \d+$/);
    expect(optionInputs).toHaveLength(2);
  });

  it('adds option when add button clicked', async () => {
    render(<CreatePollModal roomId="room1" onCreated={vi.fn()} onClose={vi.fn()} />);
    await userEvent.click(screen.getByText('Add option'));
    expect(screen.getByPlaceholderText('Option 3')).toBeDefined();
  });

  it('shows error when question empty on submit', async () => {
    const toast = (await import('react-hot-toast')).default;
    render(<CreatePollModal roomId="room1" onCreated={vi.fn()} onClose={vi.fn()} />);
    const createButtons = screen.getAllByText('Create Poll');
    await userEvent.click(createButtons[createButtons.length - 1]);
    expect(toast.error).toHaveBeenCalledWith('Question is required');
  });

  it('shows error when fewer than 2 options filled', async () => {
    const toast = (await import('react-hot-toast')).default;
    render(<CreatePollModal roomId="room1" onCreated={vi.fn()} onClose={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('What do you want to ask?'), 'Test?');
    await userEvent.type(screen.getByPlaceholderText('Option 1'), 'Yes');
    const createButtons = screen.getAllByText('Create Poll');
    await userEvent.click(createButtons[createButtons.length - 1]);
    expect(toast.error).toHaveBeenCalledWith('At least 2 options are required');
  });

  it('calls onClose when cancel clicked', async () => {
    const onClose = vi.fn();
    render(<CreatePollModal roomId="room1" onCreated={vi.fn()} onClose={onClose} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles allow multiple votes setting', async () => {
    render(<CreatePollModal roomId="room1" onCreated={vi.fn()} onClose={vi.fn()} />);
    const multipleBtn = screen.getByText('Allow multiple votes').closest('button');
    expect(multipleBtn).toBeDefined();
    await userEvent.click(multipleBtn!);
    // The button should now have the active state
    expect(multipleBtn!.className).toContain('border-neon-purple');
  });

  it('toggles anonymous voting setting', async () => {
    render(<CreatePollModal roomId="room1" onCreated={vi.fn()} onClose={vi.fn()} />);
    const anonBtn = screen.getByText('Anonymous voting').closest('button');
    expect(anonBtn).toBeDefined();
    await userEvent.click(anonBtn!);
    expect(anonBtn!.className).toContain('border-neon-purple');
  });

  it('has time limit selector with options', () => {
    render(<CreatePollModal roomId="room1" onCreated={vi.fn()} onClose={vi.fn()} />);
    const select = screen.getByDisplayValue('No limit');
    expect(select).toBeDefined();
  });
});

describe('PollCard', () => {
  it('displays poll question', () => {
    render(<PollCard poll={mockPoll} currentUserId="u1" onVote={vi.fn()} />);
    expect(screen.getByText('What is your favorite color?')).toBeDefined();
  });

  it('displays all options', () => {
    render(<PollCard poll={mockPoll} currentUserId="u1" onVote={vi.fn()} />);
    expect(screen.getByText('Red')).toBeDefined();
    expect(screen.getByText('Blue')).toBeDefined();
    expect(screen.getByText('Green')).toBeDefined();
  });

  it('displays total votes count', () => {
    render(<PollCard poll={mockPoll} currentUserId="u1" onVote={vi.fn()} />);
    expect(screen.getByText(/4 votes/)).toBeDefined();
  });

  it('displays creator username', () => {
    render(<PollCard poll={mockPoll} currentUserId="u1" onVote={vi.fn()} />);
    expect(screen.getByText(/alice/)).toBeDefined();
  });

  it('shows percentage for each option', () => {
    render(<PollCard poll={mockPoll} currentUserId="u1" onVote={vi.fn()} />);
    expect(screen.getByText('50%')).toBeDefined();
    expect(screen.getAllByText('25%')).toHaveLength(2);
  });

  it('calls onVote when option clicked', async () => {
    const onVote = vi.fn();
    render(<PollCard poll={mockPoll} currentUserId="u2" onVote={onVote} />);
    await userEvent.click(screen.getByText('Red'));
    expect(onVote).toHaveBeenCalledWith('poll1', 0);
  });

  it('shows closed badge when poll is closed', () => {
    const closedPoll = { ...mockPoll, isClosed: true };
    render(<PollCard poll={closedPoll} currentUserId="u1" onVote={vi.fn()} />);
    expect(screen.getByText('Closed')).toBeDefined();
  });

  it('shows expired badge when poll is expired', () => {
    const expiredPoll = { ...mockPoll, isExpired: true };
    render(<PollCard poll={expiredPoll} currentUserId="u1" onVote={vi.fn()} />);
    expect(screen.getByText('Expired')).toBeDefined();
  });

  it('shows anonymous badge for anonymous polls', () => {
    const anonPoll = { ...mockPoll, isAnonymous: true };
    render(<PollCard poll={anonPoll} currentUserId="u1" onVote={vi.fn()} />);
    expect(screen.getByText('Anonymous')).toBeDefined();
  });

  it('shows close poll button for creator on active poll', () => {
    const onClose = vi.fn();
    render(<PollCard poll={mockPoll} currentUserId="u1" onVote={vi.fn()} onClose={onClose} />);
    expect(screen.getByText('Close poll')).toBeDefined();
  });

  it('hides close poll button for non-creator', () => {
    render(<PollCard poll={mockPoll} currentUserId="u2" onVote={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByText('Close poll')).toBeNull();
  });
});
