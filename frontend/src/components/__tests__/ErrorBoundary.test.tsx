/**
 * =============================================================================
 * ErrorBoundary Component Tests
 * =============================================================================
 *
 * Tests for the React error boundary that catches rendering errors.
 *
 * WHY THESE TESTS MATTER:
 * - Error boundaries prevent full app crashes
 * - The fallback UI must be accessible and informative
 * - Recovery (retry) must work correctly
 * - Error callbacks must be called for logging
 *
 * TESTING PATTERN:
 * We use a helper component that throws on demand to test the boundary.
 * This is the standard pattern for testing error boundaries in React.
 * =============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary';

/**
 * Helper component that throws an error when shouldThrow is true.
 *
 * WHY THIS EXISTS:
 * Error boundaries only catch errors during rendering. We need a component
 * that conditionally throws to test the boundary's behavior.
 *
 * @param shouldThrow - If true, throws an error during render
 */
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Child rendered successfully</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Child rendered successfully')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    // Suppress console.error for this test (expected error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('shows error message in technical details', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Click the details toggle
    const detailsToggle = screen.getByText('Technical Details');
    detailsToggle.click();

    expect(screen.getByText(/Test error/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls onError callback when error is caught', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );

    consoleSpy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('resets error state on retry', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    // Track render attempts across StrictMode double-renders.
    // StrictMode renders twice per mount, so we use a flag that stays
    // false until the error boundary successfully catches and recovers.
    let shouldThrow = true;
    function ThrowOnce() {
      if (shouldThrow) {
        throw new Error('First render error');
      }
      return <div>Recovered successfully</div>;
    }

    render(
      <ErrorBoundary>
        <ThrowOnce />
      </ErrorBoundary>
    );

    // Error state shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Allow recovery after retry
    shouldThrow = false;

    // Click retry
    await user.click(screen.getByText('Try Again'));

    // Should recover
    expect(screen.getByText('Recovered successfully')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
