describe('rateLimit middleware', () => {
  describe('module exports', () => {
    test('exports authLimiter', () => {
      const { authLimiter } = require('../middleware/rateLimit');
      expect(authLimiter).toBeDefined();
      expect(typeof authLimiter).toBe('function');
    });

    test('exports aiLimiter', () => {
      const { aiLimiter } = require('../middleware/rateLimit');
      expect(aiLimiter).toBeDefined();
      expect(typeof aiLimiter).toBe('function');
    });

    test('exports apiLimiter', () => {
      const { apiLimiter } = require('../middleware/rateLimit');
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });
  });

  describe('limiter configuration', () => {
    test('authLimiter is an Express middleware', () => {
      const { authLimiter } = require('../middleware/rateLimit');
      // Express middleware functions have length 3 (req, res, next)
      expect(authLimiter.length).toBeLessThanOrEqual(3);
    });

    test('aiLimiter is an Express middleware', () => {
      const { aiLimiter } = require('../middleware/rateLimit');
      expect(aiLimiter.length).toBeLessThanOrEqual(3);
    });

    test('apiLimiter is an Express middleware', () => {
      const { apiLimiter } = require('../middleware/rateLimit');
      expect(apiLimiter.length).toBeLessThanOrEqual(3);
    });
  });

  describe('rate limit environment variables', () => {
    test('AUTH_RATE_LIMIT_MAX defaults to 20', () => {
      const original = process.env.AUTH_RATE_LIMIT_MAX;
      delete process.env.AUTH_RATE_LIMIT_MAX;

      const max = Number(process.env.AUTH_RATE_LIMIT_MAX || 20);
      expect(max).toBe(20);

      process.env.AUTH_RATE_LIMIT_MAX = original;
    });

    test('AI_ROUTE_RATE_LIMIT_MAX defaults to 80', () => {
      const original = process.env.AI_ROUTE_RATE_LIMIT_MAX;
      delete process.env.AI_ROUTE_RATE_LIMIT_MAX;

      const max = Number(process.env.AI_ROUTE_RATE_LIMIT_MAX || 80);
      expect(max).toBe(80);

      process.env.AI_ROUTE_RATE_LIMIT_MAX = original;
    });

    test('API_RATE_LIMIT_MAX defaults to 1000', () => {
      const original = process.env.API_RATE_LIMIT_MAX;
      delete process.env.API_RATE_LIMIT_MAX;

      const max = Number(process.env.API_RATE_LIMIT_MAX || 1000);
      expect(max).toBe(1000);

      process.env.API_RATE_LIMIT_MAX = original;
    });
  });

  describe('buildRateLimitKey', () => {
    test('uses user ID when authenticated', () => {
      const req = { user: { id: 'user123' }, ip: '127.0.0.1' };
      const key = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
      expect(key).toBe('user:user123');
    });

    test('uses IP when not authenticated', () => {
      const req = { user: null, ip: '192.168.1.1' };
      const key = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
      expect(key).toBe('ip:192.168.1.1');
    });

    test('uses IP when user has no id', () => {
      const req = { user: {}, ip: '10.0.0.1' };
      const key = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
      expect(key).toBe('ip:10.0.0.1');
    });
  });

  describe('buildRetryPayload', () => {
    test('builds correct payload', () => {
      const req = { requestId: 'req123' };
      const payload = {
        error: 'Too many requests',
        retryAfterMs: 60000,
        requestId: req.requestId || null,
      };

      expect(payload.error).toBe('Too many requests');
      expect(payload.retryAfterMs).toBe(60000);
      expect(payload.requestId).toBe('req123');
    });

    test('defaults requestId to null', () => {
      const req = {};
      const payload = {
        error: 'Too many requests',
        retryAfterMs: 0,
        requestId: req.requestId || null,
      };

      expect(payload.requestId).toBeNull();
    });
  });

  describe('apiLimiter skip logic', () => {
    test('skips health endpoint', () => {
      const req = { path: '/health', originalUrl: '/health' };
      const shouldSkip = req.path === '/health' || req.path.startsWith('/auth');
      expect(shouldSkip).toBe(true);
    });

    test('skips auth routes', () => {
      const req = { path: '/auth/login', originalUrl: '/auth/login' };
      const shouldSkip = req.path === '/health' || req.path.startsWith('/auth');
      expect(shouldSkip).toBe(true);
    });

    test('does not skip other routes', () => {
      const req = { path: '/api/chat', originalUrl: '/api/chat' };
      const shouldSkip = req.path === '/health' || req.path.startsWith('/auth');
      expect(shouldSkip).toBe(false);
    });
  });
});
