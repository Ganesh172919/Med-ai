/**
 * Moderation API Tests
 * Tests all moderation-related API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../axios';
import { reportUser, reportMessage, blockUser, unblockUser, getBlockedUsers } from '../moderation';

describe('Moderation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reportUser', () => {
    it('sends POST to /moderation/report with targetType user', async () => {
      (api.post as any).mockResolvedValue({ data: { id: 'r1', message: 'Reported' } });

      const result = await reportUser({
        targetId: 'u2',
        reason: 'harassment',
        description: 'Test report',
      });

      expect(api.post).toHaveBeenCalledWith('/moderation/report', {
        targetType: 'user',
        targetId: 'u2',
        reason: 'harassment',
        description: 'Test report',
      });
      expect(result.message).toBe('Reported');
    });
  });

  describe('reportMessage', () => {
    it('sends POST to /moderation/report with targetType message', async () => {
      (api.post as any).mockResolvedValue({ data: { id: 'r1', message: 'Reported' } });

      await reportMessage({
        targetId: 'msg1',
        reason: 'spam',
      });

      expect(api.post).toHaveBeenCalledWith('/moderation/report', {
        targetType: 'message',
        targetId: 'msg1',
        reason: 'spam',
      });
    });
  });

  describe('blockUser', () => {
    it('sends POST to /moderation/block with userId', async () => {
      (api.post as any).mockResolvedValue({ data: { message: 'Blocked' } });

      await blockUser('u2');

      expect(api.post).toHaveBeenCalledWith('/moderation/block', { userId: 'u2' });
    });
  });

  describe('unblockUser', () => {
    it('sends DELETE to /moderation/block/:userId', async () => {
      (api.delete as any).mockResolvedValue({ data: { message: 'Unblocked' } });

      await unblockUser('u2');

      expect(api.delete).toHaveBeenCalledWith('/moderation/block/u2');
    });
  });

  describe('getBlockedUsers', () => {
    it('sends GET to /moderation/blocked', async () => {
      const mockBlocked = [{ userId: 'u2', username: 'blocked_user' }];
      (api.get as any).mockResolvedValue({ data: mockBlocked });

      const result = await getBlockedUsers();

      expect(api.get).toHaveBeenCalledWith('/moderation/blocked');
      expect(result).toEqual(mockBlocked);
    });
  });
});
