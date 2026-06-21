/**
 * =============================================================================
 * Response Compression Middleware
 * =============================================================================
 *
 * PURPOSE:
 * Compresses HTTP response bodies using gzip/brotli to reduce bandwidth usage
 * and improve response times for API clients.
 *
 * MIGRATION NOTE (Iteration 2):
 * This file previously contained a custom gzip implementation that monkey-patched
 * res.write() and res.end() to buffer the entire response in memory before
 * compressing. That approach had several issues:
 *   - Buffered entire response body in memory (problematic for large responses)
 *   - No streaming support (entire body compressed at once)
 *   - No brotli support (only gzip)
 *   - Reimplemented logic already available in the `compression` npm package
 *
 * This file now wraps the battle-tested `compression` npm package which:
 *   - Streams compression (constant memory regardless of response size)
 *   - Supports both gzip and deflate (brotli via separate package)
 *   - Handles edge cases (HEAD requests, already-encoded, no-transform)
 *   - Used by millions of Express applications in production
 *
 * WHY THIS EXISTS:
 * JSON API responses can be large (model lists, message histories, etc.).
 * Compression typically reduces JSON payload size by 60-80%, which:
 *   - Reduces bandwidth costs
 *   - Improves response time on slow connections
 *   - Reduces mobile data usage
 *   - Improves perceived performance
 *
 * COMPRESSIBLE TYPES:
 * - application/json (API responses)
 * - text/html (HTML pages)
 * - text/css (Stylesheets)
 * - text/plain (Plain text)
 * - application/javascript (Scripts)
 *
 * NOT COMPRESSED:
 * - Images (already compressed: JPEG, PNG, WebP)
 * - Videos (already compressed: MP4, WebM)
 * - Archives (already compressed: ZIP, gzip)
 * - Small responses (< 1KB - overhead not worth it)
 *
 * PERFORMANCE IMPACT:
 * - CPU: Minimal for typical API responses (< 1ms)
 * - Memory: Streaming — constant regardless of response size
 * - Network: 60-80% reduction in payload size
 *
 * LEARNING NOTES:
 * - gzip is the most widely supported compression algorithm
 * - brotli offers better compression but less browser support
 * - Compression trades CPU for bandwidth
 * - Don't compress already-compressed content (images, videos)
 * - Streaming compression is O(1) memory, buffering is O(n)
 * =============================================================================
 */

const compression = require('compression');

/**
 * Create compression middleware with configurable options.
 *
 * WHY FACTORY PATTERN:
 * Maintains the same API as the previous custom implementation so that
 * index.js doesn't need to change. The threshold option controls the
 * minimum response size (in bytes) that will be compressed.
 *
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Minimum response size in bytes (default: 1024)
 * @returns {Function} Express middleware function
 *
 * COMPLEXITY:
 * - Time: O(n) where n is response body size (streaming)
 * - Space: O(1) — streaming compression, no full-body buffer
 */
function createCompressionMiddleware(options = {}) {
  return compression({
    // Minimum response size to compress (1KB default)
    // Responses smaller than this don't benefit from compression
    // because the compressed overhead is close to the original size.
    threshold: options.threshold || 1024,

    // Compression level: 6 is the default balance of speed vs ratio.
    // Level 1 = fastest, Level 9 = best compression.
    // Level 6 typically achieves 60-80% reduction for JSON with < 1ms overhead.
    level: 6,

    // Only compress if the client supports it (Accept-Encoding header)
    // This is handled automatically by the compression package.
  });
}

module.exports = { createCompressionMiddleware };
