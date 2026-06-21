const {
  checkFlood,
  getAck,
  emitSocketError,
  clearTyping,
  addUserToRoom,
  removeUserFromRoom,
  removeUserFromAllRooms,
  getRoomOnlineUsers,
  isSocketInRoom,
} = require('../socket/helpers');
const {
  roomUsers,
  socketFlood,
  typingUsers,
  FLOOD_MAX,
} = require('../socket/state');

describe('socket helpers', () => {
  beforeEach(() => {
    socketFlood.clear();
    typingUsers.clear();
    roomUsers.clear();
  });

  describe('checkFlood', () => {
    it('returns false for first event from a socket', () => {
      expect(checkFlood('socket1')).toBe(false);
    });

    it('returns false when under the flood limit', () => {
      for (let i = 0; i < FLOOD_MAX - 1; i++) {
        checkFlood('socket1');
      }
      expect(checkFlood('socket1')).toBe(false);
    });

    it('returns true when at the flood limit', () => {
      for (let i = 0; i < FLOOD_MAX; i++) {
        checkFlood('socket1');
      }
      expect(checkFlood('socket1')).toBe(true);
    });

    it('tracks different sockets independently', () => {
      for (let i = 0; i < FLOOD_MAX; i++) {
        checkFlood('socket1');
      }
      expect(checkFlood('socket1')).toBe(true);
      expect(checkFlood('socket2')).toBe(false);
    });

    it('resets counter after window expires', () => {
      socketFlood.set('socket1', {
        count: FLOOD_MAX,
        resetTime: Date.now() - 1000,
      });
      expect(checkFlood('socket1')).toBe(false);
    });
  });

  describe('getAck', () => {
    it('returns the callback when it is a function', () => {
      const cb = jest.fn();
      const result = getAck(cb);
      expect(result).toBe(cb);
    });

    it('returns a no-op function when callback is not a function', () => {
      const result = getAck(null);
      expect(typeof result).toBe('function');
      // Should not throw
      result();
    });

    it('returns a no-op function when callback is undefined', () => {
      const result = getAck(undefined);
      expect(typeof result).toBe('function');
    });
  });

  describe('emitSocketError', () => {
    it('emits error_message and calls ack', () => {
      const socket = { emit: jest.fn() };
      const ack = jest.fn();
      emitSocketError(socket, ack, 'test error');
      expect(socket.emit).toHaveBeenCalledWith('error_message', { success: false, error: 'test error' });
      expect(ack).toHaveBeenCalledWith({ success: false, error: 'test error' });
    });

    it('includes details in the payload', () => {
      const socket = { emit: jest.fn() };
      const ack = jest.fn();
      emitSocketError(socket, ack, 'test error', { code: 429 });
      expect(ack).toHaveBeenCalledWith({ success: false, error: 'test error', code: 429 });
    });
  });

  describe('addUserToRoom / removeUserFromRoom', () => {
    it('adds a user to a room', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      expect(isSocketInRoom('room1', 'socket1')).toBe(true);
    });

    it('returns online users for a room', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      addUserToRoom('room1', 'socket2', { id: 'user2', username: 'bob' });
      const users = getRoomOnlineUsers('room1');
      expect(users).toHaveLength(2);
      expect(users.map((u) => u.username)).toContain('alice');
      expect(users.map((u) => u.username)).toContain('bob');
    });

    it('removes a user from a room', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      const removed = removeUserFromRoom('room1', 'socket1');
      expect(removed.username).toBe('alice');
      expect(isSocketInRoom('room1', 'socket1')).toBe(false);
    });

    it('cleans up empty room entries', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      removeUserFromRoom('room1', 'socket1');
      expect(roomUsers.has('room1')).toBe(false);
    });

    it('returns null when removing from nonexistent room', () => {
      expect(removeUserFromRoom('nonexistent', 'socket1')).toBeNull();
    });
  });

  describe('removeUserFromAllRooms', () => {
    it('removes a socket from all rooms', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      addUserToRoom('room2', 'socket1', { id: 'user1', username: 'alice' });
      const left = removeUserFromAllRooms('socket1');
      expect(left).toHaveLength(2);
      expect(isSocketInRoom('room1', 'socket1')).toBe(false);
      expect(isSocketInRoom('room2', 'socket1')).toBe(false);
    });

    it('returns empty array when socket is in no rooms', () => {
      const left = removeUserFromAllRooms('socket1');
      expect(left).toEqual([]);
    });
  });

  describe('getRoomOnlineUsers', () => {
    it('returns empty array for nonexistent room', () => {
      expect(getRoomOnlineUsers('nonexistent')).toEqual([]);
    });
  });

  describe('clearTyping', () => {
    it('removes typing entry for a room and user', () => {
      const timeout = setTimeout(() => {}, 1000);
      typingUsers.set('room1', new Map([['user1', { username: 'test', timeout }]]));

      clearTyping('room1', 'user1');

      // clearTyping also deletes the room entry when the last user is removed
      expect(typingUsers.has('room1')).toBe(false);
    });

    it('clears the timeout when removing', () => {
      const timeout = setTimeout(() => {}, 1000);
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      typingUsers.set('room1', new Map([['user1', { username: 'test', timeout }]]));

      clearTyping('room1', 'user1');

      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeout);
      clearTimeoutSpy.mockRestore();
    });

    it('handles missing room gracefully', () => {
      expect(() => clearTyping('nonexistent', 'user1')).not.toThrow();
    });

    it('handles missing user gracefully', () => {
      typingUsers.set('room1', new Map());
      expect(() => clearTyping('room1', 'nonexistent')).not.toThrow();
    });
  });

  describe('isSocketInRoom', () => {
    it('returns true when socket is in room', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      expect(isSocketInRoom('room1', 'socket1')).toBe(true);
    });

    it('returns false when socket is not in room', () => {
      expect(isSocketInRoom('room1', 'socket1')).toBe(false);
    });

    it('returns false for nonexistent room', () => {
      expect(isSocketInRoom('nonexistent', 'socket1')).toBe(false);
    });
  });

  describe('addUserToRoom edge cases', () => {
    it('creates room entry if it does not exist', () => {
      expect(roomUsers.has('newroom')).toBe(false);
      addUserToRoom('newroom', 'socket1', { id: 'user1', username: 'alice' });
      expect(roomUsers.has('newroom')).toBe(true);
    });

    it('adds multiple users to same room', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      addUserToRoom('room1', 'socket2', { id: 'user2', username: 'bob' });
      expect(getRoomOnlineUsers('room1')).toHaveLength(2);
    });

    it('overwrites existing socket entry', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice-updated' });
      const users = getRoomOnlineUsers('room1');
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('alice-updated');
    });
  });

  describe('removeUserFromRoom edge cases', () => {
    it('preserves room when other users remain', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      addUserToRoom('room1', 'socket2', { id: 'user2', username: 'bob' });
      removeUserFromRoom('room1', 'socket1');
      expect(roomUsers.has('room1')).toBe(true);
      expect(getRoomOnlineUsers('room1')).toHaveLength(1);
    });
  });

  describe('removeUserFromAllRooms edge cases', () => {
    it('preserves rooms with other users', () => {
      addUserToRoom('room1', 'socket1', { id: 'user1', username: 'alice' });
      addUserToRoom('room1', 'socket2', { id: 'user2', username: 'bob' });
      addUserToRoom('room2', 'socket1', { id: 'user1', username: 'alice' });

      const left = removeUserFromAllRooms('socket1');

      expect(left).toHaveLength(2);
      expect(roomUsers.has('room1')).toBe(true);
      expect(roomUsers.has('room2')).toBe(false);
    });
  });

  describe('isFlooded', () => {
    it('returns false when not flooded', () => {
      const socket = { id: 'socket1', emit: jest.fn() };
      const ack = jest.fn();
      const { isFlooded } = require('../socket/helpers');
      expect(isFlooded(socket, ack)).toBe(false);
    });

    it('returns true and emits error when flooded', () => {
      const socket = { id: 'socket1', emit: jest.fn() };
      const ack = jest.fn();
      const { isFlooded } = require('../socket/helpers');

      // Flood the socket
      for (let i = 0; i < FLOOD_MAX; i++) {
        checkFlood('socket1');
      }

      expect(isFlooded(socket, ack)).toBe(true);
      expect(socket.emit).toHaveBeenCalledWith('error_message', expect.objectContaining({
        success: false,
        error: expect.stringContaining('Too many actions'),
      }));
    });
  });
});
