/**
 * Axios API Client Tests
 *
 * Tests the configured axios instance: token attachment and response handling.
 */

import { beforeAll, describe, expect, it, vi } from 'vitest';

// vi.hoisted ensures these are available when vi.mock factory runs
const { reqInterceptor, resSuccess, resError, mockGetState } = vi.hoisted(() => {
  const req = { current: null as ((config: Record<string, unknown>) => Record<string, unknown>) | null };
  const suc = { current: null as ((response: unknown) => unknown) | null };
  const err = { current: null as ((error: unknown) => Promise<unknown>) | null };
  const getState = vi.fn(() => ({
    accessToken: 'test-token',
    updateTokens: vi.fn(),
    logout: vi.fn(),
  }));
  return {
    reqInterceptor: req,
    resSuccess: suc,
    resError: err,
    mockGetState: getState,
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: {
          use: vi.fn((success: unknown) => {
            reqInterceptor.current = success as typeof reqInterceptor.current;
          }),
        },
        response: {
          use: vi.fn((success: unknown, error: unknown) => {
            resSuccess.current = success as typeof resSuccess.current;
            resError.current = error as typeof resError.current;
          }),
        },
      },
      defaults: { headers: { common: {} } },
      post: vi.fn(),
    })),
  },
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: {
    getState: (...args: unknown[]) => mockGetState(...args),
  },
}));

import '../axios';

describe('API Client', () => {
  beforeAll(() => {
    expect(reqInterceptor.current).toBeTruthy();
    expect(resSuccess.current).toBeTruthy();
    expect(resError.current).toBeTruthy();
  });

  describe('request interceptor', () => {
    it('attaches authorization token when available', () => {
      mockGetState.mockReturnValueOnce({
        accessToken: 'my-token-123',
        updateTokens: vi.fn(),
        logout: vi.fn(),
      } as never);

      const config = { headers: {} } as unknown as Record<string, unknown>;
      const result = reqInterceptor.current!(config);

      expect(result.headers.Authorization).toBe('Bearer my-token-123');
    });

    it('does not attach token when not available', () => {
      mockGetState.mockReturnValueOnce({
        accessToken: null,
        updateTokens: vi.fn(),
        logout: vi.fn(),
      } as never);

      const config = { headers: {} } as unknown as Record<string, unknown>;
      const result = reqInterceptor.current!(config);

      expect(result.headers).not.toHaveProperty('Authorization');
    });
  });

  describe('response interceptor success handler', () => {
    it('passes through successful responses unchanged', () => {
      const response = { data: { message: 'ok' }, status: 200 };
      const result = resSuccess.current!(response);
      expect(result).toBe(response);
    });
  });

  describe('response interceptor error handler', () => {
    it('rejects errors without config immediately', async () => {
      const error = new Error('Network error');
      await expect(resError.current!(error)).rejects.toBe(error);
    });

    it('does not retry 401 on login endpoint', async () => {
      const error = { config: { url: '/auth/login' }, response: { status: 401 } };
      await expect(resError.current!(error)).rejects.toBe(error);
    });

    it('does not retry 401 on register endpoint', async () => {
      const error = { config: { url: '/auth/register' }, response: { status: 401 } };
      await expect(resError.current!(error)).rejects.toBe(error);
    });

    it('does not retry 401 on refresh endpoint', async () => {
      const error = { config: { url: '/auth/refresh' }, response: { status: 401 } };
      await expect(resError.current!(error)).rejects.toBe(error);
    });

    it('does not retry 401 on google endpoint', async () => {
      const error = { config: { url: '/auth/google' }, response: { status: 401 } };
      await expect(resError.current!(error)).rejects.toBe(error);
    });

    it('rejects non-401 errors', async () => {
      const error = { config: { url: '/api/chat' }, response: { status: 500 } };
      await expect(resError.current!(error)).rejects.toBe(error);
    });
  });
});
