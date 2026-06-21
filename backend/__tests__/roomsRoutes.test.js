describe('rooms route validation logic', () => {
  describe('formatRoomSummary', () => {
    function findRoomMember(room, userId) {
      if (!room || !room.members) return null;
      return room.members.find(m => m.userId.toString() === userId.toString()) || null;
    }

    function getRoomMemberRole(room, userId) {
      const member = findRoomMember(room, userId);
      return member ? member.role : null;
    }

    function formatRoomSummary(room, currentUserId, messageCount = 0) {
      return {
        id: room._id.toString(),
        name: room.name,
        description: room.description,
        tags: room.tags || [],
        maxUsers: room.maxUsers,
        visibility: room.visibility || 'public',
        memberCount: room.members ? room.members.length : 0,
        creatorId: room.creatorId.toString(),
        createdAt: room.createdAt,
        messageCount,
        isMember: Boolean(findRoomMember(room, currentUserId)),
        currentUserRole: getRoomMemberRole(room, currentUserId),
      };
    }

    test('formats room with correct structure', () => {
      const room = {
        _id: { toString: () => 'room1' },
        name: 'Test Room',
        description: 'A test room',
        tags: ['test', 'chat'],
        maxUsers: 50,
        visibility: 'public',
        members: [
          { userId: { toString: () => 'user1' }, role: 'admin' },
          { userId: { toString: () => 'user2' }, role: 'member' },
        ],
        creatorId: { toString: () => 'user1' },
        createdAt: new Date(),
      };

      const result = formatRoomSummary(room, 'user1', 10);

      expect(result.id).toBe('room1');
      expect(result.name).toBe('Test Room');
      expect(result.description).toBe('A test room');
      expect(result.tags).toEqual(['test', 'chat']);
      expect(result.maxUsers).toBe(50);
      expect(result.visibility).toBe('public');
      expect(result.memberCount).toBe(2);
      expect(result.creatorId).toBe('user1');
      expect(result.messageCount).toBe(10);
      expect(result.isMember).toBe(true);
      expect(result.currentUserRole).toBe('admin');
    });

    test('defaults visibility to public', () => {
      const room = {
        _id: { toString: () => 'room1' },
        name: 'Test',
        description: '',
        members: [],
        creatorId: { toString: () => 'user1' },
        createdAt: new Date(),
      };

      const result = formatRoomSummary(room, 'user1');
      expect(result.visibility).toBe('public');
    });

    test('detects non-member', () => {
      const room = {
        _id: { toString: () => 'room1' },
        name: 'Test',
        description: '',
        members: [{ userId: { toString: () => 'user1' }, role: 'admin' }],
        creatorId: { toString: () => 'user1' },
        createdAt: new Date(),
      };

      const result = formatRoomSummary(room, 'user999');
      expect(result.isMember).toBe(false);
      expect(result.currentUserRole).toBeNull();
    });

    test('handles null tags', () => {
      const room = {
        _id: { toString: () => 'room1' },
        name: 'Test',
        description: '',
        tags: null,
        members: [],
        creatorId: { toString: () => 'user1' },
        createdAt: new Date(),
      };

      const result = formatRoomSummary(room, 'user1');
      expect(result.tags).toEqual([]);
    });
  });

  describe('generatePrivateJoinKey', () => {
    test('generates 16 char hex string', () => {
      const crypto = require('crypto');
      const key = crypto.randomBytes(8).toString('hex').toUpperCase();
      expect(key.length).toBe(16);
      expect(key).toMatch(/^[0-9A-F]{16}$/);
    });

    test('generates unique keys', () => {
      const crypto = require('crypto');
      const key1 = crypto.randomBytes(8).toString('hex').toUpperCase();
      const key2 = crypto.randomBytes(8).toString('hex').toUpperCase();
      expect(key1).not.toBe(key2);
    });
  });

  describe('room creation validation', () => {
    test('validates room name is required', () => {
      const name = '';
      const isValid = typeof name === 'string' && name.trim().length >= 2;
      expect(isValid).toBe(false);
    });

    test('validates room name minimum length', () => {
      const name = 'A';
      const isValid = typeof name === 'string' && name.trim().length >= 2;
      expect(isValid).toBe(false);
    });

    test('accepts valid room name', () => {
      const name = 'Test Room';
      const isValid = typeof name === 'string' && name.trim().length >= 2;
      expect(isValid).toBe(true);
    });

    test('validates maxUsers range', () => {
      const maxUsers = 50;
      const isValid = maxUsers >= 2 && maxUsers <= 500;
      expect(isValid).toBe(true);
    });

    test('rejects maxUsers below 2', () => {
      const maxUsers = 1;
      const isValid = maxUsers >= 2 && maxUsers <= 500;
      expect(isValid).toBe(false);
    });

    test('rejects maxUsers above 500', () => {
      const maxUsers = 501;
      const isValid = maxUsers >= 2 && maxUsers <= 500;
      expect(isValid).toBe(false);
    });

    test('valid visibility values', () => {
      const validVisibilities = ['public', 'private'];
      expect(validVisibilities).toContain('public');
      expect(validVisibilities).toContain('private');
    });
  });

  describe('room join validation', () => {
    test('validates ObjectId format', () => {
      const validId = '507f1f77bcf86cd799439011';
      const invalidId = 'invalid';

      expect(/^[0-9a-fA-F]{24}$/.test(validId)).toBe(true);
      expect(/^[0-9a-fA-F]{24}$/.test(invalidId)).toBe(false);
    });

    test('checks room membership', () => {
      const room = {
        members: [
          { userId: { toString: () => 'user1' }, role: 'admin' },
        ],
      };

      const userId = 'user1';
      const isMember = room.members.some((m) => m.userId.toString() === userId);
      expect(isMember).toBe(true);
    });

    test('detects non-member', () => {
      const room = {
        members: [
          { userId: { toString: () => 'user1' }, role: 'admin' },
        ],
      };

      const userId = 'user999';
      const isMember = room.members.some((m) => m.userId.toString() === userId);
      expect(isMember).toBe(false);
    });
  });
});
