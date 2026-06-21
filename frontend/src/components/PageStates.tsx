/**
 * =============================================================================
 * Standardized Page State Components
 * =============================================================================
 *
 * PURPOSE:
 * Provides consistent loading, error, and empty states across all pages.
 * Uses the project's design system (navy-800, neon-purple, etc.) for
 * visual consistency.
 *
 * COMPONENTS:
 * - PageLoader: Full-page loading spinner with optional message
 * - InlineError: Compact error display with retry action
 * - EmptyState: Friendly empty content message with optional CTA
 *
 * USAGE:
 *   <PageLoader message="Loading conversations..." />
 *   <InlineError message="Failed to load" onRetry={() => refetch()} />
 *   <EmptyState icon={MessageSquare} title="No messages" description="Start chatting!" />
 */

import { type ReactNode, type ElementType } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

/** Full-page loading state with animated spinner. */
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center animate-pulse-glow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400 animate-pulse">{message}</p>
      </motion.div>
    </div>
  );
}

/** Compact inline error display with optional retry button. */
export function InlineError({
  message = 'Something went wrong',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"
      role="alert"
    >
      <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
      <p className="flex-1 text-sm text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-colors"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </motion.div>
  );
}

/** Friendly empty state with icon, title, description, and optional CTA. */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
}: {
  icon?: ElementType;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-navy-800/60 border border-navy-700/50 flex items-center justify-center mb-4">
        <Icon size={24} className="text-gray-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-300 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
