import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SentimentBadge from '../SentimentBadge';

describe('SentimentBadge', () => {
  it('renders sentiment text', () => {
    render(<SentimentBadge sentiment="positive" emoji="😊" confidence={0.9} />);
    expect(screen.getByText('positive')).toBeInTheDocument();
  });

  it('renders emoji', () => {
    render(<SentimentBadge sentiment="positive" emoji="😊" confidence={0.9} />);
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('shows confidence in title', () => {
    render(<SentimentBadge sentiment="positive" emoji="😊" confidence={0.85} />);
    const badge = screen.getByText('positive').closest('span');
    expect(badge?.parentElement).toHaveAttribute('title', 'positive (85% confidence)');
  });

  it('applies positive style for positive sentiment', () => {
    render(<SentimentBadge sentiment="positive" emoji="😊" confidence={0.9} />);
    const badge = screen.getByText('positive').closest('span')?.parentElement;
    expect(badge?.className).toContain('emerald');
  });

  it('applies negative style for negative sentiment', () => {
    render(<SentimentBadge sentiment="negative" emoji="😞" confidence={0.8} />);
    const badge = screen.getByText('negative').closest('span')?.parentElement;
    expect(badge?.className).toContain('red');
  });

  it('applies neutral style for neutral sentiment', () => {
    render(<SentimentBadge sentiment="neutral" emoji="😐" confidence={0.5} />);
    const badge = screen.getByText('neutral').closest('span')?.parentElement;
    expect(badge?.className).toContain('gray');
  });

  it('applies excited style for excited sentiment', () => {
    render(<SentimentBadge sentiment="excited" emoji="🤩" confidence={0.95} />);
    const badge = screen.getByText('excited').closest('span')?.parentElement;
    expect(badge?.className).toContain('amber');
  });

  it('applies confused style for confused sentiment', () => {
    render(<SentimentBadge sentiment="confused" emoji="😕" confidence={0.6} />);
    const badge = screen.getByText('confused').closest('span')?.parentElement;
    expect(badge?.className).toContain('purple');
  });

  it('applies angry style for angry sentiment', () => {
    render(<SentimentBadge sentiment="angry" emoji="😡" confidence={0.9} />);
    const badge = screen.getByText('angry').closest('span')?.parentElement;
    expect(badge?.className).toContain('red-600');
  });

  it('falls back to neutral for unknown sentiment', () => {
    render(<SentimentBadge sentiment="unknown" emoji="❓" confidence={0.3} />);
    const badge = screen.getByText('unknown').closest('span')?.parentElement;
    expect(badge?.className).toContain('gray');
  });

  it('capitalizes sentiment text', () => {
    render(<SentimentBadge sentiment="positive" emoji="😊" confidence={0.9} />);
    const text = screen.getByText('positive');
    expect(text.className).toContain('capitalize');
  });
});
