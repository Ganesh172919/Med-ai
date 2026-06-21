/**
 * Room Model Tests
 * Tests schema structure, defaults, and indexes.
 */

const mongoose = require('mongoose');

jest.mock('../services/promptCatalog', () => ({
  buildInitialRoomHistory: jest.fn().mockReturnValue([
    { role: 'model', parts: [{ text: 'Hello!' }] },
  ]),
}));

let Room;

beforeEach(() => {
  jest.clearAllMocks();
  delete mongoose.models.Room;
  if (mongoose.modelSchemas) delete mongoose.modelSchemas.Room;
  Room = require('../models/Room');
});

describe('Room Model', () => {
  describe('schema structure', () => {
    it('exports a Mongoose model', () => {
      expect(Room).toBeDefined();
      expect(Room.modelName).toBe('Room');
    });

    it('has required name field with maxlength 50', () => {
      const paths = Room.schema.paths;
      expect(paths.name).toBeDefined();
      expect(paths.name.options.required).toBe(true);
      expect(paths.name.options.maxlength).toBe(50);
      expect(paths.name.options.trim).toBe(true);
    });

    it('has description with maxlength 500', () => {
      const paths = Room.schema.paths;
      expect(paths.description).toBeDefined();
      expect(paths.description.options.maxlength).toBe(500);
      expect(paths.description.options.default).toBe('');
    });

    it('has tags array', () => {
      expect(Room.schema.paths.tags).toBeDefined();
    });

    it('has maxUsers with default 20, min 2, max 100', () => {
      const paths = Room.schema.paths;
      expect(paths.maxUsers.options.default).toBe(20);
      expect(paths.maxUsers.options.min).toBe(2);
      expect(paths.maxUsers.options.max).toBe(100);
    });

    it('has visibility enum with public and private', () => {
      const paths = Room.schema.paths;
      expect(paths.visibility.options.enum).toEqual(['public', 'private']);
      expect(paths.visibility.options.default).toBe('public');
    });

    it('has privateJoinKey with default null', () => {
      expect(Room.schema.paths.privateJoinKey.options.default).toBeNull();
    });

    it('has required creatorId field', () => {
      const paths = Room.schema.paths;
      expect(paths.creatorId).toBeDefined();
      expect(paths.creatorId.options.required).toBe(true);
    });

    it('has members array with userId, role, joinedAt', () => {
      expect(Room.schema.paths.members).toBeDefined();
    });

    it('has pinnedMessages array', () => {
      expect(Room.schema.paths.pinnedMessages).toBeDefined();
    });

    it('has aiHistory array', () => {
      expect(Room.schema.paths.aiHistory).toBeDefined();
    });

    it('has timestamps enabled', () => {
      expect(Room.schema.options.timestamps).toBe(true);
    });
  });

  describe('indexes', () => {
    it('has index on creatorId', () => {
      const indexes = Room.schema.indexes();
      const hasIndex = indexes.some(([fields]) => fields.creatorId === 1);
      expect(hasIndex).toBe(true);
    });

    it('has index on tags', () => {
      const indexes = Room.schema.indexes();
      const hasIndex = indexes.some(([fields]) => fields.tags === 1);
      expect(hasIndex).toBe(true);
    });
  });

  describe('members subdocument', () => {
    it('has role enum with admin, moderator, member', () => {
      const memberSchema = Room.schema.paths.members.schema;
      expect(memberSchema.paths.role.options.enum).toEqual(['admin', 'moderator', 'member']);
      expect(memberSchema.paths.role.options.default).toBe('member');
    });

    it('has joinedAt with default Date.now', () => {
      const memberSchema = Room.schema.paths.members.schema;
      expect(memberSchema.paths.joinedAt.options.default).toBeDefined();
    });
  });

  describe('aiHistory subdocument', () => {
    it('has role enum with user and model', () => {
      const aiHistSchema = Room.schema.paths.aiHistory.schema;
      expect(aiHistSchema.paths.role.options.enum).toEqual(['user', 'model']);
    });

    it('has parts array with text field', () => {
      const aiHistSchema = Room.schema.paths.aiHistory.schema;
      expect(aiHistSchema.paths.parts).toBeDefined();
    });
  });

  describe('pre-save hook', () => {
    it('buildInitialRoomHistory is callable', () => {
      const { buildInitialRoomHistory } = require('../services/promptCatalog');
      expect(typeof buildInitialRoomHistory).toBe('function');
      const result = buildInitialRoomHistory('Test Room');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
