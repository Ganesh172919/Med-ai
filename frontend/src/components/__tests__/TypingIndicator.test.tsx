import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TypingIndicator from '../TypingIndicator';

describe('TypingIndicator', () => {
  it('renders the AI avatar', () => {
    render(<TypingIndicator />);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('shows initial thinking text', () => {
    render(<TypingIndicator />);
    expect(screen.getByText('Reasoning...')).toBeInTheDocument();
  });

  it('renders three dots', () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll('.w-2.h-2.rounded-full');
    expect(dots.length).toBe(3);
  });

  it('has animated container', () => {
    const { container } = render(<TypingIndicator />);
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
  });
});
