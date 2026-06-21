/**
 * =============================================================================
 * Security Headers Middleware
 * =============================================================================
 *
 * PURPOSE:
 * Adds security-related HTTP headers to all responses to protect against
 * common web vulnerabilities like XSS, clickjacking, MIME sniffing, etc.
 *
 * WHY THIS EXISTS:
 * Modern browsers support security headers that prevent entire classes of
 * attacks. Without these headers, the application is vulnerable to:
 *   - Cross-Site Scripting (XSS)
 *   - Clickjacking (UI redress attacks)
 *   - MIME type sniffing
 *   - Protocol downgrade attacks
 *   - Information leakage via Referrer header
 *
 * USAGE:
 *   const { securityHeaders } = require('./middleware/security');
 *   app.use(securityHeaders);
 *
 * HEADERS EXPLAINED:
 *
 * 1. X-Content-Type-Options: nosniff
 *    - Prevents browser from MIME-sniffing the response
 *    - Stops attackers from serving HTML as JavaScript
 *
 * 2. X-Frame-Options: DENY
 *    - Prevents page from being embedded in iframes
 *    - Stops clickjacking attacks
 *
 * 3. X-XSS-Protection: 1; mode=block
 *    - Enables browser's built-in XSS filter
 *    - Blocks page if XSS attack detected
 *
 * 4. Referrer-Policy: strict-origin-when-cross-origin
 *    - Controls how much referrer info is sent
 *    - Prevents leaking full URLs to external sites
 *
 * 5. Permissions-Policy
 *    - Restricts browser features (camera, mic, etc.)
 *    - Prevents malicious scripts from accessing hardware
 *
 * 6. Content-Security-Policy (CSP)
 *    - Controls which resources can be loaded
 *    - Most powerful XSS prevention mechanism
 *
 * LEARNING NOTES:
 * - These headers are FREE security - no performance impact
 * - They're defense-in-depth, not a replacement for input validation
 * - Different headers protect against different attack vectors
 * - CSP is the most complex but most effective
 * =============================================================================
 */

/**
 * Security headers middleware function.
 *
 * Adds security headers to every HTTP response. These headers instruct the
 * browser to enforce security policies, preventing common attacks.
 *
 * WHY MIDDLEWARE (NOT ROUTE-SPECIFIC):
 * Security headers should apply to ALL responses, not just API endpoints.
 * Static files, error pages, and health checks all benefit from these headers.
 *
 * PERFORMANCE IMPACT:
 * Negligible - headers are just key-value pairs added to the response.
 * No computation, no database queries, no external calls.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function securityHeaders(req, res, next) {
  // -------------------------------------------------------------------------
  // X-Content-Type-Options: nosniff
  // -------------------------------------------------------------------------
  // WHY: Prevents MIME type sniffing attacks where a browser incorrectly
  // interprets a file as a different type (e.g., treating an image as HTML).
  // This is a common vector for stored XSS attacks.
  //
  // EXAMPLE ATTACK:
  // 1. Attacker uploads a file that looks like both PNG and HTML
  // 2. Browser sniffs it as HTML and executes embedded scripts
  // 3. nosniff forces browser to trust the Content-Type header
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // -------------------------------------------------------------------------
  // X-Frame-Options: DENY
  // -------------------------------------------------------------------------
  // WHY: Prevents the page from being embedded in an iframe on another site.
  // This stops clickjacking attacks where a user thinks they're clicking
  // one thing but actually clicking another (invisible iframe overlay).
  //
  // ALTERNATIVE: SAMEORIGIN (allows iframes from same domain)
  // We use DENY because ChatSphere pages shouldn't be iframed at all.
  //
  // TRADE-OFF: This prevents legitimate embedding too (e.g., previews).
  // If embedding is needed, use CSP frame-ancestors instead.
  res.setHeader('X-Frame-Options', 'DENY');

  // -------------------------------------------------------------------------
  // X-XSS-Protection: 1; mode=block
  // -------------------------------------------------------------------------
  // WHY: Enables the browser's built-in XSS filter (legacy but still useful).
  // If the browser detects a reflected XSS attack, it blocks the entire page.
  //
  // NOTE: Modern browsers are deprecating this in favor of CSP.
  // We include it for older browser compatibility.
  //
  // MODE: "block" prevents rendering entirely (vs "sanitize" which tries
  // to fix the XSS, which can be bypassed).
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // -------------------------------------------------------------------------
  // Referrer-Policy: strict-origin-when-cross-origin
  // -------------------------------------------------------------------------
  // WHY: Controls how much referrer information is sent with requests.
  //
  // POLICY BREAKDOWN:
  // - Same-origin: Send full URL (needed for analytics, debugging)
  // - Cross-origin: Send only origin (prevents leaking path/query)
  // - Downgrade: Don't send referrer when going HTTPS → HTTP
  //
  // SECURITY: Prevents leaking sensitive URLs (e.g., reset tokens in URL)
  // to external sites via the Referer header.
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // -------------------------------------------------------------------------
  // Permissions-Policy
  // -------------------------------------------------------------------------
  // WHY: Restricts which browser features the page can use.
  // Even if an attacker injects script, they can't access:
  // - Camera/Microphone (privacy)
  // - Geolocation (privacy)
  // - Payment API (financial)
  // - USB/Serial (hardware access)
  //
  // TRADE-OFF: If ChatSphere needs these features (e.g., voice chat),
  // update this policy accordingly.
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()'
  );

  // -------------------------------------------------------------------------
  // Content-Security-Policy (CSP)
  // -------------------------------------------------------------------------
  // WHY: The most powerful XSS prevention mechanism. CSP tells the browser
  // exactly which resources (scripts, styles, images, etc.) are allowed.
  //
  // POLICY BREAKDOWN:
  // - default-src 'self': Only allow resources from same origin
  // - script-src 'self' 'unsafe-inline': Allow scripts from same origin
  //   (unsafe-inline needed for Vite dev server in development)
  // - style-src 'self' 'unsafe-inline': Allow styles from same origin
  //   (unsafe-inline needed for Tailwind CSS dynamic classes)
  // - img-src 'self' data: blob: Allow images from same origin + data URLs
  //   (data: needed for base64-encoded images in chat)
  // - connect-src 'self' ws: http: https: Allow WebSocket and HTTP connections
  //   (ws: needed for Socket.IO, broad domains needed for AI providers)
  // - font-src 'self': Only allow fonts from same origin
  // - object-src 'none': Block plugins (Flash, Java, etc.)
  // - frame-src 'none': Block iframes (consistent with X-Frame-Options)
  //
  // TRADE-OFF: Strict CSP breaks many third-party integrations.
  // This policy is permissive enough for ChatSphere's needs while
  // still preventing the most dangerous attacks.
  //
  // PRODUCTION NOTE: In production, remove 'unsafe-inline' and use
  // nonces or hashes for inline scripts. This requires build tool changes.
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self'",
        "connect-src 'self' wss: https:",
        "object-src 'none'",
        "frame-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );
  } else {
    // Development: More permissive CSP for dev server and hot reload
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: http: https:",
        "font-src 'self' data:",
        "connect-src 'self' ws: http: https:",
        "object-src 'none'",
        "frame-src 'none'",
      ].join('; ')
    );
  }

  // -------------------------------------------------------------------------
  // X-DNS-Prefetch-Control
  // -------------------------------------------------------------------------
  // WHY: Controls DNS prefetching, which can leak information about which
  // domains a user is likely to visit. Disabling it prevents the browser
  // from proactively resolving DNS for links on the page.
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // -------------------------------------------------------------------------
  // Cross-Origin-Embedder-Policy (COEP)
  // -------------------------------------------------------------------------
  // WHY: Prevents loading cross-origin resources that don't explicitly
  // opt in. This mitigates Spectre-style side-channel attacks.
  // 'credentialless' allows cross-origin images/scripts without credentials.
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');

  // -------------------------------------------------------------------------
  // Cross-Origin-Opener-Policy (COOP)
  // -------------------------------------------------------------------------
  // WHY: Isolates the browsing context so cross-origin pages can't
  // reference this window via window.open or window.opener.
  // Prevents cross-origin attacks that rely on window references.
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // -------------------------------------------------------------------------
  // Cross-Origin-Resource-Policy (CORP)
  // -------------------------------------------------------------------------
  // WHY: Prevents cross-origin pages from reading this response.
  // 'same-origin' restricts loading to same-origin requests only.
  // This is defense-in-depth against Spectre-type attacks.
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // -------------------------------------------------------------------------
  // Strict-Transport-Security (HSTS)
  // -------------------------------------------------------------------------
  // WHY: Forces browsers to use HTTPS for all future requests to this domain.
  // Prevents protocol downgrade attacks (HTTPS → HTTP).
  //
  // ONLY IN PRODUCTION: HSTS on localhost causes issues with self-signed certs.
  //
  // MAX-AGE: 1 year (31536000 seconds)
  // INCLUDE-SUBDOMAINS: Apply to all subdomains
  // PRELOAD: Allow inclusion in browser HSTS preload lists
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
}

module.exports = { securityHeaders };
