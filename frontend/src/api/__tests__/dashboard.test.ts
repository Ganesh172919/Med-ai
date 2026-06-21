/**
 * Dashboard API Tests
 * Tests the dashboard API function.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../axios';
import { fetchDashboard } from '../dashboard';

describe('Dashboard API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchDashboard', () => {
    it('sends GET to /dashboard', async () => {
      const mockData = {
        recentRooms: [{ id: 'r1', name: 'Room 1' }],
        stats: { totalMessages: 50, totalRooms: 3 },
      };
      (api.get as any).mockResolvedValue({ data: mockData });

      const result = await fetchDashboard();

      expect(api.get).toHaveBeenCalledWith('/dashboard');
      expect(result).toEqual(mockData);
    });
  });
});
