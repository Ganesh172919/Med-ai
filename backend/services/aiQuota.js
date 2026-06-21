const AI_WINDOW_MS = 15 * 60 * 1000;
const AI_MAX_REQUESTS = 20;

// TTL-based cleanup interval: evict expired entries every 5 minutes
// to prevent unbounded memory growth in long-running servers.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const quotaMap = new Map();

/**
 * Evict expired quota entries from the map.
 * Called periodically by the cleanup interval to prevent memory leaks.
 *
 * COMPLEXITY: O(n) where n is the number of entries in the map.
 * In practice, n is bounded by the number of unique users in the
 * current 15-minute window, so this is efficient.
 */
function evictExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of quotaMap.entries()) {
    if (entry.resetAt <= now) {
      quotaMap.delete(key);
    }
  }
}

// Start periodic cleanup — unref() so it doesn't keep the process alive
const cleanupTimer = setInterval(evictExpiredEntries, CLEANUP_INTERVAL_MS);
cleanupTimer.unref();

function consumeAiQuota(key, maxRequests = AI_MAX_REQUESTS, windowMs = AI_WINDOW_MS) {
  const now = Date.now();
  const existing = quotaMap.get(key);

  if (!existing || existing.resetAt <= now) {
    quotaMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfterMs: 0,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfterMs: 0,
  };
}

module.exports = {
  AI_WINDOW_MS,
  AI_MAX_REQUESTS,
  consumeAiQuota,
};
