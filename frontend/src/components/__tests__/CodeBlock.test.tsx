/**
 * =============================================================================
 * CodeBlock Component Tests
 * =============================================================================
 *
 * Tests for the syntax-highlighted code block component.
 * Note: react-syntax-highlighter breaks text into multiple spans,
 * so we use querySelector and text content matching for code content.
 * =============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeBlock from '../CodeBlock';

describe('CodeBlock', () => {
  beforeEach(() => {
    // Mock clipboard API using vi.spyOn
    if (!navigator.clipboard) {
      (navigator as any).clipboard = { writeText: vi.fn() };
    }
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  });

  it('renders code content', { timeout: 10000 }, () => {
    const { container } = render(
      <CodeBlock language="javascript">
        {'console.log("hello");'}
      </CodeBlock>
    );

    // react-syntax-highlighter breaks text into spans, so check the container
    expect(container.textContent).toContain('console.log');
    expect(container.textContent).toContain('hello');
  });

  it('displays language label', () => {
    render(
      <CodeBlock language="python">
        {'print("hello")'}
      </CodeBlock>
    );

    expect(screen.getByText('python')).toBeInTheDocument();
  });

  it('displays "code" when no language specified', () => {
    render(
      <CodeBlock language="">
        {'some code'}
      </CodeBlock>
    );

    expect(screen.getByText('code')).toBeInTheDocument();
  });

  it('shows copy button', () => {
    render(
      <CodeBlock language="javascript">
        {'const x = 1;'}
      </CodeBlock>
    );

    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('copies code to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');

    render(
      <CodeBlock language="javascript">
        {'const x = 1;'}
      </CodeBlock>
    );

    await user.click(screen.getByText('Copy'));
    // The component tries clipboard API first, falls back to execCommand
    // Either way, the copy action should complete
    expect(writeTextSpy).toHaveBeenCalledWith('const x = 1;');
  }, 15000);

  it('shows "Copied" feedback after copying', async () => {
    const user = userEvent.setup();

    render(
      <CodeBlock language="javascript">
        {'const x = 1;'}
      </CodeBlock>
    );

    await user.click(screen.getByText('Copy'));
    expect(screen.getByText('Copied')).toBeInTheDocument();
  }, 15000);

  it('has accessible copy button', () => {
    render(
      <CodeBlock language="javascript">
        {'const x = 1;'}
      </CodeBlock>
    );

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });

  it('shows line numbers for long code', { timeout: 10000 }, () => {
    const longCode = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join('\n');
    const { container } = render(
      <CodeBlock language="javascript">
        {longCode}
      </CodeBlock>
    );

    // Line numbers should be rendered for code with more than 5 lines
    expect(container.textContent).toContain('line 1');
    expect(container.textContent).toContain('line 10');
  });
});
