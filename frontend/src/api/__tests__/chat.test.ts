/**
 * Chat API Tests
 * Tests the chat message sending function.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '../axios';
import { sendChatMessage } from '../chat';

describe('Chat API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendChatMessage', () => {
    it('sends POST to /chat with message and history', async () => {
      const mockResponse = {
        conversationId: 'conv1',
        role: 'assistant',
        content: 'Hello!',
        timestamp: '2025-01-15T10:00:00Z',
      };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const history = [{ role: 'user', parts: [{ text: 'Hi' }] }];
      const result = await sendChatMessage('Hello', history);

      expect(api.post).toHaveBeenCalledWith('/chat', {
        message: 'Hello',
        history,
        conversationId: undefined,
        modelId: undefined,
        attachment: undefined,
        projectId: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('sends with conversationId when provided', async () => {
      (api.post as any).mockResolvedValue({ data: { content: 'ok' } });

      await sendChatMessage('test', [], 'conv-123');

      expect(api.post).toHaveBeenCalledWith('/chat', expect.objectContaining({
        conversationId: 'conv-123',
      }));
    });

    it('sends with modelId when provided', async () => {
      (api.post as any).mockResolvedValue({ data: { content: 'ok' } });

      await sendChatMessage('test', [], undefined, 'gpt-4');

      expect(api.post).toHaveBeenCalledWith('/chat', expect.objectContaining({
        modelId: 'gpt-4',
      }));
    });

    it('sends with attachment when provided', async () => {
      (api.post as any).mockResolvedValue({ data: { content: 'ok' } });
      const attachment = { fileUrl: 'url', fileName: 'file.pdf', fileType: 'application/pdf', fileSize: 1024 };

      await sendChatMessage('test', [], undefined, undefined, attachment);

      expect(api.post).toHaveBeenCalledWith('/chat', expect.objectContaining({
        attachment,
      }));
    });

    it('sends with projectId when provided', async () => {
      (api.post as any).mockResolvedValue({ data: { content: 'ok' } });

      await sendChatMessage('test', [], undefined, undefined, null, 'proj-1');

      expect(api.post).toHaveBeenCalledWith('/chat', expect.objectContaining({
        projectId: 'proj-1',
      }));
    });

    it('propagates API errors', async () => {
      (api.post as any).mockRejectedValue(new Error('AI service unavailable'));
      await expect(sendChatMessage('test', [])).rejects.toThrow('AI service unavailable');
    });

    it('returns memoryRefs when provided', async () => {
      const mockResponse = {
        content: 'response',
        memoryRefs: [{ id: 'mem1', summary: 'test memory', score: 0.9 }],
      };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const result = await sendChatMessage('test', []);

      expect(result.memoryRefs).toHaveLength(1);
      expect(result.memoryRefs![0].id).toBe('mem1');
    });

    it('returns AI metadata fields', async () => {
      const mockResponse = {
        content: 'response',
        modelId: 'gpt-4',
        provider: 'openai',
        processingMs: 1500,
        totalTokens: 100,
        autoMode: false,
      };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const result = await sendChatMessage('test', []);

      expect(result.modelId).toBe('gpt-4');
      expect(result.provider).toBe('openai');
      expect(result.processingMs).toBe(1500);
      expect(result.totalTokens).toBe(100);
    });
  });
});
