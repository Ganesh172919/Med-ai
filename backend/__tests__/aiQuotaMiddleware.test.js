jest.mock('../services/aiQuota', () => ({
  consumeAiQuota: jest.fn(),
}));

const { consumeAiQuota } = require('../services/aiQuota');
const aiQuotaMiddleware = require('../middleware/aiQuota');

function createReq(user = null, ip = '127.0.0.1') {
  return { user, ip };
}

function createRes() {
  const res = { statusCode: null, body: null, locals: {} };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn((data) => { res.body = data; return res; });
  return res;
}

describe('aiQuota middleware', () => {
  const next = jest.fn();

  beforeEach(() => {
    next.mockClear();
    consumeAiQuota.mockReset();
  });

  test('calls next when request is allowed', () => {
    consumeAiQuota.mockReturnValue({ allowed: true, remaining: 10, retryAfterMs: 0 });
    const req = createReq({ id: 'user1' });
    const res = createRes();
    aiQuotaMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('sets res.locals.aiQuota with quota info', () => {
    const quota = { allowed: true, remaining: 5, retryAfterMs: 0 };
    consumeAiQuota.mockReturnValue(quota);
    const req = createReq({ id: 'user1' });
    const res = createRes();
    aiQuotaMiddleware(req, res, next);
    expect(res.locals.aiQuota).toEqual(quota);
  });

  test('returns 429 when quota exceeded', () => {
    consumeAiQuota.mockReturnValue({ allowed: false, remaining: 0, retryAfterMs: 60000 });
    const req = createReq({ id: 'user1' });
    const res = createRes();
    aiQuotaMiddleware(req, res, next);
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toMatch(/limit reached/i);
    expect(res.body.retryAfterMs).toBe(60000);
    expect(next).not.toHaveBeenCalled();
  });

  test('uses user ID as key when authenticated', () => {
    consumeAiQuota.mockReturnValue({ allowed: true, remaining: 10, retryAfterMs: 0 });
    const req = createReq({ id: 'user123' });
    const res = createRes();
    aiQuotaMiddleware(req, res, next);
    expect(consumeAiQuota).toHaveBeenCalledWith('user:user123');
  });

  test('uses IP as key when not authenticated', () => {
    consumeAiQuota.mockReturnValue({ allowed: true, remaining: 10, retryAfterMs: 0 });
    const req = createReq(null, '192.168.1.1');
    const res = createRes();
    aiQuotaMiddleware(req, res, next);
    expect(consumeAiQuota).toHaveBeenCalledWith('ip:192.168.1.1');
  });
});
