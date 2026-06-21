import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportModal from '../ReportModal';

vi.mock('../../api/moderation', () => ({
  reportUser: vi.fn(),
  reportMessage: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('ReportModal', () => {
  it('renders report user title', () => {
    render(<ReportModal targetId="user1" targetType="user" onClose={vi.fn()} />);
    expect(screen.getByText('Report User')).toBeInTheDocument();
  });

  it('renders report message title', () => {
    render(<ReportModal targetId="msg1" targetType="message" onClose={vi.fn()} />);
    expect(screen.getByText('Report Message')).toBeInTheDocument();
  });

  it('shows target name when provided', () => {
    render(<ReportModal targetId="user1" targetType="user" targetName="Alice" onClose={vi.fn()} />);
    expect(screen.getByText('Reporting: Alice')).toBeInTheDocument();
  });

  it('shows reason options', () => {
    render(<ReportModal targetId="user1" targetType="user" onClose={vi.fn()} />);
    expect(screen.getByText('Spam')).toBeInTheDocument();
    expect(screen.getByText('Harassment')).toBeInTheDocument();
    expect(screen.getByText('Hate Speech')).toBeInTheDocument();
  });

  it('shows description textarea', () => {
    render(<ReportModal targetId="user1" targetType="user" onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText('Provide additional details...')).toBeInTheDocument();
  });

  it('shows cancel button', () => {
    render(<ReportModal targetId="user1" targetType="user" onClose={vi.fn()} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows submit button', () => {
    render(<ReportModal targetId="user1" targetType="user" onClose={vi.fn()} />);
    expect(screen.getByText('Submit Report')).toBeInTheDocument();
  });

  it('shows warning message', () => {
    render(<ReportModal targetId="user1" targetType="user" onClose={vi.fn()} />);
    expect(screen.getByText(/False reports may result/)).toBeInTheDocument();
  });
});
