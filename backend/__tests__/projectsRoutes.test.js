describe('projects route validation logic', () => {
  describe('normalizeString', () => {
    function normalizeString(value, maxLength = 1000) {
      return String(value || '')
        .trim()
        .slice(0, maxLength);
    }

    test('trims whitespace', () => {
      expect(normalizeString('  hello  ')).toBe('hello');
    });

    test('converts to string', () => {
      expect(normalizeString(123)).toBe('123');
    });

    test('handles null/undefined', () => {
      expect(normalizeString(null)).toBe('');
      expect(normalizeString(undefined)).toBe('');
    });

    test('truncates to maxLength', () => {
      const long = 'a'.repeat(2000);
      expect(normalizeString(long, 100).length).toBe(100);
    });

    test('uses default maxLength of 1000', () => {
      const long = 'a'.repeat(1500);
      expect(normalizeString(long).length).toBe(1000);
    });
  });

  describe('normalizeStringArray', () => {
    function normalizeString(value, maxLength = 1000) {
      return String(value || '').trim().slice(0, maxLength);
    }

    function normalizeStringArray(values, maxItems, maxLength) {
      if (!Array.isArray(values)) return [];
      return Array.from(new Set(
        values.map((v) => normalizeString(v, maxLength)).filter(Boolean)
      )).slice(0, maxItems);
    }

    test('returns empty array for non-array input', () => {
      expect(normalizeStringArray(null, 5, 100)).toEqual([]);
      expect(normalizeStringArray(undefined, 5, 100)).toEqual([]);
      expect(normalizeStringArray('string', 5, 100)).toEqual([]);
    });

    test('deduplicates values', () => {
      const result = normalizeStringArray(['a', 'b', 'a', 'c'], 10, 100);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    test('limits items', () => {
      const result = normalizeStringArray(['a', 'b', 'c', 'd', 'e'], 3, 100);
      expect(result.length).toBe(3);
    });

    test('filters empty strings', () => {
      const result = normalizeStringArray(['a', '', '  ', 'b'], 10, 100);
      expect(result).toEqual(['a', 'b']);
    });

    test('truncates individual values', () => {
      const result = normalizeStringArray(['a'.repeat(200)], 10, 50);
      expect(result[0].length).toBe(50);
    });
  });

  describe('normalizeFiles', () => {
    function normalizeFiles(files) {
      if (!Array.isArray(files)) return [];
      return files.slice(0, 12).map((file) => ({
        fileUrl: file?.fileUrl,
        fileName: String(file?.fileName || '').trim().slice(0, 160),
        fileType: String(file?.fileType || '').trim().slice(0, 120),
        fileSize: Number(file?.fileSize || 0),
        note: String(file?.note || '').trim().slice(0, 240),
      }));
    }

    test('returns empty array for non-array input', () => {
      expect(normalizeFiles(null)).toEqual([]);
      expect(normalizeFiles(undefined)).toEqual([]);
    });

    test('limits to 12 files', () => {
      const files = Array.from({ length: 20 }, (_, i) => ({
        fileUrl: `/file${i}`,
        fileName: `file${i}`,
        fileType: 'image/png',
        fileSize: 1000,
      }));
      expect(normalizeFiles(files).length).toBe(12);
    });

    test('normalizes file fields', () => {
      const files = [{
        fileUrl: '/api/uploads/test.png',
        fileName: '  test.png  ',
        fileType: 'image/png',
        fileSize: 1024,
        note: '  A note  ',
      }];
      const result = normalizeFiles(files);
      expect(result[0].fileName).toBe('test.png');
      expect(result[0].note).toBe('A note');
    });
  });

  describe('formatProject', () => {
    function formatProject(project, stats = {}) {
      return {
        id: project._id.toString(),
        name: project.name,
        description: project.description || '',
        instructions: project.instructions || '',
        context: project.context || '',
        tags: Array.isArray(project.tags) ? project.tags : [],
        suggestedPrompts: Array.isArray(project.suggestedPrompts) ? project.suggestedPrompts : [],
        files: Array.isArray(project.files)
          ? project.files.map((file) => ({
              id: file._id?.toString?.() || '',
              fileUrl: file.fileUrl,
              fileName: file.fileName,
              fileType: file.fileType,
              fileSize: file.fileSize,
              note: file.note || '',
              addedAt: file.addedAt,
            }))
          : [],
        conversationCount: stats.conversationCount || 0,
        lastConversationAt: stats.lastConversationAt || null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    }

    test('formats project with correct structure', () => {
      const project = {
        _id: { toString: () => 'proj1' },
        name: 'Test Project',
        description: 'A test project',
        instructions: 'Do something',
        context: 'Some context',
        tags: ['test'],
        suggestedPrompts: ['Tell me about X'],
        files: [{
          _id: { toString: () => 'file1' },
          fileUrl: '/file.png',
          fileName: 'file.png',
          fileType: 'image/png',
          fileSize: 1024,
          note: 'A file',
          addedAt: new Date(),
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = formatProject(project, { conversationCount: 5 });

      expect(result.id).toBe('proj1');
      expect(result.name).toBe('Test Project');
      expect(result.conversationCount).toBe(5);
      expect(result.files.length).toBe(1);
      expect(result.files[0].id).toBe('file1');
    });

    test('handles null optional fields', () => {
      const project = {
        _id: { toString: () => 'proj1' },
        name: 'Test',
        description: null,
        instructions: null,
        context: null,
        tags: null,
        suggestedPrompts: null,
        files: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = formatProject(project);

      expect(result.description).toBe('');
      expect(result.instructions).toBe('');
      expect(result.context).toBe('');
      expect(result.tags).toEqual([]);
      expect(result.suggestedPrompts).toEqual([]);
      expect(result.files).toEqual([]);
    });

    test('defaults stats to zeros', () => {
      const project = {
        _id: { toString: () => 'proj1' },
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = formatProject(project);

      expect(result.conversationCount).toBe(0);
      expect(result.lastConversationAt).toBeNull();
    });
  });
});
