/**
 * Polls API Tests
 * Tests all poll-related API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import api from '../axios';
import { createPoll, votePoll, closePoll } from '../polls';

describe('Polls API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPoll', () => {
    it('sends POST to /polls with poll data', async () => {
      const mockPoll = { id: 'poll1', question: 'Test?', options: [] };
      (api.post as any).mockResolvedValue({ data: mockPoll });

      const result = await createPoll({
        roomId: 'room1',
        question: 'Test?',
        options: ['A', 'B'],
        allowMultipleVotes: false,
        isAnonymous: false,
      });

      expect(api.post).toHaveBeenCalledWith('/polls', {
        roomId: 'room1',
        question: 'Test?',
        options: ['A', 'B'],
        allowMultipleVotes: false,
        isAnonymous: false,
      });
      expect(result).toEqual(mockPoll);
    });

    it('sends with expiration when provided', async () => {
      (api.post as any).mockResolvedValue({ data: { id: 'poll1' } });

      await createPoll({
        roomId: 'room1',
        question: 'Test?',
        options: ['A', 'B'],
        expiresInMinutes: 60,
      });

      expect(api.post).toHaveBeenCalledWith('/polls', expect.objectContaining({
        expiresInMinutes: 60,
      }));
    });
  });

  describe('votePoll', () => {
    it('sends POST to /polls/:id/vote', async () => {
      (api.post as any).mockResolvedValue({ data: { success: true } });

      await votePoll('poll1', 0);

      expect(api.post).toHaveBeenCalledWith('/polls/poll1/vote', { optionIndex: 0 });
    });
  });

  describe('closePoll', () => {
    it('sends POST to /polls/:id/close', async () => {
      (api.post as any).mockResolvedValue({ data: { isClosed: true } });

      await closePoll('poll1');

      expect(api.post).toHaveBeenCalledWith('/polls/poll1/close');
    });
  });
});
