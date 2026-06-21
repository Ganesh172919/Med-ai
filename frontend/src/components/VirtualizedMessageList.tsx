/**
 * =============================================================================
 * VirtualizedMessageList Component
 * =============================================================================
 *
 * PURPOSE:
 * Efficiently renders long message lists by only mounting messages near the
 * viewport. Uses IntersectionObserver for lightweight virtualization without
 * heavy dependencies like react-window.
 *
 * STRATEGY:
 * - Recent messages (last N) are always mounted for smooth scrolling
 * - Older messages are lazy-mounted when they scroll into view
 * - Messages far from viewport are unmounted to save memory
 *
 * WHY NOT REACT-WINDOW:
 * - Chat messages have variable heights (code blocks, markdown, images)
 * - react-window requires fixed or estimated heights
 * - IntersectionObserver approach handles variable heights naturally
 * - Zero additional dependencies
 *
 * USAGE:
 *   <VirtualizedMessageList messages={messages} renderItem={(msg) => <MessageBubble msg={msg} />} />
 */

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';

interface VirtualizedMessageListProps<T> {
  messages: T[];
  renderItem: (message: T, index: number) => ReactNode;
  /** Number of recent messages to always keep mounted (default: 20) */
  alwaysRender?: number;
  /** Root margin for IntersectionObserver (default: '500px') */
  overscan?: string;
  /** Key extractor for stable React keys */
  getKey: (message: T) => string;
  /** Ref to the scroll container */
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * A message list that virtualizes older messages for performance.
 *
 * Recent messages are always mounted. Older messages use IntersectionObserver
 * to mount/unmount as they enter/leave the viewport + overscan area.
 */
export default function VirtualizedMessageList<T>({
  messages,
  renderItem,
  alwaysRender = 20,
  overscan = '500px',
  getKey,
  scrollRef,
}: VirtualizedMessageListProps<T>) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Messages that should always be rendered (recent ones)
  const alwaysRenderKeys = new Set(
    messages.slice(-alwaysRender).map(getKey)
  );

  // Set up IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleKeys((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            const key = entry.target.getAttribute('data-msg-key');
            if (!key) continue;
            if (entry.isIntersecting) {
              next.add(key);
            } else {
              // Only unmount if not in always-render set
              if (!alwaysRenderKeys.has(key)) {
                next.delete(key);
              }
            }
          }
          return next;
        });
      },
      {
        root: container,
        rootMargin: overscan,
        threshold: 0,
      }
    );

    // Observe all sentinel elements
    sentinelRefs.current.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [messages.length, overscan, scrollRef]);

  // Register sentinel ref
  const setSentinelRef = useCallback(
    (key: string, el: HTMLDivElement | null) => {
      if (el) {
        sentinelRefs.current.set(key, el);
        observerRef.current?.observe(el);
      } else {
        const existing = sentinelRefs.current.get(key);
        if (existing) {
          observerRef.current?.unobserve(existing);
          sentinelRefs.current.delete(key);
        }
      }
    },
    []
  );

  // Always render recent messages + visible older messages
  const shouldRender = (key: string) =>
    alwaysRenderKeys.has(key) || visibleKeys.has(key);

  return (
    <>
      {messages.map((msg, index) => {
        const key = getKey(msg);
        const rendered = shouldRender(key);

        return (
          <div key={key} data-msg-key={key} ref={(el) => setSentinelRef(key, el)}>
            {rendered ? (
              renderItem(msg, index)
            ) : (
              // Placeholder to maintain scroll position
              <div style={{ height: '80px' }} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </>
  );
}
