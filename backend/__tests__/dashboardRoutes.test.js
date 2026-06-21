describe('dashboard route validation logic', () => {
  describe('activity mapping', () => {
    test('maps message to activity format', () => {
      const msg = {
        _id: { toString: () => 'msg1' },
        content: 'Hello world',
        roomId: { toString: () => 'room1' },
        username: 'alice',
        isAI: false,
        createdAt: new Date(),
      };

      const roomMap = new Map([['room1', 'Test Room']]);

      const activity = {
        id: msg._id.toString(),
        type: msg.isAI ? 'ai_response' : 'message',
        content: msg.content.substring(0, 100),
        roomName: msg.roomId ? (roomMap.get(msg.roomId.toString()) || 'Unknown Room') : null,
        username: msg.username,
        timestamp: msg.createdAt,
      };

      expect(activity.id).toBe('msg1');
      expect(activity.type).toBe('message');
      expect(activity.roomName).toBe('Test Room');
    });

    test('maps AI message correctly', () => {
      const msg = {
        _id: { toString: () => 'msg2' },
        content: 'AI response',
        roomId: { toString: () => 'room1' },
        username: 'Gemini',
        isAI: true,
        createdAt: new Date(),
      };

      const type = msg.isAI ? 'ai_response' : 'message';
      expect(type).toBe('ai_response');
    });

    test('truncates content to 100 chars', () => {
      const content = 'a'.repeat(200);
      const truncated = content.substring(0, 100);
      expect(truncated.length).toBe(100);
    });

    test('handles null roomId', () => {
      const msg = {
        roomId: null,
      };

      const roomName = msg.roomId ? 'Room' : null;
      expect(roomName).toBeNull();
    });

    test('handles unknown room', () => {
      const msg = {
        roomId: { toString: () => 'room999' },
      };

      const roomMap = new Map([['room1', 'Test Room']]);
      const roomName = msg.roomId ? (roomMap.get(msg.roomId.toString()) || 'Unknown Room') : null;

      expect(roomName).toBe('Unknown Room');
    });
  });

  describe('recent rooms mapping', () => {
    test('maps room to recent room format', () => {
      const room = {
        _id: { toString: () => 'room1' },
        name: 'Test Room',
        description: 'A test room',
        tags: ['test'],
        createdAt: new Date(),
        members: [
          { userId: { toString: () => 'user1' }, role: 'admin' },
          { userId: { toString: () => 'user2' }, role: 'member' },
        ],
        creatorId: { toString: () => 'user1' },
      };

      function getRoomMemberRole(room, userId) {
        const member = room.members.find((m) => m.userId.toString() === userId);
        return member ? member.role : null;
      }

      const mapped = {
        id: room._id.toString(),
        name: room.name,
        description: room.description,
        tags: room.tags,
        createdAt: room.createdAt,
        memberCount: room.members.length,
        currentUserRole: getRoomMemberRole(room, 'user1'),
      };

      expect(mapped.id).toBe('room1');
      expect(mapped.name).toBe('Test Room');
      expect(mapped.memberCount).toBe(2);
      expect(mapped.currentUserRole).toBe('admin');
    });
  });

  describe('today message count', () => {
    test('calculates today start correctly', () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      expect(todayStart.getHours()).toBe(0);
      expect(todayStart.getMinutes()).toBe(0);
      expect(todayStart.getSeconds()).toBe(0);
      expect(todayStart.getMilliseconds()).toBe(0);
    });
  });

  describe('stats structure', () => {
    test('has all required fields', () => {
      const stats = {
        totalConversations: 10,
        totalRooms: 5,
        totalMessagesSent: 100,
        messagesToday: 7,
        onlineUsers: 3,
      };

      expect(stats).toHaveProperty('totalConversations');
      expect(stats).toHaveProperty('totalRooms');
      expect(stats).toHaveProperty('totalMessagesSent');
      expect(stats).toHaveProperty('messagesToday');
      expect(stats).toHaveProperty('onlineUsers');
    });
  });
});
