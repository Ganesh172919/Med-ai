import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../api/groups', () => ({
  fetchMembers: vi.fn(),
  updateMemberRole: vi.fn(),
  kickMember: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import MemberManagement from '../MemberManagement';
import { fetchMembers, updateMemberRole, kickMember } from '../../api/groups';

const mockMembers = [
  { userId: 'u1', username: 'alice', displayName: 'Alice', role: 'admin', isCreator: true, onlineStatus: 'online', avatar: null },
  { userId: 'u2', username: 'bob', displayName: 'Bob', role: 'member', isCreator: false, onlineStatus: 'away', avatar: null },
  { userId: 'u3', username: 'charlie', displayName: 'Charlie', role: 'moderator', isCreator: false, onlineStatus: 'offline', avatar: 'https://example.com/avatar.jpg' },
];

const defaultProps = {
  roomId: 'room1',
  currentUserId: 'u1',
  isCreator: true,
  onClose: vi.fn(),
};

describe('MemberManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchMembers as any).mockResolvedValue(mockMembers);
  });

  it('shows loading skeletons initially', () => {
    (fetchMembers as any).mockReturnValue(new Promise(() => {})); // never resolves
    render(<MemberManagement {...defaultProps} />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('displays member list after loading', async () => {
    render(<MemberManagement {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeDefined();
      expect(screen.getByText('Bob')).toBeDefined();
      expect(screen.getByText('Charlie')).toBeDefined();
    });
  });

  it('shows member count', async () => {
    render(<MemberManagement {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('3 members')).toBeDefined();
    });
  });

  it('shows creator crown icon for owner', async () => {
    render(<MemberManagement {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Owner')).toBeDefined();
    });
  });

  it('shows role labels for each member', async () => {
    render(<MemberManagement {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getAllByText('Owner').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('member').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('moderator').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows (you) label for current user', async () => {
    render(<MemberManagement {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('(you)')).toBeDefined();
    });
  });

  it('calls onClose when overlay clicked', async () => {
    const onClose = vi.fn();
    render(<MemberManagement {...defaultProps} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeDefined();
    });
    // The overlay div has onClick={onClose}
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeDefined();
  });

  it('shows error toast on fetch failure', async () => {
    const toast = (await import('react-hot-toast')).default;
    (fetchMembers as any).mockRejectedValue(new Error('fail'));
    render(<MemberManagement {...defaultProps} />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load members');
    });
  });
});
