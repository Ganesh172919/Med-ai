/**
 * Groups API Tests
 * Tests all group/member management API functions.
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
import { fetchMembers, updateMemberRole, kickMember } from '../groups';

const mockMembers = [
  { userId: 'u1', username: 'alice', displayName: 'Alice', role: 'admin', isCreator: true, onlineStatus: 'online' },
  { userId: 'u2', username: 'bob', displayName: 'Bob', role: 'member', isCreator: false, onlineStatus: 'offline' },
];

describe('Groups API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMembers', () => {
    it('sends GET to /groups/:roomId/members', async () => {
      (api.get as any).mockResolvedValue({ data: mockMembers });

      const result = await fetchMembers('room1');

      expect(api.get).toHaveBeenCalledWith('/groups/room1/members');
      expect(result).toEqual(mockMembers);
      expect(result).toHaveLength(2);
    });

    it('propagates API errors', async () => {
      (api.get as any).mockRejectedValue(new Error('Forbidden'));
      await expect(fetchMembers('room1')).rejects.toThrow('Forbidden');
    });
  });

  describe('updateMemberRole', () => {
    it('sends PUT to /groups/:roomId/members/:userId/role', async () => {
      (api.put as any).mockResolvedValue({ data: { success: true } });

      await updateMemberRole('room1', 'u2', 'moderator');

      expect(api.put).toHaveBeenCalledWith('/groups/room1/members/u2/role', { role: 'moderator' });
    });

    it('works for all role types', async () => {
      (api.put as any).mockResolvedValue({ data: { success: true } });

      await updateMemberRole('room1', 'u2', 'admin');
      expect(api.put).toHaveBeenCalledWith('/groups/room1/members/u2/role', { role: 'admin' });

      await updateMemberRole('room1', 'u2', 'member');
      expect(api.put).toHaveBeenCalledWith('/groups/room1/members/u2/role', { role: 'member' });
    });
  });

  describe('kickMember', () => {
    it('sends DELETE to /groups/:roomId/members/:userId', async () => {
      (api.delete as any).mockResolvedValue({});

      await kickMember('room1', 'u2');

      expect(api.delete).toHaveBeenCalledWith('/groups/room1/members/u2');
    });

    it('propagates API errors', async () => {
      (api.delete as any).mockRejectedValue(new Error('Cannot kick creator'));
      await expect(kickMember('room1', 'u1')).rejects.toThrow('Cannot kick creator');
    });
  });
});
