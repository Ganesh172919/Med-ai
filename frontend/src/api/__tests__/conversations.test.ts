/**
 * Conversations API Tests
 * Tests all conversation-related API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../axios';
import {
  fetchConversations,
  fetchConversation,
  fetchConversationInsight,
  deleteConversation,
} from '../conversations';

describe('Conversations API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchConversations', () => {
    it('sends GET to /conversations', async () => {
      const mockConversations = [{ id: 'c1', title: 'Test' }];
      (api.get as any).mockResolvedValue({ data: mockConversations });

      const result = await fetchConversations();

      expect(api.get).toHaveBeenCalledWith('/conversations', { params: undefined });
      expect(result).toEqual(mockConversations);
    });

    it('sends with projectId when provided', async () => {
      (api.get as any).mockResolvedValue({ data: [] });

      await fetchConversations('proj-1');

      expect(api.get).toHaveBeenCalledWith('/conversations', { params: { projectId: 'proj-1' } });
    });
  });

  describe('fetchConversation', () => {
    it('sends GET to /conversations/:id', async () => {
      const mockDetail = { id: 'c1', messages: [] };
      (api.get as any).mockResolvedValue({ data: mockDetail });

      const result = await fetchConversation('c1');

      expect(api.get).toHaveBeenCalledWith('/conversations/c1');
      expect(result).toEqual(mockDetail);
    });
  });

  describe('fetchConversationInsight', () => {
    it('sends GET to /conversations/:id/insights', async () => {
      const mockInsight = { summary: 'Test summary' };
      (api.get as any).mockResolvedValue({ data: mockInsight });

      const result = await fetchConversationInsight('c1');

      expect(api.get).toHaveBeenCalledWith('/conversations/c1/insights', { params: undefined });
      expect(result).toEqual(mockInsight);
    });
  });

  describe('deleteConversation', () => {
    it('sends DELETE to /conversations/:id', async () => {
      (api.delete as any).mockResolvedValue({});

      await deleteConversation('c1');

      expect(api.delete).toHaveBeenCalledWith('/conversations/c1');
    });

    it('propagates API errors', async () => {
      (api.delete as any).mockRejectedValue(new Error('Not found'));
      await expect(deleteConversation('c1')).rejects.toThrow('Not found');
    });
  });
});
