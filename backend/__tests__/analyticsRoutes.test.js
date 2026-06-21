describe('analytics route validation logic', () => {
  describe('days parameter', () => {
    test('defaults to 30 for invalid input', () => {
      const days = Math.min(90, parseInt('abc', 10) || 30);
      expect(days).toBe(30);
    });

    test('caps at 90', () => {
      const days = Math.min(90, parseInt('365', 10) || 30);
      expect(days).toBe(90);
    });

    test('accepts valid value', () => {
      const days = Math.min(90, parseInt('60', 10) || 30);
      expect(days).toBe(60);
    });
  });

  describe('limit parameter', () => {
    test('defaults to 10 for invalid input', () => {
      const limit = Math.min(20, parseInt('abc', 10) || 10);
      expect(limit).toBe(10);
    });

    test('caps at 20', () => {
      const limit = Math.min(20, parseInt('50', 10) || 10);
      expect(limit).toBe(20);
    });

    test('accepts valid value', () => {
      const limit = Math.min(20, parseInt('15', 10) || 10);
      expect(limit).toBe(15);
    });
  });

  describe('date range calculation', () => {
    test('start date is N days ago', () => {
      const days = 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const now = new Date();
      const diffDays = Math.round((now - startDate) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeGreaterThanOrEqual(29);
      expect(diffDays).toBeLessThanOrEqual(31);
    });

    test('start date hours are zeroed', () => {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(startDate.getSeconds()).toBe(0);
      expect(startDate.getMilliseconds()).toBe(0);
    });
  });

  describe('date iteration', () => {
    test('generates correct number of days', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-10');
      const data = [];
      const current = new Date(startDate);

      while (current <= endDate) {
        data.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      expect(data.length).toBe(10);
      expect(data[0]).toBe('2024-01-01');
      expect(data[9]).toBe('2024-01-10');
    });

    test('formats dates as YYYY-MM-DD', () => {
      const date = new Date('2024-03-15T12:00:00Z');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('room analytics mapping', () => {
    test('maps room with valid data', () => {
      const row = {
        _id: { toString: () => 'room1' },
        messageCount: 100,
        lastActivity: new Date(),
      };

      const room = { name: 'Test Room', description: 'A test room' };

      const mapped = {
        roomId: row._id.toString(),
        name: room?.name || 'Deleted Room',
        description: room?.description || '',
        messageCount: row.messageCount,
        lastActivity: row.lastActivity,
      };

      expect(mapped.roomId).toBe('room1');
      expect(mapped.name).toBe('Test Room');
      expect(mapped.messageCount).toBe(100);
    });

    test('handles deleted room', () => {
      const row = {
        _id: { toString: () => 'room1' },
        messageCount: 50,
        lastActivity: new Date(),
      };

      const room = null;

      const name = room?.name || 'Deleted Room';
      expect(name).toBe('Deleted Room');
    });

    test('filters out null roomIds', () => {
      const results = [
        { _id: { toString: () => 'room1' }, messageCount: 10 },
        { _id: null, messageCount: 5 },
        { _id: { toString: () => 'room2' }, messageCount: 3 },
      ];

      const filtered = results.filter((row) => row._id);
      expect(filtered.length).toBe(2);
    });
  });
});
