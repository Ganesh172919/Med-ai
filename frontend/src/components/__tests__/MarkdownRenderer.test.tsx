import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkdownRenderer from '../MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders plain text', () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders headings', () => {
    render(<MarkdownRenderer content="# Heading 1" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1');
  });

  it('renders bold text', () => {
    render(<MarkdownRenderer content="**bold text**" />);
    expect(screen.getByText('bold text')).toBeInTheDocument();
  });

  it('renders links with target blank', () => {
    render(<MarkdownRenderer content="[link](https://example.com)" />);
    const link = screen.getByText('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders inline code', () => {
    render(<MarkdownRenderer content="Use `console.log`" />);
    expect(screen.getByText('console.log')).toBeInTheDocument();
  });

  it('renders content in markdown container', () => {
    render(<MarkdownRenderer content="Some **bold** and *italic* text" />);
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('renders blockquotes', () => {
    render(<MarkdownRenderer content="> This is a quote" />);
    expect(screen.getByText('This is a quote')).toBeInTheDocument();
  });

  it('has markdown-content class', () => {
    const { container } = render(<MarkdownRenderer content="Test" />);
    expect(container.firstChild).toHaveClass('markdown-content');
  });
});
