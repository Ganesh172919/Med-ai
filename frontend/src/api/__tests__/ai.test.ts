/**
 * AI API Tests
 * Tests all AI-related API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '../axios';
import { getSmartReplies, analyzeSentiment, checkGrammar } from '../ai';

describe('AI API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSmartReplies', () => {
    it('sends POST to /ai/smart-replies', async () => {
      const mockResponse = { suggestions: ['Thanks!', 'Tell me more'] };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const messages = [{ role: 'assistant', content: 'How can I help?' }];
      const result = await getSmartReplies(messages);

      expect(api.post).toHaveBeenCalledWith('/ai/smart-replies', {
        messages,
        context: undefined,
        modelId: undefined,
      });
      expect(result.suggestions).toHaveLength(2);
    });

    it('sends with context and modelId when provided', async () => {
      (api.post as any).mockResolvedValue({ data: { suggestions: [] } });

      const messages = [{ role: 'user', content: 'Hello' }];
      await getSmartReplies(messages, 'coding help', 'gpt-4');

      expect(api.post).toHaveBeenCalledWith('/ai/smart-replies', {
        messages,
        context: 'coding help',
        modelId: 'gpt-4',
      });
    });
  });

  describe('analyzeSentiment', () => {
    it('sends POST to /ai/sentiment', async () => {
      const mockResponse = { sentiment: 'positive', emoji: '😊', confidence: 0.9 };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const result = await analyzeSentiment('I love this!');

      expect(api.post).toHaveBeenCalledWith('/ai/sentiment', { text: 'I love this!' });
      expect(result.sentiment).toBe('positive');
    });
  });

  describe('checkGrammar', () => {
    it('sends POST to /ai/grammar', async () => {
      const mockResponse = { suggestions: [{ original: 'teh', corrected: 'the' }] };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const result = await checkGrammar('I have teh best code');

      expect(api.post).toHaveBeenCalledWith('/ai/grammar', { text: 'I have teh best code' });
      expect(result.suggestions).toHaveLength(1);
    });

    it('returns empty suggestions for correct text', async () => {
      (api.post as any).mockResolvedValue({ data: { suggestions: [] } });

      const result = await checkGrammar('Perfect grammar.');

      expect(result.suggestions).toHaveLength(0);
    });
  });
});
