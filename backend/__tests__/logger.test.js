/**
 * =============================================================================
 * Logger Utility Tests
 * =============================================================================
 *
 * Tests for the structured logging utility.
 *
 * WHY THESE TESTS:
 * - Sensitive data must be redacted from logs
 * - Log format must be consistent
 * - Error serialization must capture useful info
 * - Request summaries must be safe to log
 * =============================================================================
 */

const {
  sanitizeValue,
  serializeError,
  createRequestId,
  buildBodySummary,
  buildRequestSummary,
} = require('../helpers/logger');

describe('sanitizeValue', () => {
  it('returns null/undefined as-is', () => {
    expect(sanitizeValue(null)).toBeNull();
    expect(sanitizeValue(undefined)).toBeUndefined();
  });

  it('returns numbers and booleans as-is', () => {
    expect(sanitizeValue(42)).toBe(42);
    expect(sanitizeValue(true)).toBe(true);
  });

  it('truncates long strings', () => {
    const longStr = 'a'.repeat(200);
    const result = sanitizeValue(longStr);
    expect(result.length).toBeLessThanOrEqual(161); // 160 + ellipsis
  });

  it('redacts sensitive keys', () => {
    const obj = {
      username: 'john',
      password: 'secret123',
      api_key: 'sk-123',
      access_token: 'token123',
      authorization: 'Bearer xyz',
    };

    const result = sanitizeValue(obj);
    expect(result.username).toBe('john');
    expect(result.password).toBe('[redacted]');
    expect(result.api_key).toBe('[redacted]');
    expect(result.access_token).toBe('[redacted]');
    expect(result.authorization).toBe('[redacted]');
  });

  it('handles nested objects with depth limit', () => {
    const obj = { a: { b: { c: { d: 'deep' } } } };
    const result = sanitizeValue(obj);
    // At depth 2, should return '[object]'
    expect(result.a.b).toBe('[object]');
  });

  it('handles arrays with length limit', () => {
    const arr = Array.from({ length: 20 }, (_, i) => `item-${i}`);
    const result = sanitizeValue(arr);
    expect(result).toHaveLength(8); // Max 8 items
  });

  it('serializes Error objects', () => {
    const error = new Error('Test error');
    error.code = 'TEST_CODE';
    const result = sanitizeValue(error);
    expect(result.message).toBe('Test error');
    expect(result.code).toBe('TEST_CODE');
  });
});

describe('serializeError', () => {
  it('returns null for null/undefined', () => {
    expect(serializeError(null)).toBeNull();
    expect(serializeError(undefined)).toBeNull();
  });

  it('serializes error with name and message', () => {
    const error = new Error('Something failed');
    const result = serializeError(error);
    expect(result.name).toBe('Error');
    expect(result.message).toBe('Something failed');
  });

  it('includes code if present', () => {
    const error = new Error('Fail');
    error.code = 'ERR_TEST';
    const result = serializeError(error);
    expect(result.code).toBe('ERR_TEST');
  });

  it('includes statusCode if present', () => {
    const error = new Error('Fail');
    error.statusCode = 429;
    const result = serializeError(error);
    expect(result.statusCode).toBe(429);
  });

  it('includes model info if present', () => {
    const error = new Error('Fail');
    error.model = { id: 'gpt-4', provider: 'openrouter' };
    const result = serializeError(error);
    expect(result.modelId).toBe('gpt-4');
    expect(result.provider).toBe('openrouter');
  });
});

describe('createRequestId', () => {
  it('returns an 8-character string', () => {
    const id = createRequestId();
    expect(typeof id).toBe('string');
    expect(id).toHaveLength(8);
  });

  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createRequestId()));
    expect(ids.size).toBe(100);
  });
});

describe('buildBodySummary', () => {
  it('returns null for null/undefined body', () => {
    expect(buildBodySummary(null)).toBeNull();
    expect(buildBodySummary(undefined)).toBeNull();
  });

  it('extracts body keys', () => {
    const body = { message: 'hello', modelId: 'gpt-4' };
    const result = buildBodySummary(body);
    expect(result.keys).toContain('message');
    expect(result.keys).toContain('modelId');
  });

  it('captures message length', () => {
    const body = { message: 'hello world' };
    const result = buildBodySummary(body);
    expect(result.messageLength).toBe(11);
  });

  it('captures history count', () => {
    const body = { history: [{ role: 'user' }, { role: 'model' }] };
    const result = buildBodySummary(body);
    expect(result.historyCount).toBe(2);
  });

  it('detects attachments', () => {
    const body = { fileUrl: '/uploads/file.pdf' };
    const result = buildBodySummary(body);
    expect(result.hasAttachment).toBe(true);
  });
});

describe('buildRequestSummary', () => {
  it('builds summary from request object', () => {
    const req = {
      requestId: 'abc123',
      method: 'POST',
      originalUrl: '/api/chat',
      ip: '127.0.0.1',
      body: { message: 'hello' },
    };

    const result = buildRequestSummary(req);
    expect(result.requestId).toBe('abc123');
    expect(result.method).toBe('POST');
    expect(result.path).toBe('/api/chat');
    expect(result.ip).toBe('127.0.0.1');
  });

  it('includes body for POST requests', () => {
    const req = {
      method: 'POST',
      originalUrl: '/api/chat',
      body: { message: 'hello' },
    };

    const result = buildRequestSummary(req);
    expect(result.body).not.toBeNull();
    expect(result.body.keys).toContain('message');
  });

  it('excludes body for GET requests', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/health',
      body: {},
    };

    const result = buildRequestSummary(req);
    expect(result.body).toBeNull();
  });

  it('includes body for PUT requests', () => {
    const req = {
      method: 'PUT',
      originalUrl: '/api/users/profile',
      body: { displayName: 'Alice' },
    };

    const result = buildRequestSummary(req);
    expect(result.body).not.toBeNull();
  });

  it('includes body for PATCH requests', () => {
    const req = {
      method: 'PATCH',
      originalUrl: '/api/projects/123',
      body: { name: 'Updated' },
    };

    const result = buildRequestSummary(req);
    expect(result.body).not.toBeNull();
  });

  it('handles missing requestId', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/health',
    };

    const result = buildRequestSummary(req);
    expect(result.requestId).toBeNull();
  });
});

describe('sanitizeValue edge cases', () => {
  it('handles empty string', () => {
    expect(sanitizeValue('')).toBe('');
  });

  it('handles string at exactly max length', () => {
    const str = 'a'.repeat(160);
    const result = sanitizeValue(str);
    expect(result).toHaveLength(160);
  });

  it('handles empty array', () => {
    const result = sanitizeValue([]);
    expect(result).toEqual([]);
  });

  it('handles empty object', () => {
    const result = sanitizeValue({});
    expect(result).toEqual({});
  });

  it('redacts refresh_token', () => {
    const obj = { refresh_token: 'token123' };
    const result = sanitizeValue(obj);
    expect(result.refresh_token).toBe('[redacted]');
  });

  it('redacts client_secret', () => {
    const obj = { client_secret: 'secret123' };
    const result = sanitizeValue(obj);
    expect(result.client_secret).toBe('[redacted]');
  });

  it('redacts oauth_code', () => {
    const obj = { oauth_code: 'code123' };
    const result = sanitizeValue(obj);
    expect(result.oauth_code).toBe('[redacted]');
  });

  it('handles nested arrays', () => {
    const obj = { items: [1, 2, 3] };
    const result = sanitizeValue(obj);
    expect(result.items).toEqual([1, 2, 3]);
  });

  it('truncates deep array at depth 2', () => {
    const obj = { a: { b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } };
    const result = sanitizeValue(obj);
    expect(result.a.b).toBe('[array:10]');
  });
});

describe('serializeError edge cases', () => {
  it('handles error with status property', () => {
    const error = new Error('Fail');
    error.status = 404;
    const result = serializeError(error);
    expect(result.statusCode).toBe(404);
  });

  it('handles error with response.status', () => {
    const error = new Error('Fail');
    error.response = { status: 500 };
    const result = serializeError(error);
    expect(result.statusCode).toBe(500);
  });

  it('handles error with retryAfterMs', () => {
    const error = new Error('Rate limited');
    error.retryAfterMs = 60000;
    const result = serializeError(error);
    expect(result.retryAfterMs).toBe(60000);
  });

  it('truncates long error messages', () => {
    const error = new Error('a'.repeat(500));
    const result = serializeError(error);
    expect(result.message.length).toBeLessThanOrEqual(301); // 300 + ellipsis
  });
});

describe('buildBodySummary edge cases', () => {
  it('captures prompt length', () => {
    const body = { prompt: 'Tell me about AI' };
    const result = buildBodySummary(body);
    expect(result.promptLength).toBe(16);
  });

  it('captures text length', () => {
    const body = { text: 'Hello world' };
    const result = buildBodySummary(body);
    expect(result.textLength).toBe(11);
  });

  it('captures messages count', () => {
    const body = { messages: [{ role: 'user' }, { role: 'assistant' }] };
    const result = buildBodySummary(body);
    expect(result.messagesCount).toBe(2);
  });

  it('captures modelId', () => {
    const body = { modelId: 'gpt-4' };
    const result = buildBodySummary(body);
    expect(result.modelId).toBe('gpt-4');
  });

  it('captures conversationId', () => {
    const body = { conversationId: 'conv123' };
    const result = buildBodySummary(body);
    expect(result.conversationId).toBe('conv123');
  });

  it('detects attachment field', () => {
    const body = { attachment: { fileUrl: '/file.pdf' } };
    const result = buildBodySummary(body);
    expect(result.hasAttachment).toBe(true);
  });

  it('limits keys to 12', () => {
    const body = {};
    for (let i = 0; i < 20; i++) {
      body[`key${i}`] = `value${i}`;
    }
    const result = buildBodySummary(body);
    expect(result.keys.length).toBeLessThanOrEqual(12);
  });

  it('handles non-object body', () => {
    expect(buildBodySummary('string')).toBeNull();
    expect(buildBodySummary(123)).toBeNull();
  });
});
