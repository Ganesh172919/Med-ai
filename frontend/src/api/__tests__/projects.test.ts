/**
 * Projects API Tests
 * Tests all project-related API functions.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../axios';
import { fetchProjects, fetchProject, createProject, updateProject, deleteProject } from '../projects';

const mockProject = {
  id: 'p1',
  name: 'Test Project',
  description: 'Description',
  instructions: '',
  context: '',
  tags: ['test'],
  suggestedPrompts: [],
  files: [],
  conversationCount: 0,
  lastConversationAt: null,
  createdAt: '2025-01-15',
  updatedAt: '2025-01-15',
};

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchProjects', () => {
    it('sends GET to /projects', async () => {
      (api.get as any).mockResolvedValue({ data: [mockProject] });

      const result = await fetchProjects();

      expect(api.get).toHaveBeenCalledWith('/projects');
      expect(result).toEqual([mockProject]);
    });
  });

  describe('fetchProject', () => {
    it('sends GET to /projects/:id', async () => {
      (api.get as any).mockResolvedValue({ data: mockProject });

      const result = await fetchProject('p1');

      expect(api.get).toHaveBeenCalledWith('/projects/p1');
      expect(result).toEqual(mockProject);
    });
  });

  describe('createProject', () => {
    it('sends POST to /projects', async () => {
      (api.post as any).mockResolvedValue({ data: mockProject });

      const result = await createProject({
        name: 'Test Project',
        description: 'Description',
        instructions: '',
        context: '',
        tags: ['test'],
        suggestedPrompts: [],
        files: [],
      });

      expect(api.post).toHaveBeenCalledWith('/projects', expect.objectContaining({
        name: 'Test Project',
      }));
      expect(result).toEqual(mockProject);
    });
  });

  describe('updateProject', () => {
    it('sends PATCH to /projects/:id', async () => {
      (api.patch as any).mockResolvedValue({ data: { ...mockProject, name: 'Updated' } });

      const result = await updateProject('p1', {
        name: 'Updated',
        description: 'Description',
        instructions: '',
        context: '',
        tags: [],
        suggestedPrompts: [],
        files: [],
      });

      expect(api.patch).toHaveBeenCalledWith('/projects/p1', expect.objectContaining({
        name: 'Updated',
      }));
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteProject', () => {
    it('sends DELETE to /projects/:id', async () => {
      (api.delete as any).mockResolvedValue({});

      await deleteProject('p1');

      expect(api.delete).toHaveBeenCalledWith('/projects/p1');
    });
  });
});
