/**
 * Message Model Tests
 * Tests schema structure, defaults, validation, and indexes.
 */

const mongoose = require('mongoose');

let Message;

beforeEach(() => {
  delete mongoose.models.Message;
  if (mongoose.modelSchemas) delete mongoose.modelSchemas.Message;
  Message = require('../models/Message');
});

describe('Message Model', () => {
  describe('schema structure', () => {
    it('exports a Mongoose model', () => {
      expect(Message).toBeDefined();
      expect(Message.modelName).toBe('Message');
    });

    it('has required roomId field', () => {
      const paths = Message.schema.paths;
      expect(paths.roomId).toBeDefined();
      expect(paths.roomId.options.required).toBe(true);
    });

    it('has required userId field', () => {
      const paths = Message.schema.paths;
      expect(paths.userId).toBeDefined();
      expect(paths.userId.options.required).toBe(true);
    });

    it('has required username field', () => {
      const paths = Message.schema.paths;
      expect(paths.username).toBeDefined();
      expect(paths.username.options.required).toBe(true);
    });

    it('has required content field', () => {
      const paths = Message.schema.paths;
      expect(paths.content).toBeDefined();
      expect(paths.content.options.required).toBe(true);
    });

    it('has isAI with default false', () => {
      expect(Message.schema.paths.isAI.options.default).toBe(false);
    });

    it('has triggeredBy with default null', () => {
      expect(Message.schema.paths.triggeredBy.options.default).toBeNull();
    });

    it('has replyTo subdocument with defaults', () => {
      const paths = Message.schema.paths;
      expect(paths['replyTo.id']).toBeDefined();
      expect(paths['replyTo.id'].options.default).toBeNull();
      expect(paths['replyTo.username']).toBeDefined();
      expect(paths['replyTo.username'].options.default).toBeNull();
      expect(paths['replyTo.content']).toBeDefined();
      expect(paths['replyTo.content'].options.default).toBeNull();
    });

    it('has reactions as Map of String arrays', () => {
      expect(Message.schema.paths.reactions).toBeDefined();
    });

    it('has status enum with sent, delivered, read', () => {
      const paths = Message.schema.paths;
      expect(paths.status.options.enum).toEqual(['sent', 'delivered', 'read']);
      expect(paths.status.options.default).toBe('sent');
    });

    it('has readBy array', () => {
      expect(Message.schema.paths.readBy).toBeDefined();
    });

    it('has pin fields with defaults', () => {
      expect(Message.schema.paths.isPinned.options.default).toBe(false);
      expect(Message.schema.paths.pinnedBy.options.default).toBeNull();
      expect(Message.schema.paths.pinnedAt.options.default).toBeNull();
    });

    it('has edit fields with defaults', () => {
      expect(Message.schema.paths.isEdited.options.default).toBe(false);
      expect(Message.schema.paths.editedAt.options.default).toBeNull();
      expect(Message.schema.paths.originalContent.options.default).toBeNull();
    });

    it('has editHistory array', () => {
      expect(Message.schema.paths.editHistory).toBeDefined();
    });

    it('has delete fields with defaults', () => {
      expect(Message.schema.paths.isDeleted.options.default).toBe(false);
      expect(Message.schema.paths.deletedAt.options.default).toBeNull();
      expect(Message.schema.paths.deletedBy.options.default).toBeNull();
    });

    it('has file attachment fields', () => {
      expect(Message.schema.paths.fileUrl.options.default).toBeNull();
      expect(Message.schema.paths.fileName.options.default).toBeNull();
      expect(Message.schema.paths.fileType.options.default).toBeNull();
      expect(Message.schema.paths.fileSize.options.default).toBeNull();
    });

    it('has memoryRefs array', () => {
      expect(Message.schema.paths.memoryRefs).toBeDefined();
    });

    it('has modelId and provider fields', () => {
      expect(Message.schema.paths.modelId.options.default).toBeNull();
      expect(Message.schema.paths.provider.options.default).toBeNull();
    });

    it('has timestamps enabled', () => {
      expect(Message.schema.options.timestamps).toBe(true);
    });
  });

  describe('indexes', () => {
    it('has compound index on roomId and createdAt', () => {
      const indexes = Message.schema.indexes();
      const hasIndex = indexes.some(([fields]) =>
        fields.roomId === 1 && fields.createdAt === -1
      );
      expect(hasIndex).toBe(true);
    });

    it('has text index on content and username', () => {
      const indexes = Message.schema.indexes();
      const hasTextIndex = indexes.some(([fields]) =>
        fields.content === 'text' && fields.username === 'text'
      );
      expect(hasTextIndex).toBe(true);
    });

    it('has compound index on roomId and isPinned', () => {
      const indexes = Message.schema.indexes();
      const hasIndex = indexes.some(([fields]) =>
        fields.roomId === 1 && fields.isPinned === 1
      );
      expect(hasIndex).toBe(true);
    });
  });

  describe('memoryRefs subdocument', () => {
    it('has required id field in memoryRefs', () => {
      const memRefSchema = Message.schema.paths.memoryRefs.schema;
      expect(memRefSchema.paths.id).toBeDefined();
      expect(memRefSchema.paths.id.options.required).toBe(true);
    });

    it('has required summary field in memoryRefs', () => {
      const memRefSchema = Message.schema.paths.memoryRefs.schema;
      expect(memRefSchema.paths.summary).toBeDefined();
      expect(memRefSchema.paths.summary.options.required).toBe(true);
    });

    it('has score field with default null in memoryRefs', () => {
      const memRefSchema = Message.schema.paths.memoryRefs.schema;
      expect(memRefSchema.paths.score).toBeDefined();
      expect(memRefSchema.paths.score.options.default).toBeNull();
    });
  });
});
