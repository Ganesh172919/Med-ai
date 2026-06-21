/**
 * =============================================================================
 * Room Store Tests
 * =============================================================================
 *
 * Tests for the Zustand room store managing group chat state.
 *
 * WHY THESE TESTS:
 * - Room state management is critical for group chat
 * - Message operations (add, edit, delete, pin) must work correctly
 * - Online users tracking must be reliable
 * - AI thinking state must be managed properly
 * =============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useRoomStore } from '../roomStore';
import type { GroupMessage } from '../../api/rooms';

// Helper to create a mock group message
function createMockMessage(overrides: Partial<GroupMessage> = {}): GroupMessage {
  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    userId: 'user-1',
    username: 'testuser',
    content: 'Hello room',
    timestamp: new Date().toISOString(),
    isAI: false,
    reactions: {},
    status: 'sent',
    isPinned: false,
    isEdited: false,
    isDeleted: false,
    ...overrides,
  };
}

describe('roomStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useRoomStore.setState({
      rooms: [],
      currentRoom: null,
      onlineUsers: [],
      aiThinking: false,
    });
  });

  describe('setRooms', () => {
    it('sets the rooms list', () => {
      const rooms = [
        { id: 'room-1', name: 'Room 1' },
        { id: 'room-2', name: 'Room 2' },
      ] as any[];

      useRoomStore.getState().setRooms(rooms);
      expect(useRoomStore.getState().rooms).toHaveLength(2);
    });
  });

  describe('setCurrentRoom', () => {
    it('sets the current room', () => {
      const room = { id: 'room-1', name: 'Test Room', messages: [] } as any;
      useRoomStore.getState().setCurrentRoom(room);
      expect(useRoomStore.getState().currentRoom?.id).toBe('room-1');
    });

    it('can set current room to null', () => {
      useRoomStore.getState().setCurrentRoom({ id: 'room-1', messages: [] } as any);
      useRoomStore.getState().setCurrentRoom(null);
      expect(useRoomStore.getState().currentRoom).toBeNull();
    });
  });

  describe('addMessageToCurrentRoom', () => {
    it('adds a message to the current room', () => {
      useRoomStore.setState({
        currentRoom: { id: 'room-1', messages: [] } as any,
      });

      const msg = createMockMessage({ id: 'msg-1', content: 'Hello' });
      useRoomStore.getState().addMessageToCurrentRoom(msg);

      const room = useRoomStore.getState().currentRoom;
      expect(room?.messages).toHaveLength(1);
      expect(room?.messages[0].content).toBe('Hello');
    });

    it('does nothing if no current room', () => {
      useRoomStore.setState({ currentRoom: null });
      useRoomStore.getState().addMessageToCurrentRoom(createMockMessage());
      expect(useRoomStore.getState().currentRoom).toBeNull();
    });
  });

  describe('updateMessageReactions', () => {
    it('updates reactions for a specific message', () => {
      useRoomStore.setState({
        currentRoom: {
          id: 'room-1',
          messages: [createMockMessage({ id: 'msg-1', reactions: {} })],
        } as any,
      });

      useRoomStore.getState().updateMessageReactions('msg-1', { '👍': ['user-1'] });

      const msg = useRoomStore.getState().currentRoom?.messages[0];
      expect(msg?.reactions).toEqual({ '👍': ['user-1'] });
    });
  });

  describe('editMessageInCurrentRoom', () => {
    it('edits a message content', () => {
      useRoomStore.setState({
        currentRoom: {
          id: 'room-1',
          messages: [createMockMessage({ id: 'msg-1', content: 'Original' })],
        } as any,
      });

      useRoomStore.getState().editMessageInCurrentRoom('msg-1', 'Edited', '2024-06-15T12:00:00Z');

      const msg = useRoomStore.getState().currentRoom?.messages[0];
      expect(msg?.content).toBe('Edited');
      expect(msg?.isEdited).toBe(true);
      expect(msg?.editedAt).toBe('2024-06-15T12:00:00Z');
    });
  });

  describe('deleteMessageInCurrentRoom', () => {
    it('soft deletes a message', () => {
      useRoomStore.setState({
        currentRoom: {
          id: 'room-1',
          messages: [createMockMessage({ id: 'msg-1', content: 'Hello' })],
        } as any,
      });

      useRoomStore.getState().deleteMessageInCurrentRoom('msg-1');

      const msg = useRoomStore.getState().currentRoom?.messages[0];
      expect(msg?.isDeleted).toBe(true);
      expect(msg?.content).toBe('🗑️ This message was deleted');
    });
  });

  describe('setOnlineUsers', () => {
    it('sets the online users list', () => {
      const users = [{ id: 'user-1', username: 'alice' }];
      useRoomStore.getState().setOnlineUsers(users);
      expect(useRoomStore.getState().onlineUsers).toEqual(users);
    });
  });

  describe('setAiThinking', () => {
    it('sets AI thinking state', () => {
      useRoomStore.getState().setAiThinking(true);
      expect(useRoomStore.getState().aiThinking).toBe(true);
    });
  });

  describe('clearCurrentRoom', () => {
    it('clears all room state', () => {
      useRoomStore.setState({
        currentRoom: { id: 'room-1', messages: [] } as any,
        onlineUsers: [{ id: 'user-1', username: 'alice' }],
        aiThinking: true,
      });

      useRoomStore.getState().clearCurrentRoom();

      const state = useRoomStore.getState();
      expect(state.currentRoom).toBeNull();
      expect(state.onlineUsers).toEqual([]);
      expect(state.aiThinking).toBe(false);
    });
  });

  describe('updateMessageStatusInCurrentRoom', () => {
    it('updates message status', () => {
      useRoomStore.setState({
        currentRoom: {
          id: 'room-1',
          messages: [createMockMessage({ id: 'msg-1', status: 'sent' })],
        } as any,
      });

      useRoomStore.getState().updateMessageStatusInCurrentRoom('msg-1', 'delivered');

      const msg = useRoomStore.getState().currentRoom?.messages[0];
      expect(msg?.status).toBe('delivered');
    });

    it('does nothing if no current room', () => {
      useRoomStore.setState({ currentRoom: null });
      useRoomStore.getState().updateMessageStatusInCurrentRoom('msg-1', 'read');
      expect(useRoomStore.getState().currentRoom).toBeNull();
    });
  });

  describe('setMessagePinnedState', () => {
    it('pins a message', () => {
      useRoomStore.setState({
        currentRoom: {
          id: 'room-1',
          messages: [createMockMessage({ id: 'msg-1', isPinned: false })],
        } as any,
      });

      useRoomStore.getState().setMessagePinnedState('msg-1', true);

      const msg = useRoomStore.getState().currentRoom?.messages[0];
      expect(msg?.isPinned).toBe(true);
    });

    it('unpins a message', () => {
      useRoomStore.setState({
        currentRoom: {
          id: 'room-1',
          messages: [createMockMessage({ id: 'msg-1', isPinned: true })],
        } as any,
      });

      useRoomStore.getState().setMessagePinnedState('msg-1', false);

      const msg = useRoomStore.getState().currentRoom?.messages[0];
      expect(msg?.isPinned).toBe(false);
    });

    it('does nothing if no current room', () => {
      useRoomStore.setState({ currentRoom: null });
      useRoomStore.getState().setMessagePinnedState('msg-1', true);
      expect(useRoomStore.getState().currentRoom).toBeNull();
    });
  });

  describe('addMessageToCurrentRoom edge cases', () => {
    it('adds multiple messages', () => {
      useRoomStore.setState({
        currentRoom: { id: 'room-1', messages: [] } as any,
      });

      useRoomStore.getState().addMessageToCurrentRoom(createMockMessage({ id: 'msg-1' }));
      useRoomStore.getState().addMessageToCurrentRoom(createMockMessage({ id: 'msg-2' }));
      useRoomStore.getState().addMessageToCurrentRoom(createMockMessage({ id: 'msg-3' }));

      expect(useRoomStore.getState().currentRoom?.messages).toHaveLength(3);
    });

    it('preserves existing messages when adding new one', () => {
      useRoomStore.setState({
        currentRoom: {
          id: 'room-1',
          messages: [createMockMessage({ id: 'existing', content: 'Existing' })],
        } as any,
      });

      useRoomStore.getState().addMessageToCurrentRoom(createMockMessage({ id: 'new', content: 'New' }));

      const messages = useRoomStore.getState().currentRoom?.messages;
      expect(messages).toHaveLength(2);
      expect(messages?.[0].content).toBe('Existing');
      expect(messages?.[1].content).toBe('New');
    });
  });

  describe('editMessageInCurrentRoom edge cases', () => {
    it('does nothing if no current room', () => {
      useRoomStore.setState({ currentRoom: null });
      useRoomStore.getState().editMessageInCurrentRoom('msg-1', 'Edited', '2024-06-15T12:00:00Z');
      expect(useRoomStore.getState().currentRoom).toBeNull();
    });

    it('only edits the target message', () => {
      useRoomStore.setState({
        currentRoom: {
          id: 'room-1',
          messages: [
            createMockMessage({ id: 'msg-1', content: 'First' }),
            createMockMessage({ id: 'msg-2', content: 'Second' }),
          ],
        } as any,
      });

      useRoomStore.getState().editMessageInCurrentRoom('msg-1', 'Edited First', '2024-06-15T12:00:00Z');

      const messages = useRoomStore.getState().currentRoom?.messages;
      expect(messages?.[0].content).toBe('Edited First');
      expect(messages?.[1].content).toBe('Second');
    });
  });
});
