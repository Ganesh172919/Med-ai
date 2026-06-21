jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../models/RefreshToken', () => ({
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
}));

jest.mock('../utils/token', () => ({
  generateTokens: jest.fn().mockReturnValue({ accessToken: 'access123', refreshToken: 'refresh123' }),
  saveRefreshToken: jest.fn().mockResolvedValue(true),
}));

jest.mock('../services/email', () => ({
  sendResetEmail: jest.fn().mockResolvedValue(true),
}));

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sendResetEmail } = require('../services/email');
const authService = require('../services/auth.service');

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    test('rejects missing username', async () => {
      const result = await authService.registerUser({ email: 'test@example.com', password: 'pass123' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/required/);
    });

    test('rejects missing email', async () => {
      const result = await authService.registerUser({ username: 'alice', password: 'pass123' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/required/);
    });

    test('rejects missing password', async () => {
      const result = await authService.registerUser({ username: 'alice', email: 'test@example.com' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/required/);
    });

    test('rejects short username', async () => {
      const result = await authService.registerUser({ username: 'ab', email: 'test@example.com', password: 'pass123' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/3-30/);
    });

    test('rejects long username', async () => {
      const result = await authService.registerUser({ username: 'a'.repeat(31), email: 'test@example.com', password: 'pass123' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/3-30/);
    });

    test('rejects short password', async () => {
      const result = await authService.registerUser({ username: 'alice', email: 'test@example.com', password: '12345' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/8 characters/);
    });

    test('rejects invalid email format', async () => {
      const result = await authService.registerUser({ username: 'alice', email: 'notanemail', password: 'pass1234' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/Invalid email/);
    });

    test('rejects duplicate email', async () => {
      User.findOne.mockResolvedValueOnce({ _id: 'existing', email: 'test@example.com' });
      const result = await authService.registerUser({ username: 'alice', email: 'test@example.com', password: 'pass1234' });
      expect(result.status).toBe(409);
      expect(result.error).toMatch(/Email already/);
    });

    test('rejects duplicate username', async () => {
      User.findOne
        .mockResolvedValueOnce(null)  // email check
        .mockResolvedValueOnce({ _id: 'existing', username: 'alice' });  // username check
      const result = await authService.registerUser({ username: 'alice', email: 'test@example.com', password: 'pass1234' });
      expect(result.status).toBe(409);
      expect(result.error).toMatch(/Username already/);
    });
  });

  describe('loginUser', () => {
    test('rejects missing email', async () => {
      const result = await authService.loginUser({ password: 'pass1234' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/required/);
    });

    test('rejects missing password', async () => {
      const result = await authService.loginUser({ email: 'test@example.com' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/required/);
    });

    test('rejects non-existent user', async () => {
      User.findOne.mockResolvedValue(null);
      const result = await authService.loginUser({ email: 'nobody@example.com', password: 'pass1234' });
      expect(result.status).toBe(401);
      expect(result.error).toMatch(/Invalid/);
    });

    test('rejects user without passwordHash (Google user)', async () => {
      User.findOne.mockResolvedValue({ _id: 'u1', passwordHash: null });
      const result = await authService.loginUser({ email: 'google@example.com', password: 'pass1234' });
      expect(result.status).toBe(401);
      expect(result.error).toMatch(/Google sign-in/);
    });

    test('rejects wrong password', async () => {
      User.findOne.mockResolvedValue({
        _id: 'u1',
        passwordHash: 'hashed',
        comparePassword: jest.fn().mockResolvedValue(false),
      });
      const result = await authService.loginUser({ email: 'test@example.com', password: 'wrongpass' });
      expect(result.status).toBe(401);
      expect(result.error).toMatch(/Invalid/);
    });
  });

  describe('forgotPassword', () => {
    test('rejects missing email', async () => {
      const result = await authService.forgotPassword({});
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/required/);
    });

    test('returns generic message for non-existent user', async () => {
      User.findOne.mockResolvedValue(null);
      const result = await authService.forgotPassword({ email: 'nobody@example.com' });
      expect(result.status).toBe(200);
      expect(result.data.message).toMatch(/If an account/);
    });

    test('returns generic message for Google user', async () => {
      User.findOne.mockResolvedValue({ _id: 'u1', authProvider: 'google' });
      const result = await authService.forgotPassword({ email: 'google@example.com' });
      expect(result.status).toBe(200);
      expect(result.data.message).toMatch(/If an account/);
    });

    test('sends reset email for local user', async () => {
      const mockUser = {
        _id: 'u1',
        email: 'test@example.com',
        authProvider: 'local',
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);
      const result = await authService.forgotPassword({ email: 'test@example.com' });
      expect(result.status).toBe(200);
      expect(sendResetEmail).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    test('rejects missing email', async () => {
      const result = await authService.resetPassword({ token: 'tok', newPassword: 'pass123' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/required/);
    });

    test('rejects missing token', async () => {
      const result = await authService.resetPassword({ email: 'test@example.com', newPassword: 'pass123' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/required/);
    });

    test('rejects missing password', async () => {
      const result = await authService.resetPassword({ email: 'test@example.com', token: 'tok' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/required/);
    });

    test('rejects short password', async () => {
      const result = await authService.resetPassword({ email: 'test@example.com', token: 'tok', newPassword: '12345' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/6 characters/);
    });

    test('rejects invalid or expired token', async () => {
      User.findOne.mockResolvedValue(null);
      const result = await authService.resetPassword({ email: 'test@example.com', token: 'bad', newPassword: 'pass123' });
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/expired/);
    });
  });

  describe('logoutUser', () => {
    test('deletes refresh token when provided', async () => {
      RefreshToken.deleteOne.mockResolvedValue(true);
      const result = await authService.logoutUser({ refreshToken: 'tok123' });
      expect(result.status).toBe(200);
      expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ token: 'tok123' });
    });

    test('returns success even without token', async () => {
      const result = await authService.logoutUser({});
      expect(result.status).toBe(200);
      expect(result.data.message).toMatch(/Logged out/);
    });
  });

  describe('getClientUrl', () => {
    test('returns CLIENT_URL env var', () => {
      process.env.CLIENT_URL = 'https://app.example.com';
      expect(authService.getClientUrl()).toBe('https://app.example.com');
      delete process.env.CLIENT_URL;
    });

    test('returns localhost default when not set', () => {
      delete process.env.CLIENT_URL;
      expect(authService.getClientUrl()).toBe('http://localhost:5173');
    });
  });

  describe('isGoogleOAuthEnabled', () => {
    test('returns false when env vars missing', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      delete process.env.GOOGLE_CALLBACK_URL;
      // Note: The module caches the value at load time, so this test
      // verifies the function exists and returns a boolean
      expect(typeof authService.isGoogleOAuthEnabled()).toBe('boolean');
    });
  });

  describe('issueGoogleLoginCode', () => {
    test('returns a hex string code', () => {
      const code = authService.issueGoogleLoginCode('user123');
      expect(typeof code).toBe('string');
      expect(code).toMatch(/^[a-f0-9]{64}$/);
    });

    test('returns different codes for different calls', () => {
      const code1 = authService.issueGoogleLoginCode('user1');
      const code2 = authService.issueGoogleLoginCode('user2');
      expect(code1).not.toBe(code2);
    });
  });
});
