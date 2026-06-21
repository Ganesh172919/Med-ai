/**
 * Export API Tests
 * Tests all export-related API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../axios';
import { exportConversations, exportRoom, downloadBlob } from '../export';

describe('Export API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportConversations', () => {
    it('sends GET to /export/conversations with format', async () => {
      const mockBlob = new Blob(['data']);
      (api.get as any).mockResolvedValue({ data: mockBlob });

      const result = await exportConversations('markdown');

      expect(api.get).toHaveBeenCalledWith('/export/conversations', {
        params: { format: 'markdown' },
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });

    it('defaults to normalized format', async () => {
      (api.get as any).mockResolvedValue({ data: new Blob() });

      await exportConversations();

      expect(api.get).toHaveBeenCalledWith('/export/conversations', {
        params: { format: 'normalized' },
        responseType: 'blob',
      });
    });
  });

  describe('exportRoom', () => {
    it('sends GET to /export/rooms/:id with blob response', async () => {
      const mockBlob = new Blob(['data']);
      (api.get as any).mockResolvedValue({ data: mockBlob });

      const result = await exportRoom('r1');

      expect(api.get).toHaveBeenCalledWith('/export/rooms/r1', {
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('downloadBlob', () => {
    it('creates download link and clicks it', () => {
      const mockClick = vi.fn();
      const mockRemove = vi.fn();
      const mockAppend = vi.fn();

      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      } as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppend);
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemove);

      const blob = new Blob(['test']);
      downloadBlob(blob, 'test.txt');

      expect(mockClick).toHaveBeenCalled();
    });
  });
});
