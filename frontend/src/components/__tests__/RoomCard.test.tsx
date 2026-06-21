import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RoomCard from '../RoomCard';

describe('RoomCard', () => {
  const defaultProps = {
    id: 'room1',
    name: 'Test Room',
    description: 'A test room for testing',
    tags: ['test', 'chat'],
    messageCount: 42,
    memberCount: 10,
    visibility: 'public' as const,
    isMember: false,
    isJoining: false,
    onJoin: vi.fn(),
    index: 0,
  };

  it('renders room name', () => {
    render(<RoomCard {...defaultProps} />);
    expect(screen.getByText('Test Room')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<RoomCard {...defaultProps} />);
    expect(screen.getByText('A test room for testing')).toBeInTheDocument();
  });

  it('renders default description when empty', () => {
    render(<RoomCard {...defaultProps} description="" />);
    expect(screen.getByText('No description provided')).toBeInTheDocument();
  });

  it('renders message count', () => {
    render(<RoomCard {...defaultProps} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders member count', () => {
    render(<RoomCard {...defaultProps} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<RoomCard {...defaultProps} />);
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#chat')).toBeInTheDocument();
  });

  it('shows public badge for public rooms', () => {
    render(<RoomCard {...defaultProps} visibility="public" />);
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('shows private badge for private rooms', () => {
    render(<RoomCard {...defaultProps} visibility="private" />);
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('shows member status when isMember is true', () => {
    render(<RoomCard {...defaultProps} isMember={true} />);
    expect(screen.getByText('You are a member')).toBeInTheDocument();
  });

  it('shows join text for non-members of public room', () => {
    render(<RoomCard {...defaultProps} isMember={false} visibility="public" />);
    expect(screen.getByText('Anyone can join')).toBeInTheDocument();
  });

  it('shows key text for non-members of private room', () => {
    render(<RoomCard {...defaultProps} isMember={false} visibility="private" />);
    expect(screen.getByText('Requires room key')).toBeInTheDocument();
  });

  it('calls onJoin when clicked', () => {
    const onJoin = vi.fn();
    render(<RoomCard {...defaultProps} onJoin={onJoin} />);
    fireEvent.click(screen.getByText('Test Room').closest('div')!.parentElement!.parentElement!.parentElement!);
    expect(onJoin).toHaveBeenCalledWith('room1', false);
  });

  it('limits tags to 4', () => {
    const tags = ['a', 'b', 'c', 'd', 'e', 'f'];
    render(<RoomCard {...defaultProps} tags={tags} />);
    expect(screen.getByText('#a')).toBeInTheDocument();
    expect(screen.getByText('#b')).toBeInTheDocument();
    expect(screen.getByText('#c')).toBeInTheDocument();
    expect(screen.getByText('#d')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
