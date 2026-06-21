/**
 * =============================================================================
 * Skeleton Loading Components
 * =============================================================================
 *
 * PURPOSE:
 * Provides placeholder loading UI that mimics the shape of content before
 * it loads. This improves perceived performance by showing users something
 * is happening, rather than a blank screen.
 *
 * WHY SKELETONS VS SPINNERS:
 * - Spinners: Generic "loading" indicator, no hint of content shape
 * - Skeletons: Mimic final content layout, reduce perceived wait time
 *
 * Research shows skeletons feel 20-30% faster than spinners because users
 * can anticipate what content will appear where.
 *
 * USAGE:
 *   <MessageSkeleton />        // Single message placeholder
 *   <MessageSkeleton count={5} /> // Multiple messages
 *   <ConversationSkeleton />   // Sidebar conversation placeholder
 *   <CardSkeleton />           // Generic card placeholder
 *
 * ANIMATION:
 * Uses CSS animation (pulse) for the shimmer effect. This is more
 * performant than JavaScript-based animations because it runs on the
 * GPU compositor thread.
 *
 * ACCESSIBILITY:
 * - Uses aria-hidden="true" (decorative, not real content)
 * - Screen readers skip skeletons entirely
 * - When real content loads, it replaces the skeleton naturally
 *
 * LEARNING NOTES:
 * - Skeleton screens are a UX pattern popularized by Facebook/Meta
 * - They work best for content-heavy UIs (lists, cards, text)
 * - Don't use for instant operations (< 200ms)
 * - Match skeleton shape to actual content shape for best effect
 * =============================================================================
 */

/**
 * Base skeleton element with shimmer animation.
 *
 * WHY A BASE COMPONENT:
 * Reduces duplication. All skeleton shapes use the same animation and
 * color. The base component handles this, and specific skeletons
 * compose it with different sizes and shapes.
 *
 * @param className - Additional CSS classes for sizing/shape
 */
function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-navy-700/40 ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for a chat message bubble.
 *
 * SHAPE MIMICRY:
 * Matches the layout of MessageBubble:
 * - Avatar (circle)
 * - Username line
 * - Content lines (2-3 lines of varying width)
 * - Timestamp
 *
 * @param count - Number of skeleton messages to render (default: 1)
 */
export function MessageSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-2">
          {/* Avatar */}
          <SkeletonBase className="w-8 h-8 rounded-lg flex-shrink-0" />

          <div className="flex-1 space-y-2">
            {/* Username + timestamp */}
            <div className="flex items-center gap-2">
              <SkeletonBase className="h-3 w-20" />
              <SkeletonBase className="h-2 w-12" />
            </div>

            {/* Content lines */}
            <div className="space-y-1.5">
              <SkeletonBase className="h-3 w-full" />
              <SkeletonBase className="h-3 w-5/6" />
              <SkeletonBase className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for a conversation sidebar item.
 *
 * SHAPE MIMICRY:
 * Matches the conversation list items in SoloChat sidebar:
 * - Title line
 * - Timestamp
 *
 * @param count - Number of skeleton items to render (default: 5)
 */
export function ConversationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1.5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-navy-700/60 bg-navy-800/60 px-3 py-2"
        >
          <SkeletonBase className="h-3 w-3/4 mb-1.5" />
          <SkeletonBase className="h-2 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for a room card.
 *
 * SHAPE MIMICRY:
 * Matches RoomCard layout:
 * - Title
 * - Description (2 lines)
 * - Tags
 * - Member count
 *
 * @param count - Number of skeleton cards to render (default: 3)
 */
export function RoomCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-navy-700/50 bg-navy-800/40 p-5"
        >
          <SkeletonBase className="h-4 w-2/3 mb-3" />
          <div className="space-y-1.5 mb-4">
            <SkeletonBase className="h-3 w-full" />
            <SkeletonBase className="h-3 w-4/5" />
          </div>
          <div className="flex gap-2">
            <SkeletonBase className="h-5 w-16 rounded-full" />
            <SkeletonBase className="h-5 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for a generic card content.
 *
 * VERSATILE:
 * Can be used anywhere a card-like loading state is needed.
 *
 * @param count - Number of skeleton cards to render (default: 1)
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-navy-700/50 bg-navy-800/40 p-5"
        >
          <SkeletonBase className="h-5 w-1/2 mb-4" />
          <div className="space-y-2">
            <SkeletonBase className="h-3 w-full" />
            <SkeletonBase className="h-3 w-full" />
            <SkeletonBase className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for user list items.
 *
 * @param count - Number of skeleton users to render (default: 5)
 */
export function UserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <SkeletonBase className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <SkeletonBase className="h-3 w-24 mb-1" />
            <SkeletonBase className="h-2 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Full page loading skeleton for dashboard-like layouts.
 *
 * COMPOSITION:
 * Composes multiple skeleton types to create a complete page skeleton.
 * This is useful for initial page loads where multiple sections load
 * independently.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6" aria-hidden="true">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-6 w-48" />
        <SkeletonBase className="h-8 w-24 rounded-xl" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-navy-700/50 bg-navy-800/40 p-4">
            <SkeletonBase className="h-3 w-20 mb-2" />
            <SkeletonBase className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton count={2} />
        </div>
        <div>
          <UserListSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}
