/**
 * Conversation Model Tests
 * Tests schema structure, defaults, and indexes.
 */

const mongoose = require('mongoose');

let Conversation;

beforeEach(() => {
  delete mongoose.models.Conversation;
  if (mongoose.modelSchemas) delete mongoose.modelSchemas.Conversation;
  Conversation = require('../models/Conversation');
});

describe('Conversation Model', () => {
  describe('schema structure', () => {
    it('exports a Mongoose model', () => {
      expect(Conversation).toBeDefined();
      expect(Conversation.modelName).toBe('Conversation');
    });

    it('has required userId field with index', () => {
      const paths = Conversation.schema.paths;
      expect(paths.userId).toBeDefined();
      expect(paths.userId.options.required).toBe(true);
    });

    it('has required title field with maxlength 100', () => {
      const paths = Conversation.schema.paths;
      expect(paths.title).toBeDefined();
      expect(paths.title.options.required).toBe(true);
      expect(paths.title.options.maxlength).toBe(100);
      expect(paths.title.options.trim).toBe(true);
    });

    it('has messages array', () => {
      expect(Conversation.schema.paths.messages).toBeDefined();
    });

    it('has projectId with default null', () => {
      expect(Conversation.schema.paths.projectId.options.default).toBeNull();
    });

    it('has projectName with default null', () => {
      expect(Conversation.schema.paths.projectName.options.default).toBeNull();
    });

    it('has sourceType enum', () => {
      const paths = Conversation.schema.paths;
      expect(paths.sourceType.options.enum).toEqual(['native', 'chatgpt', 'claude', 'markdown', 'text', 'json']);
      expect(paths.sourceType.options.default).toBe('native');
    });

    it('has sourceLabel with default ChatSphere', () => {
      expect(Conversation.schema.paths.sourceLabel.options.default).toBe('ChatSphere');
    });

    it('has importFingerprint with default null', () => {
      expect(Conversation.schema.paths.importFingerprint.options.default).toBeNull();
    });

    it('has importSessionId with default null', () => {
      expect(Conversation.schema.paths.importSessionId.options.default).toBeNull();
    });

    it('has timestamps enabled', () => {
      expect(Conversation.schema.options.timestamps).toBe(true);
    });
  });

  describe('indexes', () => {
    it('has compound index on userId and updatedAt', () => {
      const indexes = Conversation.schema.indexes();
      const hasIndex = indexes.some(([fields]) =>
        fields.userId === 1 && fields.updatedAt === -1
      );
      expect(hasIndex).toBe(true);
    });

    it('has compound index on userId, projectId, and updatedAt', () => {
      const indexes = Conversation.schema.indexes();
      const hasIndex = indexes.some(([fields]) =>
        fields.userId === 1 && fields.projectId === 1 && fields.updatedAt === -1
      );
      expect(hasIndex).toBe(true);
    });
  });

  describe('conversationMessage subdocument', () => {
    it('has required role field with enum', () => {
      const msgSchema = Conversation.schema.paths.messages.schema;
      expect(msgSchema.paths.role).toBeDefined();
      expect(msgSchema.paths.role.options.required).toBe(true);
      expect(msgSchema.paths.role.options.enum).toEqual(['user', 'assistant']);
    });

    it('has required content field', () => {
      const msgSchema = Conversation.schema.paths.messages.schema;
      expect(msgSchema.paths.content).toBeDefined();
      expect(msgSchema.paths.content.options.required).toBe(true);
    });

    it('has timestamp with default Date.now', () => {
      const msgSchema = Conversation.schema.paths.messages.schema;
      expect(msgSchema.paths.timestamp.options.default).toBeDefined();
    });

    it('has memoryRefs array', () => {
      const msgSchema = Conversation.schema.paths.messages.schema;
      expect(msgSchema.paths.memoryRefs).toBeDefined();
    });

    it('has file attachment fields', () => {
      const msgSchema = Conversation.schema.paths.messages.schema;
      expect(msgSchema.paths.fileUrl.options.default).toBeNull();
      expect(msgSchema.paths.fileName.options.default).toBeNull();
      expect(msgSchema.paths.fileType.options.default).toBeNull();
      expect(msgSchema.paths.fileSize.options.default).toBeNull();
    });

    it('has AI metadata fields', () => {
      const msgSchema = Conversation.schema.paths.messages.schema;
      expect(msgSchema.paths.modelId.options.default).toBeNull();
      expect(msgSchema.paths.provider.options.default).toBeNull();
      expect(msgSchema.paths.requestedModelId.options.default).toBeNull();
      expect(msgSchema.paths.processingMs.options.default).toBeNull();
      expect(msgSchema.paths.promptTokens.options.default).toBeNull();
      expect(msgSchema.paths.completionTokens.options.default).toBeNull();
      expect(msgSchema.paths.totalTokens.options.default).toBeNull();
    });

    it('has autoMode and related fields', () => {
      const msgSchema = Conversation.schema.paths.messages.schema;
      expect(msgSchema.paths.autoMode.options.default).toBe(false);
      expect(msgSchema.paths.autoComplexity.options.default).toBeNull();
      expect(msgSchema.paths.fallbackUsed.options.default).toBe(false);
    });
  });
});
