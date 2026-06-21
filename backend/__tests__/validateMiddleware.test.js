/**
 * =============================================================================
 * Validation Middleware Tests
 * =============================================================================
 *
 * Tests for the request validation middleware functions.
 * These ensure API endpoints properly validate input before processing.
 *
 * WHY THESE TESTS:
 * - Validation is the first defense against bad input
 * - Consistent error responses across all endpoints
 * - Prevents invalid data from reaching business logic
 * =============================================================================
 */

const {
  requireBodyFields,
  requireBody,
  validateStringLength,
  validateEmail,
  validateEnum,
  validateNumber,
  validateArray,
  sanitizeHtml,
} = require('../middleware/validate');

// Helper to create mock req/res/next
function createMockReqRes(body = {}) {
  const req = { body: { ...body } };
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('requireBodyFields', () => {
  it('calls next when all fields present', () => {
    const { req, res, next } = createMockReqRes({ name: 'John', email: 'john@test.com' });
    requireBodyFields(['name', 'email'])(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBeNull();
  });

  it('returns 400 when fields missing', () => {
    const { req, res, next } = createMockReqRes({ name: 'John' });
    requireBodyFields(['name', 'email'])(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res.jsonData.error).toContain('email');
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 for empty string fields', () => {
    const { req, res, next } = createMockReqRes({ name: '' });
    requireBodyFields(['name'])(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for null fields', () => {
    const { req, res, next } = createMockReqRes({ name: null });
    requireBodyFields(['name'])(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});

describe('requireBody', () => {
  it('calls next when body has fields', () => {
    const { req, res, next } = createMockReqRes({ key: 'value' });
    requireBody(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 for empty body', () => {
    const { req, res, next } = createMockReqRes({});
    requireBody(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});

describe('validateStringLength', () => {
  it('calls next for valid length', () => {
    const { req, res, next } = createMockReqRes({ name: 'John' });
    validateStringLength('name', 1, 50)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body.name).toBe('John');
  });

  it('trims whitespace', () => {
    const { req, res, next } = createMockReqRes({ name: '  John  ' });
    validateStringLength('name', 1, 50)(req, res, next);
    expect(req.body.name).toBe('John');
  });

  it('returns 400 for too short', () => {
    const { req, res, next } = createMockReqRes({ name: 'Jo' });
    validateStringLength('name', 3, 50)(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for too long', () => {
    const { req, res, next } = createMockReqRes({ name: 'A'.repeat(51) });
    validateStringLength('name', 1, 50)(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  it('skips validation for undefined field', () => {
    const { req, res, next } = createMockReqRes({});
    validateStringLength('name', 1, 50)(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateEmail', () => {
  it('calls next for valid email', () => {
    const { req, res, next } = createMockReqRes({ email: 'john@test.com' });
    validateEmail()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('lowercases and trims email', () => {
    const { req, res, next } = createMockReqRes({ email: '  John@TEST.com  ' });
    validateEmail()(req, res, next);
    expect(req.body.email).toBe('john@test.com');
  });

  it('returns 400 for invalid email', () => {
    const { req, res, next } = createMockReqRes({ email: 'not-an-email' });
    validateEmail()(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});

describe('validateEnum', () => {
  it('calls next for valid value', () => {
    const { req, res, next } = createMockReqRes({ status: 'active' });
    validateEnum('status', ['active', 'inactive'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 for invalid value', () => {
    const { req, res, next } = createMockReqRes({ status: 'deleted' });
    validateEnum('status', ['active', 'inactive'])(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});

describe('validateNumber', () => {
  it('calls next for valid number', () => {
    const { req, res, next } = createMockReqRes({ count: 5 });
    validateNumber('count', 0, 100)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('converts string to number', () => {
    const { req, res, next } = createMockReqRes({ count: '42' });
    validateNumber('count', 0, 100)(req, res, next);
    expect(req.body.count).toBe(42);
  });

  it('returns 400 for NaN', () => {
    const { req, res, next } = createMockReqRes({ count: 'abc' });
    validateNumber('count', 0, 100)(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for out of range', () => {
    const { req, res, next } = createMockReqRes({ count: 200 });
    validateNumber('count', 0, 100)(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});

describe('validateArray', () => {
  it('calls next for valid array', () => {
    const { req, res, next } = createMockReqRes({ tags: ['a', 'b'] });
    validateArray('tags', 0, 5)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 for non-array', () => {
    const { req, res, next } = createMockReqRes({ tags: 'not-array' });
    validateArray('tags', 0, 5)(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for too many items', () => {
    const { req, res, next } = createMockReqRes({ tags: ['a', 'b', 'c'] });
    validateArray('tags', 0, 2)(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});

describe('sanitizeHtml', () => {
  it('strips HTML tags', () => {
    const { req, res, next } = createMockReqRes({ content: '<script>alert("xss")</script>Hello' });
    sanitizeHtml(['content'])(req, res, next);
    expect(req.body.content).toBe('alert("xss")Hello');
  });

  it('leaves plain text unchanged', () => {
    const { req, res, next } = createMockReqRes({ content: 'Hello world' });
    sanitizeHtml(['content'])(req, res, next);
    expect(req.body.content).toBe('Hello world');
  });

  it('handles multiple fields', () => {
    const { req, res, next } = createMockReqRes({
      title: '<b>Bold</b>',
      body: '<p>Text</p>',
    });
    sanitizeHtml(['title', 'body'])(req, res, next);
    expect(req.body.title).toBe('Bold');
    expect(req.body.body).toBe('Text');
  });
});
