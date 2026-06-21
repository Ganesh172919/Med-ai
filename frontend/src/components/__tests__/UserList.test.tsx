import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserList from '../UserList';

vi.mock('../../utils/format', () => ({
  getAvatarColor: () => 'from-purple-500 to-blue-500',
}));

describe('UserList', () => {
  it('renders user count', () => {
    const users = [
      { id: 'u1', username: 'alice' },
      { id: 'u2', username: 'bob' },
    ];
    render(<UserList users={users} />);
    expect(screen.getByText(/Online — 2/)).toBeInTheDocument();
  });

  it('renders usernames', () => {
    const users = [
      { id: 'u1', username: 'alice' },
      { id: 'u2', username: 'bob' },
    ];
    render(<UserList users={users} />);
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    render(<UserList users={[]} />);
    expect(screen.getByText('No users online')).toBeInTheDocument();
  });

  it('shows crown for room creator', () => {
    const users = [
      { id: 'u1', username: 'alice' },
      { id: 'u2', username: 'bob' },
    ];
    render(<UserList users={users} creatorId="u1" />);
    expect(screen.getByTitle('Room creator')).toBeInTheDocument();
  });

  it('does not show crown for non-creator', () => {
    const users = [
      { id: 'u1', username: 'alice' },
      { id: 'u2', username: 'bob' },
    ];
    render(<UserList users={users} creatorId="u2" />);
    const crowns = screen.getAllByTitle('Room creator');
    expect(crowns.length).toBe(1);
  });

  it('renders user avatars with initials', () => {
    const users = [{ id: 'u1', username: 'alice' }];
    render(<UserList users={users} />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('shows online indicator', () => {
    const users = [{ id: 'u1', username: 'alice' }];
    const { container } = render(<UserList users={users} />);
    const indicator = container.querySelector('.bg-green-500');
    expect(indicator).toBeInTheDocument();
  });
});
