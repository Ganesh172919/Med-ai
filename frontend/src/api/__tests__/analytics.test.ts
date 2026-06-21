/**
 * Analytics API Tests
 * Tests all analytics-related API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../axios';
import { fetchMessageAnalytics, fetchUserAnalytics, fetchTopRooms } from '../analytics';

describe('Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMessageAnalytics', () => {
    it('sends GET to /analytics/messages with default days', async () => {
      const mockData = { data: [{ date: '2025-01-15', count: 20 }], total: 100 };
      (api.get as any).mockResolvedValue({ data: mockData });

      const result = await fetchMessageAnalytics();

      expect(api.get).toHaveBeenCalledWith('/analytics/messages', { params: { days: 30 } });
      expect(result).toEqual(mockData);
    });

    it('sends with custom days', async () => {
      (api.get as any).mockResolvedValue({ data: { data: [] } });

      await fetchMessageAnalytics(7);

      expect(api.get).toHaveBeenCalledWith('/analytics/messages', { params: { days: 7 } });
    });
  });

  describe('fetchUserAnalytics', () => {
    it('sends GET to /analytics/users', async () => {
      const mockData = { data: [{ date: '2025-01-15', count: 5 }] };
      (api.get as any).mockResolvedValue({ data: mockData });

      const result = await fetchUserAnalytics();

      expect(api.get).toHaveBeenCalledWith('/analytics/users', { params: { days: 30 } });
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchTopRooms', () => {
    it('sends GET to /analytics/rooms with default limit', async () => {
      const mockData = { data: [{ roomId: 'r1', name: 'Room 1', messageCount: 50 }] };
      (api.get as any).mockResolvedValue({ data: mockData });

      const result = await fetchTopRooms();

      expect(api.get).toHaveBeenCalledWith('/analytics/rooms', { params: { limit: 10 } });
      expect(result).toEqual(mockData);
    });

    it('sends with custom limit', async () => {
      (api.get as any).mockResolvedValue({ data: { data: [] } });

      await fetchTopRooms(5);

      expect(api.get).toHaveBeenCalledWith('/analytics/rooms', { params: { limit: 5 } });
    });
  });
});
