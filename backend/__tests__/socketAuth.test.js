const jwt = require('jsonwebtoken');

process.env.JWT_ACCESS_SECRET = 'test-access-secret-for-unit-tests';

const socketAuthMiddleware = require('../middleware/socketAuth');

function createSocket(authToken) {
  return {
    handshake: { auth: { token: authToken } },
    user: null,
  };
}

describe('socketAuth middleware', () => {
  test('calls next with error when no token provided', () => {
    const socket = { handshake: { auth: {} } };
    const next = jest.fn();
    socketAuthMiddleware(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Authentication token required');
  });

  test('calls next with error when token is invalid', () => {
    const socket = createSocket('invalidtoken');
    const next = jest.fn();
    socketAuthMiddleware(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid or expired token');
  });

  test('calls next with error when token is expired', () => {
    const token = jwt.sign(
      { id: 'u1', username: 'test', email: 'test@example.com' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '-1s' }
    );
    const socket = createSocket(token);
    const next = jest.fn();
    socketAuthMiddleware(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid or expired token');
  });

  test('calls next with error when token signed with wrong secret', () => {
    const token = jwt.sign(
      { id: 'u1', username: 'test', email: 'test@example.com' },
      'wrong-secret'
    );
    const socket = createSocket(token);
    const next = jest.fn();
    socketAuthMiddleware(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('calls next without error and sets socket.user for valid token', () => {
    const payload = { id: 'user123', username: 'testuser', email: 'test@example.com' };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    const socket = createSocket(token);
    const next = jest.fn();
    socketAuthMiddleware(socket, next);
    expect(next).toHaveBeenCalledWith();
    expect(socket.user).toEqual(payload);
  });

  test('socket.user contains id, username, email from decoded token', () => {
    const payload = { id: 'abc', username: 'alice', email: 'alice@test.com' };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    const socket = createSocket(token);
    const next = jest.fn();
    socketAuthMiddleware(socket, next);
    expect(socket.user.id).toBe('abc');
    expect(socket.user.username).toBe('alice');
    expect(socket.user.email).toBe('alice@test.com');
  });

  test('reads token from socket.handshake.auth.token', () => {
    const payload = { id: 'u1', username: 'u', email: 'u@t.com' };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    const socket = {
      handshake: { auth: { token } },
      user: null,
    };
    const next = jest.fn();
    socketAuthMiddleware(socket, next);
    expect(next).toHaveBeenCalledWith();
    expect(socket.user).toEqual(payload);
  });
});
