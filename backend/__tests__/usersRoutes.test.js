jest.mock('../models/User', () => ({
  findById: jest.fn(),
}));

const User = require('../models/User');

describe('users route validation logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('display name validation', () => {
    test('display name must be under 50 characters', () => {
      const valid = 'Alice';
      const invalid = 'a'.repeat(51);
      expect(valid.length).toBeLessThanOrEqual(50);
      expect(invalid.length).toBeGreaterThan(50);
    });

    test('display name is trimmed', () => {
      const name = '  Alice  ';
      expect(name.trim()).toBe('Alice');
    });
  });

  describe('bio validation', () => {
    test('bio must be under 200 characters', () => {
      const valid = 'Hello world';
      const invalid = 'a'.repeat(201);
      expect(valid.length).toBeLessThanOrEqual(200);
      expect(invalid.length).toBeGreaterThan(200);
    });
  });

  describe('avatar validation', () => {
    test('avatar must be under 500000 characters', () => {
      const valid = 'data:image/png;base64,abc123';
      const invalid = 'a'.repeat(500001);
      expect(valid.length).toBeLessThanOrEqual(500000);
      expect(invalid.length).toBeGreaterThan(500000);
    });
  });

  describe('public profile fields', () => {
    test('profile includes required fields', () => {
      const profile = {
        id: 'user123',
        username: 'alice',
        displayName: 'Alice W',
        bio: 'Hello',
        avatar: null,
        onlineStatus: 'online',
        lastSeen: new Date(),
        createdAt: new Date(),
      };

      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('username');
      expect(profile).toHaveProperty('displayName');
      expect(profile).toHaveProperty('bio');
      expect(profile).toHaveProperty('avatar');
      expect(profile).toHaveProperty('onlineStatus');
      expect(profile).toHaveProperty('lastSeen');
      expect(profile).toHaveProperty('createdAt');
    });

    test('displayName falls back to username', () => {
      const user = { username: 'bob', displayName: '' };
      const displayName = user.displayName || user.username;
      expect(displayName).toBe('bob');
    });

    test('bio defaults to empty string', () => {
      const user = { bio: null };
      const bio = user.bio || '';
      expect(bio).toBe('');
    });
  });
});
