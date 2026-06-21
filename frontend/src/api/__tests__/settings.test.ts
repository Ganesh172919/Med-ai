/**
 * Settings API Tests
 * Tests settings fetch and update with caching.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock('../axios', () => ({
  default: {
    get: mockGet,
    put: mockPut,
  },
}));

describe('Settings API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('fetchSettings', () => {
    it('sends GET to /settings', async () => {
      const mockSettings = {
        theme: { mode: 'dark', customTheme: 'default' },
        accentColor: '#A855F7',
      };
      mockGet.mockResolvedValue({ data: mockSettings });

      const { fetchSettings } = await import('../settings');
      const result = await fetchSettings();

      expect(mockGet).toHaveBeenCalledWith('/settings');
      expect(result).toEqual(mockSettings);
    });

    it('propagates API errors', async () => {
      mockGet.mockRejectedValue(new Error('Unauthorized'));

      const { fetchSettings } = await import('../settings');
      await expect(fetchSettings()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateSettings', () => {
    it('sends PUT to /settings with partial data', async () => {
      const mockSettings = { accentColor: '#FF0000' };
      mockPut.mockResolvedValue({ data: mockSettings });

      const { updateSettings } = await import('../settings');
      const result = await updateSettings({ accentColor: '#FF0000' });

      expect(mockPut).toHaveBeenCalledWith('/settings', { accentColor: '#FF0000' });
      expect(result.accentColor).toBe('#FF0000');
    });

    it('updates theme settings', async () => {
      const mockSettings = { theme: { mode: 'light', customTheme: 'midnight' } };
      mockPut.mockResolvedValue({ data: mockSettings });

      const { updateSettings } = await import('../settings');
      const result = await updateSettings({ theme: { mode: 'light', customTheme: 'midnight' } });

      expect(result.theme.mode).toBe('light');
    });
  });
});
