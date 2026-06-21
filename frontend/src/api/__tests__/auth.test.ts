/**
 * Auth API Tests
 * Tests all authentication API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import api from '../axios';
import { registerUser, loginUser, refreshAccessToken, logoutUser, getMe, forgotPassword, resetPassword, exchangeGoogleCode } from '../auth';

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('sends POST to /auth/register with credentials', async () => {
      const mockResponse = { user: { id: 'u1', username: 'test' }, accessToken: 'token123' };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const result = await registerUser('testuser', 'test@test.com', 'password123');

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('propagates API errors', async () => {
      (api.post as any).mockRejectedValue(new Error('Username taken'));
      await expect(registerUser('test', 'test@test.com', 'pass')).rejects.toThrow('Username taken');
    });
  });

  describe('loginUser', () => {
    it('sends POST to /auth/login with credentials', async () => {
      const mockResponse = { user: { id: 'u1', email: 'test@test.com' }, accessToken: 'token' };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const result = await loginUser('test@test.com', 'password');

      expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'password' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refreshAccessToken', () => {
    it('sends POST to /auth/refresh', async () => {
      (api.post as any).mockResolvedValue({ data: { accessToken: 'new-token' } });

      const result = await refreshAccessToken();

      expect(api.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result.accessToken).toBe('new-token');
    });
  });

  describe('logoutUser', () => {
    it('sends POST to /auth/logout', async () => {
      (api.post as any).mockResolvedValue({});

      await logoutUser();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('getMe', () => {
    it('sends GET to /auth/me', async () => {
      const mockUser = { id: 'u1', username: 'test', email: 'test@test.com' };
      (api.get as any).mockResolvedValue({ data: mockUser });

      const result = await getMe();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('forgotPassword', () => {
    it('sends POST to /auth/forgot-password with email', async () => {
      (api.post as any).mockResolvedValue({ data: { message: 'Email sent' } });

      const result = await forgotPassword('test@test.com');

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@test.com' });
      expect(result.message).toBe('Email sent');
    });
  });

  describe('resetPassword', () => {
    it('sends POST to /auth/reset-password with credentials', async () => {
      (api.post as any).mockResolvedValue({ data: { message: 'Password reset' } });

      const result = await resetPassword('test@test.com', 'reset-token', 'newpass');

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        email: 'test@test.com',
        token: 'reset-token',
        newPassword: 'newpass',
      });
      expect(result.message).toBe('Password reset');
    });
  });

  describe('exchangeGoogleCode', () => {
    it('sends POST to /auth/google/exchange with code', async () => {
      const mockResponse = { user: { id: 'u1' }, accessToken: 'google-token' };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const result = await exchangeGoogleCode('google-auth-code');

      expect(api.post).toHaveBeenCalledWith('/auth/google/exchange', { code: 'google-auth-code' });
      expect(result).toEqual(mockResponse);
    });
  });
});
