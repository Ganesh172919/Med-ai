/**
 * Rooms API Tests
 * Tests all room-related API functions.
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
  fetchRooms,
  createRoom,
  fetchRoomById,
  fetchRoomAccess,
  joinRoomById,
  fetchRoomPrivateKey,
  deleteRoom,
  uploadFile,
} from '../rooms';

describe('Rooms API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRooms', () => {
    it('sends GET to /rooms', async () => {
      const mockRooms = [{ id: 'r1', name: 'Test Room' }];
      (api.get as any).mockResolvedValue({ data: mockRooms });

      const result = await fetchRooms();

      expect(api.get).toHaveBeenCalledWith('/rooms');
      expect(result).toEqual(mockRooms);
    });
  });

  describe('createRoom', () => {
    it('sends POST to /rooms with room data', async () => {
      const mockRoom = { id: 'r1', name: 'New Room' };
      (api.post as any).mockResolvedValue({ data: mockRoom });

      const result = await createRoom('New Room', 'Description', ['tag1'], 20, 'public');

      expect(api.post).toHaveBeenCalledWith('/rooms', {
        name: 'New Room',
        description: 'Description',
        tags: ['tag1'],
        maxUsers: 20,
        visibility: 'public',
      });
      expect(result).toEqual(mockRoom);
    });

    it('creates private room', async () => {
      (api.post as any).mockResolvedValue({ data: { id: 'r1' } });

      await createRoom('Private', '', [], 10, 'private');

      expect(api.post).toHaveBeenCalledWith('/rooms', expect.objectContaining({
        visibility: 'private',
      }));
    });
  });

  describe('fetchRoomById', () => {
    it('sends GET to /rooms/:id', async () => {
      const mockDetail = { id: 'r1', name: 'Room', messages: [] };
      (api.get as any).mockResolvedValue({ data: mockDetail });

      const result = await fetchRoomById('r1');

      expect(api.get).toHaveBeenCalledWith('/rooms/r1');
      expect(result).toEqual(mockDetail);
    });
  });

  describe('fetchRoomAccess', () => {
    it('sends GET to /rooms/:id/access', async () => {
      const mockAccess = { id: 'r1', hasAccess: true, requiresJoinKey: false };
      (api.get as any).mockResolvedValue({ data: mockAccess });

      const result = await fetchRoomAccess('r1');

      expect(api.get).toHaveBeenCalledWith('/rooms/r1/access');
      expect(result).toEqual(mockAccess);
    });
  });

  describe('joinRoomById', () => {
    it('sends POST to /rooms/:id/join', async () => {
      (api.post as any).mockResolvedValue({ data: { id: 'r1' } });

      await joinRoomById('r1');

      expect(api.post).toHaveBeenCalledWith('/rooms/r1/join', {});
    });

    it('sends joinKey when provided', async () => {
      (api.post as any).mockResolvedValue({ data: { id: 'r1' } });

      await joinRoomById('r1', 'secret-key');

      expect(api.post).toHaveBeenCalledWith('/rooms/r1/join', { joinKey: 'secret-key' });
    });
  });

  describe('fetchRoomPrivateKey', () => {
    it('sends GET to /rooms/:id/private-key', async () => {
      (api.get as any).mockResolvedValue({ data: { privateJoinKey: 'key123' } });

      const result = await fetchRoomPrivateKey('r1');

      expect(api.get).toHaveBeenCalledWith('/rooms/r1/private-key');
      expect(result.privateJoinKey).toBe('key123');
    });
  });

  describe('deleteRoom', () => {
    it('sends DELETE to /rooms/:id', async () => {
      (api.delete as any).mockResolvedValue({});

      await deleteRoom('r1');

      expect(api.delete).toHaveBeenCalledWith('/rooms/r1');
    });
  });

  describe('uploadFile', () => {
    it('sends POST to /uploads with FormData', async () => {
      const mockResponse = { fileUrl: 'url', fileName: 'file.pdf', fileType: 'application/pdf', fileSize: 1024 };
      (api.post as any).mockResolvedValue({ data: mockResponse });

      const file = new File(['content'], 'file.pdf', { type: 'application/pdf' });
      const result = await uploadFile(file);

      expect(api.post).toHaveBeenCalledWith('/uploads', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
