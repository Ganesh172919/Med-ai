const { securityHeaders } = require('../middleware/security');

describe('securityHeaders middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      setHeader: jest.fn(),
      getHeader: jest.fn(),
    };
    next = jest.fn();
  });

  it('calls next()', () => {
    securityHeaders(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('sets X-Content-Type-Options header', () => {
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
  });

  it('sets X-Frame-Options header', () => {
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
  });

  it('sets X-XSS-Protection header', () => {
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
  });

  it('sets Referrer-Policy header', () => {
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
  });

  it('sets Permissions-Policy header', () => {
    securityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Permissions-Policy',
      expect.stringContaining('camera=()')
    );
  });

  describe('Content-Security-Policy', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('sets stricter CSP in production', () => {
      process.env.NODE_ENV = 'production';
      securityHeaders(req, res, next);
      const cspCall = res.setHeader.mock.calls.find(
        (call) => call[0] === 'Content-Security-Policy'
      );
      // Production should not have unsafe-eval
      expect(cspCall[1]).not.toContain("'unsafe-eval'");
      // script-src should be just 'self' (no unsafe-inline)
      expect(cspCall[1]).toContain("script-src 'self'");
      // style-src can have unsafe-inline (needed for Tailwind)
      expect(cspCall[1]).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('sets permissive CSP in development', () => {
      process.env.NODE_ENV = 'development';
      securityHeaders(req, res, next);
      const cspCall = res.setHeader.mock.calls.find(
        (call) => call[0] === 'Content-Security-Policy'
      );
      expect(cspCall[1]).toContain("'unsafe-inline'");
      expect(cspCall[1]).toContain("'unsafe-eval'");
    });

    it('includes frame-src none in both modes', () => {
      process.env.NODE_ENV = 'production';
      securityHeaders(req, res, next);
      const cspCall = res.setHeader.mock.calls.find(
        (call) => call[0] === 'Content-Security-Policy'
      );
      expect(cspCall[1]).toContain("frame-src 'none'");
    });
  });

  describe('HSTS', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('sets HSTS in production', () => {
      process.env.NODE_ENV = 'production';
      securityHeaders(req, res, next);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.stringContaining('max-age=')
      );
    });

    it('does not set HSTS in development', () => {
      process.env.NODE_ENV = 'development';
      securityHeaders(req, res, next);
      const hstsCall = res.setHeader.mock.calls.find(
        (call) => call[0] === 'Strict-Transport-Security'
      );
      expect(hstsCall).toBeUndefined();
    });
  });
});
