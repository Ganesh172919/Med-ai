/**
 * User Model Tests
 * Tests schema structure, defaults, validation, and instance methods.
 */

const mongoose = require('mongoose');

// Mock bcrypt to avoid real hashing in tests
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

const bcrypt = require('bcryptjs');

// We need to test the schema and methods directly
// Load the model fresh each time to avoid cache issues
let User;

beforeEach(() => {
  jest.clearAllMocks();
  // Clear the model cache so we get a fresh schema
  delete mongoose.models.User;
  if (mongoose.modelSchemas) delete mongoose.modelSchemas.User;
  User = require('../models/User');
});

describe('User Model', () => {
  describe('schema structure', () => {
    it('exports a Mongoose model', () => {
      expect(User).toBeDefined();
      expect(User.modelName).toBe('User');
    });

    it('has required username field', () => {
      const paths = User.schema.paths;
      expect(paths.username).toBeDefined();
      expect(paths.username.options.required).toBe(true);
      expect(paths.username.options.unique).toBe(true);
      expect(paths.username.options.lowercase).toBe(true);
      expect(paths.username.options.trim).toBe(true);
    });

    it('has required email field', () => {
      const paths = User.schema.paths;
      expect(paths.email).toBeDefined();
      expect(paths.email.options.required).toBe(true);
      expect(paths.email.options.unique).toBe(true);
      expect(paths.email.options.lowercase).toBe(true);
    });

    it('has passwordHash with default null', () => {
      const paths = User.schema.paths;
      expect(paths.passwordHash).toBeDefined();
      expect(paths.passwordHash.options.default).toBeNull();
    });

    it('has googleId with sparse index', () => {
      const paths = User.schema.paths;
      expect(paths.googleId).toBeDefined();
      expect(paths.googleId.options.default).toBeNull();
      expect(paths.googleId.options.sparse).toBe(true);
    });

    it('has avatar with default null', () => {
      expect(User.schema.paths.avatar.options.default).toBeNull();
    });

    it('has displayName with default null', () => {
      expect(User.schema.paths.displayName.options.default).toBeNull();
    });

    it('has bio with maxlength 200', () => {
      const paths = User.schema.paths;
      expect(paths.bio.options.maxlength).toBe(200);
      expect(paths.bio.options.default).toBe('');
    });

    it('has authProvider enum with local and google', () => {
      const paths = User.schema.paths;
      expect(paths.authProvider.options.enum).toEqual(['local', 'google']);
      expect(paths.authProvider.options.default).toBe('local');
    });

    it('has onlineStatus enum', () => {
      const paths = User.schema.paths;
      expect(paths.onlineStatus.options.enum).toEqual(['online', 'away', 'offline']);
      expect(paths.onlineStatus.options.default).toBe('offline');
    });

    it('has lastSeen with default Date.now', () => {
      expect(User.schema.paths.lastSeen.options.default).toBeDefined();
    });

    it('has settings with nested paths', () => {
      // Settings is a nested object, check for individual paths
      expect(User.schema.paths['settings.theme.mode'] || User.schema.paths.settings).toBeDefined();
    });

    it('has blockedUsers array', () => {
      expect(User.schema.paths.blockedUsers).toBeDefined();
    });

    it('has isAdmin with default false', () => {
      expect(User.schema.paths.isAdmin.options.default).toBe(false);
    });

    it('has resetPasswordToken and resetPasswordExpires', () => {
      expect(User.schema.paths.resetPasswordToken.options.default).toBeNull();
      expect(User.schema.paths.resetPasswordExpires.options.default).toBeNull();
    });

    it('has timestamps enabled', () => {
      expect(User.schema.options.timestamps).toBe(true);
    });
  });

  describe('username validation', () => {
    it('has minlength of 3', () => {
      expect(User.schema.paths.username.options.minlength).toBe(3);
    });

    it('has maxlength of 30', () => {
      expect(User.schema.paths.username.options.maxlength).toBe(30);
    });
  });

  describe('comparePassword method', () => {
    it('returns false when no passwordHash', async () => {
      const user = new User({ username: 'test', email: 'test@test.com' });
      user.passwordHash = null;
      const result = await user.comparePassword('anything');
      expect(result).toBe(false);
    });

    it('delegates to bcrypt.compare', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const user = new User({ username: 'test', email: 'test@test.com' });
      user.passwordHash = 'hashed';
      const result = await user.comparePassword('password');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed');
      expect(result).toBe(true);
    });

    it('returns false for wrong password', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const user = new User({ username: 'test', email: 'test@test.com' });
      user.passwordHash = 'hashed';
      const result = await user.comparePassword('wrong');
      expect(result).toBe(false);
    });
  });

  describe('toSafeObject method', () => {
    it('excludes sensitive fields', () => {
      const user = new User({
        username: 'testuser',
        email: 'test@test.com',
        passwordHash: 'secret_hash',
        resetPasswordToken: 'secret_token',
        googleId: 'google123',
        isAdmin: false,
      });
      user._id = new mongoose.Types.ObjectId();
      user.createdAt = new Date();

      const safe = user.toSafeObject();

      expect(safe.username).toBe('testuser');
      expect(safe.email).toBe('test@test.com');
      expect(safe.passwordHash).toBeUndefined();
      expect(safe.resetPasswordToken).toBeUndefined();
      expect(safe.googleId).toBeUndefined();
    });

    it('returns id as string', () => {
      const user = new User({ username: 'test', email: 't@t.com' });
      user._id = new mongoose.Types.ObjectId();
      user.createdAt = new Date();

      const safe = user.toSafeObject();
      expect(typeof safe.id).toBe('string');
      expect(safe.id).toBe(user._id.toString());
    });

    it('uses username as fallback for displayName', () => {
      const user = new User({ username: 'testuser', email: 't@t.com' });
      user._id = new mongoose.Types.ObjectId();
      user.createdAt = new Date();

      const safe = user.toSafeObject();
      expect(safe.displayName).toBe('testuser');
    });

    it('uses provided displayName when set', () => {
      const user = new User({ username: 'testuser', email: 't@t.com', displayName: 'Test User' });
      user._id = new mongoose.Types.ObjectId();
      user.createdAt = new Date();

      const safe = user.toSafeObject();
      expect(safe.displayName).toBe('Test User');
    });

    it('returns empty string for missing bio', () => {
      const user = new User({ username: 'test', email: 't@t.com' });
      user._id = new mongoose.Types.ObjectId();
      user.createdAt = new Date();

      const safe = user.toSafeObject();
      expect(safe.bio).toBe('');
    });

    it('formats lastSeen as ISO string', () => {
      const now = new Date();
      const user = new User({ username: 'test', email: 't@t.com' });
      user._id = new mongoose.Types.ObjectId();
      user.createdAt = new Date();
      user.lastSeen = now;

      const safe = user.toSafeObject();
      expect(safe.lastSeen).toBe(now.toISOString());
    });

    it('defaults isAdmin to false', () => {
      const user = new User({ username: 'test', email: 't@t.com' });
      user._id = new mongoose.Types.ObjectId();
      user.createdAt = new Date();

      const safe = user.toSafeObject();
      expect(safe.isAdmin).toBe(false);
    });
  });

  describe('settings defaults', () => {
    it('has settings-related paths in schema', () => {
      // Settings is defined as a nested object in the schema
      const paths = Object.keys(User.schema.paths);
      const hasSettingsPaths = paths.some(p => p.startsWith('settings.'));
      expect(hasSettingsPaths).toBe(true);
    });

    it('creates user with default settings structure', () => {
      const user = new User({ username: 'test', email: 't@t.com' });
      // Settings defaults are applied by Mongoose
      expect(user.settings).toBeDefined();
    });
  });
});
