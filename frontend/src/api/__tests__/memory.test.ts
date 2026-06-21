/**
 * Memory API Tests
 * Tests all memory-related API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../axios';
import {
  fetchMemoryEntries,
  updateMemoryEntry,
  deleteMemoryEntry,
  previewMemoryImport,
  importMemoryBundle,
  exportMemoryBundle,
} from '../memory';

describe('Memory API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMemoryEntries', () => {
    it('sends GET to /memory', async () => {
      const mockMemories = [{ id: 'm1', summary: 'Test memory' }];
      (api.get as any).mockResolvedValue({ data: mockMemories });

      const result = await fetchMemoryEntries();

      expect(api.get).toHaveBeenCalledWith('/memory', { params: undefined });
      expect(result).toEqual(mockMemories);
    });

    it('sends with query param when provided', async () => {
      (api.get as any).mockResolvedValue({ data: [] });

      await fetchMemoryEntries('search term');

      expect(api.get).toHaveBeenCalledWith('/memory', { params: { q: 'search term' } });
    });
  });

  describe('updateMemoryEntry', () => {
    it('sends PUT to /memory/:id', async () => {
      (api.put as any).mockResolvedValue({ data: { id: 'm1', summary: 'Updated' } });

      const result = await updateMemoryEntry('m1', { summary: 'Updated' });

      expect(api.put).toHaveBeenCalledWith('/memory/m1', { summary: 'Updated' });
      expect(result.summary).toBe('Updated');
    });
  });

  describe('deleteMemoryEntry', () => {
    it('sends DELETE to /memory/:id', async () => {
      (api.delete as any).mockResolvedValue({});

      await deleteMemoryEntry('m1');

      expect(api.delete).toHaveBeenCalledWith('/memory/m1');
    });
  });

  describe('previewMemoryImport', () => {
    it('sends POST to /memory/import with preview mode', async () => {
      const mockPreview = { conversations: [], candidateMemories: [] };
      (api.post as any).mockResolvedValue({ data: mockPreview });

      const result = await previewMemoryImport('content', 'file.json');

      expect(api.post).toHaveBeenCalledWith('/memory/import', {
        mode: 'preview',
        content: 'content',
        filename: 'file.json',
      });
      expect(result).toEqual(mockPreview);
    });
  });

  describe('importMemoryBundle', () => {
    it('sends POST to /memory/import with import mode', async () => {
      const mockResult = { reused: false, importSessionId: 's1', importedConversationIds: [], importedMemoryIds: [] };
      (api.post as any).mockResolvedValue({ data: mockResult });

      const result = await importMemoryBundle('content', 'file.json');

      expect(api.post).toHaveBeenCalledWith('/memory/import', {
        mode: 'import',
        content: 'content',
        filename: 'file.json',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('exportMemoryBundle', () => {
    it('sends GET to /memory/export with format', async () => {
      const mockBlob = new Blob(['data']);
      (api.get as any).mockResolvedValue({ data: mockBlob });

      const result = await exportMemoryBundle('markdown');

      expect(api.get).toHaveBeenCalledWith('/memory/export', {
        params: { format: 'markdown' },
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });
  });
});
