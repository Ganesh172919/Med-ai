/**
 * Users API Tests
 * Tests all user-related API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../axios';
import { updateProfile, getUserProfile, getPinnedMessages, pinMessage, unpinMessage } from '../users';

describe('Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('sends PUT to /users/profile', async () => {
      const mockUpdated = { id: 'u1', username: 'test', bio: 'Updated bio' };
      (api.put as any).mockResolvedValue({ data: mockUpdated });

      const result = await updateProfile({ bio: 'Updated bio' });

      expect(api.put).toHaveBeenCalledWith('/users/profile', { bio: 'Updated bio' });
      expect(result.bio).toBe('Updated bio');
    });

    it('updates display name', async () => {
      (api.put as any).mockResolvedValue({ data: { displayName: 'New Name' } });

      const result = await updateProfile({ displayName: 'New Name' });

      expect(api.put).toHaveBeenCalledWith('/users/profile', { displayName: 'New Name' });
      expect(result.displayName).toBe('New Name');
    });
  });

  describe('getUserProfile', () => {
    it('sends GET to /users/:id', async () => {
      const mockProfile = { id: 'u2', username: 'other', displayName: 'Other User' };
      (api.get as any).mockResolvedValue({ data: mockProfile });

      const result = await getUserProfile('u2');

      expect(api.get).toHaveBeenCalledWith('/users/u2');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('getPinnedMessages', () => {
    it('sends GET to /rooms/:roomId/pinned', async () => {
      const mockPinned = [{ id: 'msg1', content: 'Pinned message' }];
      (api.get as any).mockResolvedValue({ data: mockPinned });

      const result = await getPinnedMessages('room1');

      expect(api.get).toHaveBeenCalledWith('/rooms/room1/pinned');
      expect(result).toEqual(mockPinned);
    });
  });

  describe('pinMessage', () => {
    it('sends POST to /rooms/:roomId/pin/:messageId', async () => {
      (api.post as any).mockResolvedValue({});

      await pinMessage('room1', 'msg1');

      expect(api.post).toHaveBeenCalledWith('/rooms/room1/pin/msg1');
    });
  });

  describe('unpinMessage', () => {
    it('sends DELETE to /rooms/:roomId/pin/:messageId', async () => {
      (api.delete as any).mockResolvedValue({});

      await unpinMessage('room1', 'msg1');

      expect(api.delete).toHaveBeenCalledWith('/rooms/room1/pin/msg1');
    });
  });
});
