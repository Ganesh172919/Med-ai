/**
 * Poll Model Tests
 * Tests schema structure, defaults, virtuals, and instance methods.
 */

const mongoose = require('mongoose');

// Mock promptCatalog to avoid side effects in Room model
jest.mock('../services/promptCatalog', () => ({
  buildInitialRoomHistory: jest.fn().mockReturnValue([]),
}));

let Poll;

beforeEach(() => {
  jest.clearAllMocks();
  delete mongoose.models.Poll;
  if (mongoose.modelSchemas) delete mongoose.modelSchemas.Poll;
  Poll = require('../models/Poll');
});

describe('Poll Model', () => {
  describe('schema structure', () => {
    it('exports a Mongoose model', () => {
      expect(Poll).toBeDefined();
      expect(Poll.modelName).toBe('Poll');
    });

    it('has required roomId field', () => {
      const paths = Poll.schema.paths;
      expect(paths.roomId).toBeDefined();
      expect(paths.roomId.options.required).toBe(true);
    });

    it('has required creatorId field', () => {
      const paths = Poll.schema.paths;
      expect(paths.creatorId).toBeDefined();
      expect(paths.creatorId.options.required).toBe(true);
    });

    it('has required creatorUsername field', () => {
      const paths = Poll.schema.paths;
      expect(paths.creatorUsername).toBeDefined();
      expect(paths.creatorUsername.options.required).toBe(true);
    });

    it('has required question field with maxlength 500', () => {
      const paths = Poll.schema.paths;
      expect(paths.question).toBeDefined();
      expect(paths.question.options.required).toBe(true);
      expect(paths.question.options.maxlength).toBe(500);
      expect(paths.question.options.trim).toBe(true);
    });

    it('has options array with text and votes', () => {
      expect(Poll.schema.paths.options).toBeDefined();
    });

    it('has allowMultipleVotes with default false', () => {
      expect(Poll.schema.paths.allowMultipleVotes.options.default).toBe(false);
    });

    it('has isAnonymous with default false', () => {
      expect(Poll.schema.paths.isAnonymous.options.default).toBe(false);
    });

    it('has expiresAt with default null', () => {
      expect(Poll.schema.paths.expiresAt.options.default).toBeNull();
    });

    it('has isClosed with default false', () => {
      expect(Poll.schema.paths.isClosed.options.default).toBe(false);
    });

    it('has timestamps enabled', () => {
      expect(Poll.schema.options.timestamps).toBe(true);
    });
  });

  describe('indexes', () => {
    it('has compound index on roomId and createdAt', () => {
      const indexes = Poll.schema.indexes();
      const hasIndex = indexes.some(([fields]) =>
        fields.roomId === 1 && fields.createdAt === -1
      );
      expect(hasIndex).toBe(true);
    });
  });

  describe('options subdocument', () => {
    it('has required text field in options', () => {
      const optSchema = Poll.schema.paths.options.schema;
      expect(optSchema.paths.text).toBeDefined();
      expect(optSchema.paths.text.options.required).toBe(true);
      expect(optSchema.paths.text.options.maxlength).toBe(200);
      expect(optSchema.paths.text.options.trim).toBe(true);
    });

    it('has votes array in options', () => {
      const optSchema = Poll.schema.paths.options.schema;
      expect(optSchema.paths.votes).toBeDefined();
    });
  });

  describe('totalVotes virtual', () => {
    it('calculates total votes across all options', () => {
      const poll = new Poll({
        roomId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        creatorUsername: 'alice',
        question: 'Test?',
        options: [
          { text: 'A', votes: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()] },
          { text: 'B', votes: [new mongoose.Types.ObjectId()] },
        ],
      });
      // Virtual needs to be accessed via toJSON or toObject
      const json = poll.toJSON({ virtuals: true });
      expect(json.totalVotes).toBe(3);
    });

    it('returns 0 for poll with no votes', () => {
      const poll = new Poll({
        roomId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        creatorUsername: 'alice',
        question: 'Test?',
        options: [
          { text: 'A', votes: [] },
          { text: 'B', votes: [] },
        ],
      });
      const json = poll.toJSON({ virtuals: true });
      expect(json.totalVotes).toBe(0);
    });
  });

  describe('hasUserVoted method', () => {
    it('returns true when user has voted', () => {
      const userId = new mongoose.Types.ObjectId();
      const poll = new Poll({
        roomId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        creatorUsername: 'alice',
        question: 'Test?',
        options: [
          { text: 'A', votes: [userId] },
          { text: 'B', votes: [] },
        ],
      });
      expect(poll.hasUserVoted(userId)).toBe(true);
    });

    it('returns false when user has not voted', () => {
      const userId = new mongoose.Types.ObjectId();
      const poll = new Poll({
        roomId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        creatorUsername: 'alice',
        question: 'Test?',
        options: [
          { text: 'A', votes: [new mongoose.Types.ObjectId()] },
          { text: 'B', votes: [] },
        ],
      });
      expect(poll.hasUserVoted(userId)).toBe(false);
    });
  });

  describe('isExpired method', () => {
    it('returns false when no expiration set', () => {
      const poll = new Poll({
        roomId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        creatorUsername: 'alice',
        question: 'Test?',
        options: [{ text: 'A', votes: [] }],
        expiresAt: null,
      });
      expect(poll.isExpired()).toBe(false);
    });

    it('returns true when past expiration', () => {
      const pastDate = new Date(Date.now() - 100000);
      const poll = new Poll({
        roomId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        creatorUsername: 'alice',
        question: 'Test?',
        options: [{ text: 'A', votes: [] }],
        expiresAt: pastDate,
      });
      expect(poll.isExpired()).toBe(true);
    });

    it('returns false when before expiration', () => {
      const futureDate = new Date(Date.now() + 100000);
      const poll = new Poll({
        roomId: new mongoose.Types.ObjectId(),
        creatorId: new mongoose.Types.ObjectId(),
        creatorUsername: 'alice',
        question: 'Test?',
        options: [{ text: 'A', votes: [] }],
        expiresAt: futureDate,
      });
      expect(poll.isExpired()).toBe(false);
    });
  });
});
