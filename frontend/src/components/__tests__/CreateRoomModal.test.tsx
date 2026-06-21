import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateRoomModal from '../CreateRoomModal';

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('CreateRoomModal', () => {
  it('does not render when isOpen is false', () => {
    render(<CreateRoomModal isOpen={false} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.queryByText('Create Room')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(<CreateRoomModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByText('Create Room')).toBeInTheDocument();
  });

  it('shows room name label', () => {
    render(<CreateRoomModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByText('Room Name')).toBeInTheDocument();
  });

  it('shows description label', () => {
    render(<CreateRoomModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('shows tags label', () => {
    render(<CreateRoomModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('shows visibility options', () => {
    render(<CreateRoomModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('shows create button', () => {
    render(<CreateRoomModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    expect(screen.getByText('Create Room')).toBeInTheDocument();
  });

  it('allows typing in room name', () => {
    render(<CreateRoomModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    const input = screen.getByPlaceholderText('e.g. Deep Learning Discussions');
    fireEvent.change(input, { target: { value: 'Test Room' } });
    expect(input).toHaveValue('Test Room');
  });

  it('allows typing in description', () => {
    render(<CreateRoomModal isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    const input = screen.getByPlaceholderText("What's this room about?");
    fireEvent.change(input, { target: { value: 'A test room' } });
    expect(input).toHaveValue('A test room');
  });
});
