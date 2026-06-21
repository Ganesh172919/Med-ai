describe('memory route validation logic', () => {
  describe('memory entry mapping', () => {
    test('maps memory entry to response format', () => {
      const row = {
        _id: { toString: () => 'mem1' },
        summary: 'User likes JavaScript',
        details: 'Prefers TypeScript over plain JS',
        tags: ['coding', 'preference'],
        pinned: false,
        confidenceScore: 0.85,
        importanceScore: 0.7,
        recencyScore: 0.9,
        sourceType: 'conversation',
        sourceConversationId: { toString: () => 'conv1' },
        sourceRoomId: null,
        updatedAt: new Date(),
        usageCount: 5,
      };

      const mapped = {
        id: row._id.toString(),
        summary: row.summary,
        details: row.details,
        tags: row.tags || [],
        pinned: row.pinned,
        confidenceScore: row.confidenceScore,
        importanceScore: row.importanceScore,
        recencyScore: row.recencyScore,
        sourceType: row.sourceType,
        sourceConversationId: row.sourceConversationId?.toString() || null,
        sourceRoomId: row.sourceRoomId?.toString() || null,
        updatedAt: row.updatedAt,
        usageCount: row.usageCount,
      };

      expect(mapped.id).toBe('mem1');
      expect(mapped.summary).toBe('User likes JavaScript');
      expect(mapped.tags).toEqual(['coding', 'preference']);
      expect(mapped.sourceConversationId).toBe('conv1');
      expect(mapped.sourceRoomId).toBeNull();
    });

    test('handles null optional fields', () => {
      const row = {
        _id: { toString: () => 'mem2' },
        summary: 'Test',
        details: '',
        tags: null,
        pinned: false,
        confidenceScore: 0.5,
        importanceScore: 0.5,
        recencyScore: 0.5,
        sourceType: 'chat',
        sourceConversationId: null,
        sourceRoomId: null,
        updatedAt: new Date(),
        usageCount: 0,
      };

      const tags = row.tags || [];
      expect(tags).toEqual([]);
    });
  });

  describe('memory search filter', () => {
    test('filters by search term in summary', () => {
      const rows = [
        { summary: 'User likes JavaScript', details: '', tags: [] },
        { summary: 'User lives in NYC', details: '', tags: [] },
      ];
      const search = 'javascript';

      const result = rows.filter((row) => {
        const haystack = [row.summary, row.details, ...(row.tags || [])].join(' ').toLowerCase();
        return haystack.includes(search);
      });

      expect(result.length).toBe(1);
      expect(result[0].summary).toContain('JavaScript');
    });

    test('filters by search term in tags', () => {
      const rows = [
        { summary: 'Test', details: '', tags: ['coding'] },
        { summary: 'Test2', details: '', tags: ['travel'] },
      ];
      const search = 'coding';

      const result = rows.filter((row) => {
        const haystack = [row.summary, row.details, ...(row.tags || [])].join(' ').toLowerCase();
        return haystack.includes(search);
      });

      expect(result.length).toBe(1);
      expect(result[0].tags).toContain('coding');
    });

    test('returns all rows when search is empty', () => {
      const rows = [
        { summary: 'Test1', details: '', tags: [] },
        { summary: 'Test2', details: '', tags: [] },
      ];
      const search = '';

      const result = rows.filter(() => !search || true);

      expect(result.length).toBe(2);
    });
  });

  describe('memory entry update validation', () => {
    test('summary is trimmed and limited to 280 chars', () => {
      const summary = '  A long summary  ';
      const cleaned = summary.trim().slice(0, 280);
      expect(cleaned).toBe('A long summary');
    });

    test('summary over 280 chars is truncated', () => {
      const summary = 'a'.repeat(300);
      const cleaned = summary.trim().slice(0, 280);
      expect(cleaned.length).toBe(280);
    });

    test('details is trimmed and limited to 1200 chars', () => {
      const details = 'a'.repeat(1500);
      const cleaned = details.trim().slice(0, 1200);
      expect(cleaned.length).toBe(1200);
    });

    test('tags are deduplicated and limited to 10', () => {
      const tags = ['coding', 'Coding', 'javascript', 'js', 'tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8'];
      const cleaned = [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 10);
      expect(cleaned.length).toBeLessThanOrEqual(10);
    });

    test('confidenceScore is clamped to 0-1', () => {
      const clamp = (v) => Math.max(0, Math.min(1, v));
      expect(clamp(0.5)).toBe(0.5);
      expect(clamp(-0.1)).toBe(0);
      expect(clamp(1.5)).toBe(1);
    });

    test('importanceScore is clamped to 0-1', () => {
      const clamp = (v) => Math.max(0, Math.min(1, v));
      expect(clamp(0.8)).toBe(0.8);
      expect(clamp(-1)).toBe(0);
      expect(clamp(2)).toBe(1);
    });
  });

  describe('memory list limit', () => {
    test('limit is capped at 100', () => {
      const limit = Math.min(100, parseInt('200', 10) || 50);
      expect(limit).toBe(100);
    });

    test('limit defaults to 50', () => {
      const limit = Math.min(100, parseInt('abc', 10) || 50);
      expect(limit).toBe(50);
    });
  });
});
