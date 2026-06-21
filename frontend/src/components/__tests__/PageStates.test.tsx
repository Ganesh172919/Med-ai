import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageSquare } from 'lucide-react';
import { PageLoader, InlineError, EmptyState } from '../PageStates';

describe('PageLoader', () => {
  it('renders with default message', () => {
    render(<PageLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<PageLoader message="Fetching conversations..." />);
    expect(screen.getByText('Fetching conversations...')).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    render(<PageLoader />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('InlineError', () => {
  it('renders with default message', () => {
    render(<InlineError />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<InlineError message="Network error" />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<InlineError />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<InlineError />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('renders retry button and calls onRetry on click', () => {
    const onRetry = vi.fn();
    render(<InlineError onRetry={onRetry} />);
    const retryBtn = screen.getByText('Retry');
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('EmptyState', () => {
  it('renders with default props', () => {
    render(<EmptyState />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(<EmptyState title="No messages" description="Start a conversation!" />);
    expect(screen.getByText('No messages')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation!')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(<EmptyState icon={MessageSquare} title="Chat empty" />);
    // The icon is decorative, just verify the title renders
    expect(screen.getByText('Chat empty')).toBeInTheDocument();
  });

  it('renders action node when provided', () => {
    render(
      <EmptyState
        title="No rooms"
        action={<button>Create Room</button>}
      />
    );
    expect(screen.getByText('Create Room')).toBeInTheDocument();
  });

  it('does not render action when not provided', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
