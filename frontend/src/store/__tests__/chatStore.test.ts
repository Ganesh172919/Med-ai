/**
 * =============================================================================
 * Chat Store Tests
 * =============================================================================
 *
 * Tests for the Zustand chat store managing conversations and messages.
 * These tests verify state management logic without persistence middleware.
 *
 * WHY THESE TESTS:
 * - Store logic is critical for chat functionality
 * - Message CRUD operations must work correctly
 * - Conversation sorting must be consistent
 * - Active conversation tracking must be reliable
 * =============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore, type Conversation, type Message } from '../chatStore';

// Helper to create a mock conversation
function createMockConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: `conv-${Date.now()}-${Math.random()}`,
    title: 'Test Conversation',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Helper to create a mock message
function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    role: 'user',
    content: 'Test message',
    timestamp: new Date().toISOString(),
    messageState: 'complete',
    ...overrides,
  };
}

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
      conversations: [],
      activeConversationId: null,
    });
  });

  describe('addConversation', () => {
    it('adds a conversation and sets it as active', () => {
      const conv = createMockConversation({ id: 'conv-1' });
      useChatStore.getState().addConversation(conv);

      const state = useChatStore.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.conversations[0].id).toBe('conv-1');
      expect(state.activeConversationId).toBe('conv-1');
    });

    it('places new conversation first', () => {
      useChatStore.getState().addConversation(createMockConversation({ id: 'conv-1' }));
      useChatStore.getState().addConversation(createMockConversation({ id: 'conv-2' }));

      const state = useChatStore.getState();
      expect(state.conversations[0].id).toBe('conv-2');
      expect(state.conversations[1].id).toBe('conv-1');
    });

    it('does not duplicate conversations with same id', () => {
      const conv = createMockConversation({ id: 'conv-1' });
      useChatStore.getState().addConversation(conv);
      useChatStore.getState().addConversation({ ...conv, title: 'Updated' });

      const state = useChatStore.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.conversations[0].title).toBe('Updated');
    });
  });

  describe('setActiveConversation', () => {
    it('sets the active conversation id', () => {
      useChatStore.getState().setActiveConversation('conv-123');
      expect(useChatStore.getState().activeConversationId).toBe('conv-123');
    });

    it('can set active to null', () => {
      useChatStore.getState().setActiveConversation('conv-1');
      useChatStore.getState().setActiveConversation(null);
      expect(useChatStore.getState().activeConversationId).toBeNull();
    });
  });

  describe('addMessage', () => {
    it('adds a message to the correct conversation', () => {
      const conv = createMockConversation({ id: 'conv-1' });
      useChatStore.getState().addConversation(conv);

      const msg = createMockMessage({ id: 'msg-1', content: 'Hello' });
      useChatStore.getState().addMessage('conv-1', msg);

      const state = useChatStore.getState();
      const conversation = state.conversations.find((c) => c.id === 'conv-1');
      expect(conversation?.messages).toHaveLength(1);
      expect(conversation?.messages[0].content).toBe('Hello');
    });

    it('updates conversation updatedAt when adding message', () => {
      const conv = createMockConversation({
        id: 'conv-1',
        updatedAt: '2024-01-01T00:00:00Z',
      });
      useChatStore.getState().addConversation(conv);

      const msg = createMockMessage({
        timestamp: '2024-06-15T12:00:00Z',
      });
      useChatStore.getState().addMessage('conv-1', msg);

      const conversation = useChatStore.getState().conversations.find((c) => c.id === 'conv-1');
      expect(conversation?.updatedAt).toBe('2024-06-15T12:00:00Z');
    });
  });

  describe('updateMessage', () => {
    it('updates specific message fields', () => {
      const conv = createMockConversation({ id: 'conv-1' });
      useChatStore.getState().addConversation(conv);

      const msg = createMockMessage({ id: 'msg-1', content: 'Thinking...' });
      useChatStore.getState().addMessage('conv-1', msg);

      useChatStore.getState().updateMessage('conv-1', 'msg-1', {
        content: 'Here is the answer',
        messageState: 'complete',
      });

      const conversation = useChatStore.getState().conversations.find((c) => c.id === 'conv-1');
      const updated = conversation?.messages.find((m) => m.id === 'msg-1');
      expect(updated?.content).toBe('Here is the answer');
      expect(updated?.messageState).toBe('complete');
    });
  });

  describe('deleteConversation', () => {
    it('removes the conversation', () => {
      useChatStore.getState().addConversation(createMockConversation({ id: 'conv-1' }));
      useChatStore.getState().addConversation(createMockConversation({ id: 'conv-2' }));

      useChatStore.getState().deleteConversation('conv-1');

      const state = useChatStore.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.conversations[0].id).toBe('conv-2');
    });

    it('updates active conversation if deleted was active', () => {
      useChatStore.getState().addConversation(createMockConversation({ id: 'conv-1' }));
      useChatStore.getState().addConversation(createMockConversation({ id: 'conv-2' }));

      useChatStore.getState().deleteConversation('conv-2');

      expect(useChatStore.getState().activeConversationId).toBe('conv-1');
    });
  });

  describe('getActiveConversation', () => {
    it('returns the active conversation', () => {
      const conv = createMockConversation({ id: 'conv-1', title: 'My Chat' });
      useChatStore.getState().addConversation(conv);

      const active = useChatStore.getState().getActiveConversation();
      expect(active?.title).toBe('My Chat');
    });

    it('returns undefined when no active conversation', () => {
      const active = useChatStore.getState().getActiveConversation();
      expect(active).toBeUndefined();
    });
  });

  describe('updateConversationTitle', () => {
    it('updates conversation title', () => {
      const conv = createMockConversation({ id: 'conv-1', title: 'Old Title' });
      useChatStore.getState().addConversation(conv);

      useChatStore.getState().updateConversationTitle('conv-1', 'New Title');

      const updated = useChatStore.getState().conversations.find((c) => c.id === 'conv-1');
      expect(updated?.title).toBe('New Title');
    });
  });

  describe('updateConversationInsight', () => {
    it('sets insight on conversation', () => {
      const conv = createMockConversation({ id: 'conv-1' });
      useChatStore.getState().addConversation(conv);

      const insight = {
        title: 'Test',
        summary: 'Summary',
        intent: 'discussion',
        topics: ['test'],
        decisions: [],
        actionItems: [],
      };
      useChatStore.getState().updateConversationInsight('conv-1', insight);

      const updated = useChatStore.getState().conversations.find((c) => c.id === 'conv-1');
      expect(updated?.insight?.title).toBe('Test');
    });

    it('clears insight when null', () => {
      const conv = createMockConversation({ id: 'conv-1' });
      useChatStore.getState().addConversation(conv);

      useChatStore.getState().updateConversationInsight('conv-1', null);

      const updated = useChatStore.getState().conversations.find((c) => c.id === 'conv-1');
      expect(updated?.insight).toBeNull();
    });
  });

  describe('loadConversations', () => {
    it('loads multiple conversations', () => {
      const conversations = [
        createMockConversation({ id: 'conv-1' }),
        createMockConversation({ id: 'conv-2' }),
        createMockConversation({ id: 'conv-3' }),
      ];

      useChatStore.getState().loadConversations(conversations);

      expect(useChatStore.getState().conversations).toHaveLength(3);
    });

    it('sorts by updatedAt descending', () => {
      const conversations = [
        createMockConversation({ id: 'conv-1', updatedAt: '2024-01-01T00:00:00Z' }),
        createMockConversation({ id: 'conv-2', updatedAt: '2024-06-01T00:00:00Z' }),
        createMockConversation({ id: 'conv-3', updatedAt: '2024-03-01T00:00:00Z' }),
      ];

      useChatStore.getState().loadConversations(conversations);

      const ids = useChatStore.getState().conversations.map((c) => c.id);
      expect(ids).toEqual(['conv-2', 'conv-3', 'conv-1']);
    });
  });

  describe('setConversationMessages', () => {
    it('replaces messages for a conversation', () => {
      const conv = createMockConversation({
        id: 'conv-1',
        messages: [createMockMessage({ id: 'old-msg' })],
      });
      useChatStore.getState().addConversation(conv);

      const newMessages = [
        createMockMessage({ id: 'new-msg-1', content: 'New 1' }),
        createMockMessage({ id: 'new-msg-2', content: 'New 2' }),
      ];
      useChatStore.getState().setConversationMessages('conv-1', newMessages);

      const updated = useChatStore.getState().conversations.find((c) => c.id === 'conv-1');
      expect(updated?.messages).toHaveLength(2);
      expect(updated?.messages[0].content).toBe('New 1');
    });
  });
});
