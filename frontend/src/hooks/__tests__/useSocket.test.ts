/**
 * useSocket Hook Tests
 * Tests the socket connection management and exposed functions.
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
    auth: {},
    id: 'socket-123',
  })),
}));

vi.mock('../../api/auth', () => ({
  refreshAccessToken: vi.fn().mockResolvedValue({ accessToken: 'new-token' }),
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useSocket } from '../useSocket';
import { useAuthStore } from '../../store/authStore';

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns socket interface functions', () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());

    expect(result.current.socket).toBeNull();
    expect(typeof result.current.joinRoom).toBe('function');
    expect(typeof result.current.leaveRoom).toBe('function');
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.sendFileMessage).toBe('function');
    expect(typeof result.current.replyMessage).toBe('function');
    expect(typeof result.current.addReaction).toBe('function');
    expect(typeof result.current.triggerAi).toBe('function');
    expect(typeof result.current.editMessage).toBe('function');
    expect(typeof result.current.deleteMessage).toBe('function');
    expect(typeof result.current.emitTyping).toBe('function');
    expect(typeof result.current.stopTyping).toBe('function');
    expect(typeof result.current.markAsRead).toBe('function');
    expect(typeof result.current.pinMessage).toBe('function');
    expect(typeof result.current.unpinMessage).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('does not connect when not authenticated', () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    expect(result.current.socket).toBeNull();
  });

  it('joinRoom returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.joinRoom('room1');
    expect(response.success).toBe(false);
    expect(response.error).toBe('Socket is not connected');
  });

  it('leaveRoom returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.leaveRoom('room1');
    expect(response.success).toBe(false);
  });

  it('sendMessage returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.sendMessage('room1', 'hello');
    expect(response.success).toBe(false);
  });

  it('editMessage returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.editMessage('room1', 'msg1', 'new content');
    expect(response.success).toBe(false);
  });

  it('deleteMessage returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.deleteMessage('room1', 'msg1');
    expect(response.success).toBe(false);
  });

  it('addReaction returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.addReaction('room1', 'msg1', '👍');
    expect(response.success).toBe(false);
  });

  it('triggerAi returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.triggerAi('room1', 'hello');
    expect(response.success).toBe(false);
  });

  it('pinMessage returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.pinMessage('room1', 'msg1');
    expect(response.success).toBe(false);
  });

  it('unpinMessage returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.unpinMessage('room1', 'msg1');
    expect(response.success).toBe(false);
  });

  it('markAsRead returns success for empty messageIds', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.markAsRead('room1', []);
    expect(response.success).toBe(true);
  });

  it('markAsRead returns error for non-empty messageIds when disconnected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.markAsRead('room1', ['msg1']);
    expect(response.success).toBe(false);
  });

  it('sendFileMessage returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.sendFileMessage('room1', 'file', {
      fileUrl: 'url',
      fileName: 'file.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
    });
    expect(response.success).toBe(false);
  });

  it('replyMessage returns error when socket not connected', async () => {
    (useAuthStore as any).mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useSocket());
    const response = await result.current.replyMessage('room1', 'reply', 'msg1');
    expect(response.success).toBe(false);
  });
});
