/**
 * Admin API Tests
 * Tests all admin-related API functions.
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
import { fetchAdminStats, fetchReports, resolveReport, fetchAdminUsers } from '../admin';

describe('Admin API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAdminStats', () => {
    it('sends GET to /admin/stats', async () => {
      const mockStats = { totalUsers: 100, totalRooms: 10, totalMessages: 500 };
      (api.get as any).mockResolvedValue({ data: mockStats });

      const result = await fetchAdminStats();

      expect(api.get).toHaveBeenCalledWith('/admin/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('fetchReports', () => {
    it('sends GET to /admin/reports with defaults', async () => {
      const mockResponse = { reports: [], total: 0, page: 1, totalPages: 0 };
      (api.get as any).mockResolvedValue({ data: mockResponse });

      const result = await fetchReports();

      expect(api.get).toHaveBeenCalledWith('/admin/reports', { params: { page: 1, status: 'pending' } });
      expect(result).toEqual(mockResponse);
    });

    it('sends with custom page and status', async () => {
      (api.get as any).mockResolvedValue({ data: { reports: [] } });

      await fetchReports(2, 'reviewed');

      expect(api.get).toHaveBeenCalledWith('/admin/reports', { params: { page: 2, status: 'reviewed' } });
    });
  });

  describe('resolveReport', () => {
    it('sends PUT to /admin/reports/:id', async () => {
      (api.put as any).mockResolvedValue({ data: { id: 'r1', status: 'reviewed', message: 'Resolved' } });

      const result = await resolveReport('r1', 'reviewed', 'Reviewed and resolved');

      expect(api.put).toHaveBeenCalledWith('/admin/reports/r1', {
        status: 'reviewed',
        reviewNote: 'Reviewed and resolved',
      });
      expect(result.status).toBe('reviewed');
    });
  });

  describe('fetchAdminUsers', () => {
    it('sends GET to /admin/users with defaults', async () => {
      const mockResponse = { users: [], total: 0, page: 1, totalPages: 0 };
      (api.get as any).mockResolvedValue({ data: mockResponse });

      const result = await fetchAdminUsers();

      expect(api.get).toHaveBeenCalledWith('/admin/users', { params: { page: 1, q: '' } });
      expect(result).toEqual(mockResponse);
    });

    it('sends with search param', async () => {
      (api.get as any).mockResolvedValue({ data: { users: [] } });

      await fetchAdminUsers(1, 'test');

      expect(api.get).toHaveBeenCalledWith('/admin/users', { params: { page: 1, q: 'test' } });
    });
  });
});
