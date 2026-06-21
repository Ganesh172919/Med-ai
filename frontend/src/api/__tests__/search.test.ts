/**
 * Search API Tests
 * Tests the search API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../axios';
import { searchMessages, searchConversations } from '../search';

describe('Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchMessages', () => {
    it('sends GET to /search/messages with params', async () => {
      const mockResponse = { results: [{ id: 'm1', content: 'result' }], total: 1, page: 1, totalPages: 1 };
      (api.get as any).mockResolvedValue({ data: mockResponse });

      const result = await searchMessages({ q: 'test query' });

      expect(api.get).toHaveBeenCalledWith('/search/messages', { params: { q: 'test query' } });
      expect(result).toEqual(mockResponse);
    });

    it('sends with roomId filter', async () => {
      (api.get as any).mockResolvedValue({ data: { results: [], total: 0 } });

      await searchMessages({ q: 'test', roomId: 'room1' });

      expect(api.get).toHaveBeenCalledWith('/search/messages', { params: { q: 'test', roomId: 'room1' } });
    });

    it('sends with pagination', async () => {
      (api.get as any).mockResolvedValue({ data: { results: [], total: 0 } });

      await searchMessages({ q: 'test', page: 2, limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/search/messages', { params: { q: 'test', page: 2, limit: 10 } });
    });
  });

  describe('searchConversations', () => {
    it('sends GET to /search/conversations', async () => {
      const mockResponse = { results: [{ id: 'c1', title: 'Test' }], total: 1 };
      (api.get as any).mockResolvedValue({ data: mockResponse });

      const result = await searchConversations('test');

      expect(api.get).toHaveBeenCalledWith('/search/conversations', { params: { q: 'test', page: 1, limit: 20 } });
      expect(result).toEqual(mockResponse);
    });

    it('sends with custom pagination', async () => {
      (api.get as any).mockResolvedValue({ data: { results: [] } });

      await searchConversations('test', 2, 10);

      expect(api.get).toHaveBeenCalledWith('/search/conversations', { params: { q: 'test', page: 2, limit: 10 } });
    });
  });
});
