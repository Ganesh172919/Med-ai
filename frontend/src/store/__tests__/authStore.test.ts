import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import type { AuthUser } from '../../api/auth';

const mockUser: AuthUser = {
  id: 'u1',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  });

  it('starts with default unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('login sets user, token, and isAuthenticated', () => {
    useAuthStore.getState().login(mockUser, 'token-123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('token-123');
    expect(state.isAuthenticated).toBe(true);
  });

  it('logout clears all auth state', () => {
    useAuthStore.getState().login(mockUser, 'token-123');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setUser updates user without affecting token', () => {
    useAuthStore.getState().login(mockUser, 'token-123');

    const updatedUser: AuthUser = { ...mockUser, username: 'newname' };
    useAuthStore.getState().setUser(updatedUser);

    expect(useAuthStore.getState().user?.username).toBe('newname');
    expect(useAuthStore.getState().accessToken).toBe('token-123');
  });

  it('updateTokens updates accessToken', () => {
    useAuthStore.getState().login(mockUser, 'old-token');
    useAuthStore.getState().updateTokens('new-token');

    expect(useAuthStore.getState().accessToken).toBe('new-token');
  });
});
