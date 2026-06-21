import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkipToContent from '../SkipToContent';

describe('SkipToContent', () => {
  it('renders the skip link', () => {
    render(<SkipToContent />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('has correct href attribute', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('focuses main-content element on click', () => {
    // Create a target element
    const main = document.createElement('div');
    main.id = 'main-content';
    main.tabIndex = -1;
    main.scrollIntoView = vi.fn();
    document.body.appendChild(main);

    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    fireEvent.click(link);

    expect(document.activeElement).toBe(main);
    document.body.removeChild(main);
  });

  it('prevents default link behavior on click', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    const event = fireEvent.click(link);
    // fireEvent.click returns false if preventDefault was called
    expect(event).toBe(false);
  });

  it('handles missing main-content element gracefully', () => {
    render(<SkipToContent />);
    const link = screen.getByText('Skip to main content');
    // Should not throw when target doesn't exist
    expect(() => fireEvent.click(link)).not.toThrow();
  });
});
