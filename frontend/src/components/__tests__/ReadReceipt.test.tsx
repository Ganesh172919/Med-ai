import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReadReceipt from '../ReadReceipt';

describe('ReadReceipt', () => {
  it('renders sent status', () => {
    render(<ReadReceipt status="sent" />);
    const badge = screen.getByTitle('Sent');
    expect(badge).toBeInTheDocument();
  });

  it('renders delivered status', () => {
    render(<ReadReceipt status="delivered" />);
    const badge = screen.getByTitle('Delivered');
    expect(badge).toBeInTheDocument();
  });

  it('renders read status', () => {
    render(<ReadReceipt status="read" />);
    const badge = screen.getByTitle('Read');
    expect(badge).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ReadReceipt status="sent" className="custom-class" />);
    const badge = screen.getByTitle('Sent');
    expect(badge.className).toContain('custom-class');
  });

  it('has inline-flex layout', () => {
    render(<ReadReceipt status="sent" />);
    const badge = screen.getByTitle('Sent');
    expect(badge.className).toContain('inline-flex');
  });
});
