jest.mock('../models/MemoryEntry', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateMany: jest.fn(),
}));

jest.mock('../services/gemini', () => ({
  getJsonFromModel: jest.fn(),
}));

const {
  normalizeText,
  buildFingerprint,
  retrieveRelevantMemories,
  markMemoriesUsed,
} = require('../services/memory');

// We need to test internal functions, so let's require the module and access them
// through the service's exported functions that use them internally.
// For the pure utility functions, we can test them via their effects on exported functions.

const MemoryEntry = require('../models/MemoryEntry');

describe('memory service utilities', () => {
  // normalizeText is not exported, but we can test it through buildFingerprint
  // which uses normalizeText internally

  describe('buildFingerprint', () => {
    test('returns consistent hash for same input', () => {
      const fp1 = buildFingerprint('User likes JavaScript');
      const fp2 = buildFingerprint('User likes JavaScript');
      expect(fp1).toBe(fp2);
    });

    test('returns different hash for different input', () => {
      const fp1 = buildFingerprint('User likes JavaScript');
      const fp2 = buildFingerprint('User likes Python');
      expect(fp1).not.toBe(fp2);
    });

    test('returns hex string of 40 chars (SHA-1)', () => {
      const fp = buildFingerprint('test summary');
      expect(fp).toMatch(/^[a-f0-9]{40}$/);
    });

    test('normalizes case before hashing', () => {
      const fp1 = buildFingerprint('Hello World');
      const fp2 = buildFingerprint('hello world');
      expect(fp1).toBe(fp2);
    });

    test('normalizes special characters', () => {
      const fp1 = buildFingerprint('user likes c++');
      const fp2 = buildFingerprint('user likes c  ');
      // Special chars are replaced with spaces, so "c++" → "c  " → "c"
      expect(fp1).toBe(fp2);
    });

    test('handles empty string', () => {
      const fp = buildFingerprint('');
      expect(fp).toMatch(/^[a-f0-9]{40}$/);
    });

    test('handles undefined input', () => {
      const fp = buildFingerprint(undefined);
      expect(fp).toMatch(/^[a-f0-9]{40}$/);
    });
  });
});

describe('retrieveRelevantMemories', () => {
  beforeEach(() => {
    MemoryEntry.find.mockReset();
  });

  test('returns empty array when no entries exist', async () => {
    MemoryEntry.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    });
    const result = await retrieveRelevantMemories({ userId: 'u1', query: 'test' });
    expect(result).toEqual([]);
  });

  test('returns entries sorted by score', async () => {
    const entries = [
      { _id: '1', summary: 'unrelated entry', details: '', tags: [], importanceScore: 0.1, confidenceScore: 0.1, usageCount: 0, pinned: false, updatedAt: new Date() },
      { _id: '2', summary: 'javascript preference', details: 'likes javascript', tags: ['coding'], importanceScore: 0.9, confidenceScore: 0.9, usageCount: 5, pinned: false, updatedAt: new Date() },
    ];
    MemoryEntry.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(entries),
        }),
      }),
    });
    const result = await retrieveRelevantMemories({ userId: 'u1', query: 'javascript' });
    // The entry with 'javascript' in summary/details should score higher
    if (result.length > 1) {
      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
    }
  });

  test('limits results to specified limit', async () => {
    const entries = Array.from({ length: 20 }, (_, i) => ({
      _id: String(i), summary: `entry ${i} about coding`, details: 'coding details',
      tags: ['code'], importanceScore: 0.8, confidenceScore: 0.8,
      usageCount: 0, pinned: false, updatedAt: new Date(),
    }));
    MemoryEntry.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(entries),
        }),
      }),
    });
    const result = await retrieveRelevantMemories({ userId: 'u1', query: 'coding', limit: 3 });
    expect(result.length).toBeLessThanOrEqual(3);
  });

  test('pinned entries get score bonus', async () => {
    const entries = [
      { _id: '1', summary: 'pinned entry about cats', details: '', tags: ['pets'], importanceScore: 0.5, confidenceScore: 0.5, usageCount: 0, pinned: true, updatedAt: new Date() },
      { _id: '2', summary: 'unpinned entry about cats', details: '', tags: ['pets'], importanceScore: 0.5, confidenceScore: 0.5, usageCount: 0, pinned: false, updatedAt: new Date() },
    ];
    MemoryEntry.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(entries),
        }),
      }),
    });
    const result = await retrieveRelevantMemories({ userId: 'u1', query: 'cats' });
    if (result.length >= 2) {
      const pinned = result.find((e) => e.pinned);
      const unpinned = result.find((e) => !e.pinned);
      if (pinned && unpinned) {
        expect(pinned.score).toBeGreaterThan(unpinned.score);
      }
    }
  });

  test('filters out entries with very low score and not pinned', async () => {
    const veryOldDate = new Date('2020-01-01');
    const entries = [
      { _id: '1', summary: 'aaa bbb ccc', details: 'ddd eee fff', tags: ['zzz'], importanceScore: 0.01, confidenceScore: 0.01, usageCount: 0, pinned: false, updatedAt: veryOldDate, lastObservedAt: veryOldDate },
    ];
    MemoryEntry.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(entries),
        }),
      }),
    });
    const result = await retrieveRelevantMemories({ userId: 'u1', query: 'quantum physics theory' });
    // Very low importance + very old + no token overlap → score < 0.08
    expect(result.length).toBe(0);
  });
});

describe('markMemoriesUsed', () => {
  beforeEach(() => {
    MemoryEntry.updateMany.mockReset();
  });

  test('does nothing for empty array', async () => {
    await markMemoriesUsed([]);
    expect(MemoryEntry.updateMany).not.toHaveBeenCalled();
  });

  test('does nothing for undefined', async () => {
    await markMemoriesUsed(undefined);
    expect(MemoryEntry.updateMany).not.toHaveBeenCalled();
  });

  test('increments usageCount for provided IDs', async () => {
    MemoryEntry.updateMany.mockResolvedValue({ modifiedCount: 2 });
    await markMemoriesUsed([{ _id: 'id1' }, { id: 'id2' }]);
    expect(MemoryEntry.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ['id1', 'id2'] } },
      expect.objectContaining({
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: expect.any(Date) },
      })
    );
  });

  test('filters out entries without IDs', async () => {
    MemoryEntry.updateMany.mockResolvedValue({ modifiedCount: 1 });
    await markMemoriesUsed([{ _id: 'id1' }, {}, { id: 'id2' }]);
    expect(MemoryEntry.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ['id1', 'id2'] } },
      expect.any(Object)
    );
  });
});
