import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GrammarSuggestion from '../GrammarSuggestion';

vi.mock('../../api/ai', () => ({
  checkGrammar: vi.fn(),
}));

describe('GrammarSuggestion', () => {
  it('returns null when disabled', () => {
    const { container } = render(
      <GrammarSuggestion text="Hello world" onAccept={vi.fn()} enabled={false} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when enabled but text is too short', () => {
    render(
      <GrammarSuggestion text="Hi" onAccept={vi.fn()} enabled={true} />
    );
    expect(screen.queryByText('Grammar')).not.toBeInTheDocument();
  });

  it('shows grammar button when text is long enough', () => {
    render(
      <GrammarSuggestion text="This is a longer text for checking" onAccept={vi.fn()} enabled={true} />
    );
    expect(screen.getByText('Grammar')).toBeInTheDocument();
  });

  it('shows check grammar label', () => {
    render(
      <GrammarSuggestion text="This is a longer text for checking" onAccept={vi.fn()} enabled={true} />
    );
    expect(screen.getByLabelText('Check grammar')).toBeInTheDocument();
  });
});
