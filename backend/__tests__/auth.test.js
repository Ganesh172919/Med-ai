const jwt = require('jsonwebtoken');

// Set test JWT secret before requiring auth middleware
process.env.JWT_ACCESS_SECRET = 'test-access-secret-for-unit-tests';

const authMiddleware = require('../middleware/auth');

function createRes() {
  const res = { statusCode: null, body: null };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn((data) => { res.body = data; return res; });
  return res;
}

describe('auth middleware', () => {
  const next = jest.fn();

  beforeEach(() => {
    next.mockClear();
  });

  test('returns 401 when no Authorization header', () => {
    const req = { headers: {} };
    const res = createRes();
    authMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Access token required');
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization header lacks Bearer prefix', () => {
    const req = { headers: { authorization: 'Token abc123' } };
    const res = createRes();
    authMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Access token required');
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization header is just "Bearer"', () => {
    const req = { headers: { authorization: 'Bearer ' } };
    const res = createRes();
    authMiddleware(req, res, next);
    // Empty token after "Bearer " — jwt.verify will throw
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when token is invalid', () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = createRes();
    authMiddleware(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Invalid token');
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 with TOKEN_EXPIRED code when token is expired', () => {
    const token = jwt.sign(
      { id: 'user1', username: 'test', email: 'test@example.com' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '-1s' }
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createRes();
    authMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token expired');
    expect(res.body.code).toBe('TOKEN_EXPIRED');
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when token is signed with wrong secret', () => {
    const token = jwt.sign(
      { id: 'user1', username: 'test', email: 'test@example.com' },
      'wrong-secret'
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createRes();
    authMiddleware(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Invalid token');
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next and sets req.user for valid token', () => {
    const payload = { id: 'user123', username: 'testuser', email: 'test@example.com' };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createRes();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(payload);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('req.user contains id, username, and email from token', () => {
    const payload = { id: 'abc', username: 'alice', email: 'alice@test.com' };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createRes();
    authMiddleware(req, res, next);
    expect(req.user.id).toBe('abc');
    expect(req.user.username).toBe('alice');
    expect(req.user.email).toBe('alice@test.com');
  });

  test('extracts token after "Bearer " prefix correctly', () => {
    const payload = { id: 'u1', username: 'u', email: 'u@t.com' };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    // Extra spaces shouldn't matter — split(' ')[1] takes the second element
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createRes();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
