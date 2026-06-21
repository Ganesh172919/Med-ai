/**
 * =============================================================================
 * ErrorBoundary Component
 * =============================================================================
 *
 * PURPOSE:
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the entire application.
 *
 * WHY THIS EXISTS:
 * Without error boundaries, a single component error crashes the whole app.
 * With this, we can:
 *   1. Show a user-friendly error message
 *   2. Log the error for debugging
 *   3. Provide a "Try Again" button to recover
 *   4. Prevent full page reloads
 *
 * USAGE:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * PATTERNS:
 * - React class component (required for error boundary lifecycle)
 * - Fallback UI with recovery option
 * - Error logging for observability
 *
 * LEARNING NOTES:
 * - Error boundaries are the ONLY way to catch rendering errors
 * - They don't catch errors in event handlers (use try/catch)
 * - They don't catch errors in async code (use try/catch)
 * - They don't catch errors in the boundary itself
 * =============================================================================
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Props for the ErrorBoundary component.
 *
 * @property children - React nodes to wrap with error boundary
 * @property fallback - Optional custom fallback UI (overrides default)
 * @property onError - Optional callback when error is caught (for logging)
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for the ErrorBoundary component.
 *
 * @property hasError - Whether an error has been caught
 * @property error - The caught error object (null if no error)
 * @property errorInfo - React component stack info (null if no error)
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component that catches rendering errors in child components.
 *
 * WHY CLASS COMPONENT:
 * React doesn't have a hook equivalent for getDerivedStateFromError or
 * componentDidCatch. Class components are the only way to create error
 * boundaries. This is one of the few cases where class components are
 * preferred over functional components.
 *
 * LIFECYCLE:
 * 1. getDerivedStateFromError() - Updates state to show fallback UI
 * 2. componentDidCatch() - Logs error details for debugging
 *
 * RECOVERY:
 * Users can click "Try Again" to reset the error state and re-render
 * the children. This works because React will attempt to render the
 * children again from scratch.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Called when an error is thrown during rendering.
   *
   * PURPOSE: Update state so the next render shows the fallback UI.
   *
   * WHY STATIC:
   * This method is called during the "render" phase, so it must be pure.
   * It can't have side effects or access `this`. It only returns new state.
   *
   * @param error - The error that was thrown
   * @returns New state with hasError: true
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Called after an error has been thrown during rendering.
   *
   * PURPOSE: Log the error for debugging and monitoring.
   *
   * WHY componentDidCatch (NOT getDerivedStateFromError):
   * - getDerivedStateFromError is for state updates (render phase)
   * - componentDidCatch is for side effects (commit phase)
   * - Logging is a side effect, so it belongs here
   *
   * @param error - The error that was thrown
   * @param errorInfo - Component stack trace information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info for display
    this.setState({ errorInfo });

    // Call optional error callback (for external logging services)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send to an error tracking service:
    // Sentry.captureException(error, { extra: errorInfo });
    // LogRocket.captureException(error);
  }

  /**
   * Reset the error state to attempt recovery.
   *
   * WHY THIS WORKS:
   * Setting hasError to false causes React to re-render the children.
   * If the error was transient (network issue, race condition), the
   * children will render successfully. If the error persists, the
   * boundary will catch it again.
   *
   * TRADE-OFFS:
   * - Pro: User can recover without full page reload
   * - Con: If error is persistent, user sees repeated error screens
   * - Mitigation: Could add retry count limit
   */
  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    // If no error, render children normally
    if (!hasError) {
      return children;
    }

    // If custom fallback provided, use it
    if (fallback) {
      return fallback;
    }

    // Default error UI
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-navy-800/80 p-8 backdrop-blur-xl">
          {/* Error icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <AlertTriangle className="text-red-400" size={32} />
          </div>

          {/* Error title */}
          <h2 className="mb-2 font-display text-2xl font-semibold text-white">
            Something went wrong
          </h2>

          {/* Error description */}
          <p className="mb-6 text-sm leading-relaxed text-gray-400">
            An unexpected error occurred. This has been logged and we'll look into it.
            You can try refreshing the page or clicking the button below.
          </p>

          {/* Error details (collapsible) */}
          {error && (
            <details className="mb-6 rounded-xl border border-navy-700/60 bg-navy-900/60 p-4">
              <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-300">
                Technical Details
              </summary>
              <pre className="mt-3 overflow-x-auto text-xs text-red-400/80">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25"
              type="button"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-navy-700/60 px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-neon-purple/30 hover:text-white"
              type="button"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
