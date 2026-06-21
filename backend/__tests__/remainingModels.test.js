/**
 * Remaining Models Tests
 * Tests for ConversationInsight, ImportSession, MemoryEntry, PromptTemplate,
 * RefreshToken, Report models.
 */

const mongoose = require('mongoose');

describe('ConversationInsight Model', () => {
  let ConversationInsight;

  beforeEach(() => {
    delete mongoose.models.ConversationInsight;
    if (mongoose.modelSchemas) delete mongoose.modelSchemas.ConversationInsight;
    ConversationInsight = require('../models/ConversationInsight');
  });

  it('exports a Mongoose model', () => {
    expect(ConversationInsight).toBeDefined();
    expect(ConversationInsight.modelName).toBe('ConversationInsight');
  });

  it('has required scopeKey with unique index', () => {
    const paths = ConversationInsight.schema.paths;
    expect(paths.scopeKey).toBeDefined();
    expect(paths.scopeKey.options.required).toBe(true);
    expect(paths.scopeKey.options.unique).toBe(true);
  });

  it('has required scopeType enum', () => {
    const paths = ConversationInsight.schema.paths;
    expect(paths.scopeType.options.enum).toEqual(['conversation', 'room']);
    expect(paths.scopeType.options.required).toBe(true);
  });

  it('has required scopeId', () => {
    expect(ConversationInsight.schema.paths.scopeId.options.required).toBe(true);
  });

  it('has title with maxlength 120', () => {
    expect(ConversationInsight.schema.paths.title.options.maxlength).toBe(120);
    expect(ConversationInsight.schema.paths.title.options.default).toBe('');
  });

  it('has summary with maxlength 2400', () => {
    expect(ConversationInsight.schema.paths.summary.options.maxlength).toBe(2400);
    expect(ConversationInsight.schema.paths.summary.options.default).toBe('');
  });

  it('has intent with maxlength 80', () => {
    expect(ConversationInsight.schema.paths.intent.options.maxlength).toBe(80);
    expect(ConversationInsight.schema.paths.intent.options.default).toBe('general');
  });

  it('has topics, decisions, actionItems arrays', () => {
    expect(ConversationInsight.schema.paths.topics).toBeDefined();
    expect(ConversationInsight.schema.paths.decisions).toBeDefined();
    expect(ConversationInsight.schema.paths.actionItems).toBeDefined();
  });

  it('has messageCount default 0', () => {
    expect(ConversationInsight.schema.paths.messageCount.options.default).toBe(0);
  });

  it('has promptVersion default local-default', () => {
    expect(ConversationInsight.schema.paths.promptVersion.options.default).toBe('local-default');
  });

  it('has timestamps enabled', () => {
    expect(ConversationInsight.schema.options.timestamps).toBe(true);
  });

  describe('actionItem subdocument', () => {
    it('has required text field with maxlength 240', () => {
      const aiSchema = ConversationInsight.schema.paths.actionItems.schema;
      expect(aiSchema.paths.text).toBeDefined();
      expect(aiSchema.paths.text.options.required).toBe(true);
      expect(aiSchema.paths.text.options.maxlength).toBe(240);
    });

    it('has owner with default null', () => {
      const aiSchema = ConversationInsight.schema.paths.actionItems.schema;
      expect(aiSchema.paths.owner.options.default).toBeNull();
    });

    it('has done with default false', () => {
      const aiSchema = ConversationInsight.schema.paths.actionItems.schema;
      expect(aiSchema.paths.done.options.default).toBe(false);
    });
  });
});

describe('ImportSession Model', () => {
  let ImportSession;

  beforeEach(() => {
    delete mongoose.models.ImportSession;
    if (mongoose.modelSchemas) delete mongoose.modelSchemas.ImportSession;
    ImportSession = require('../models/ImportSession');
  });

  it('exports a Mongoose model', () => {
    expect(ImportSession).toBeDefined();
    expect(ImportSession.modelName).toBe('ImportSession');
  });

  it('has required userId field', () => {
    expect(ImportSession.schema.paths.userId.options.required).toBe(true);
  });

  it('has required sourceType enum', () => {
    const paths = ImportSession.schema.paths;
    expect(paths.sourceType.options.enum).toEqual(['chatgpt', 'claude', 'markdown', 'text', 'json']);
    expect(paths.sourceType.options.required).toBe(true);
  });

  it('has sourceName default', () => {
    expect(ImportSession.schema.paths.sourceName.options.default).toBe('Imported history');
  });

  it('has required fingerprint', () => {
    expect(ImportSession.schema.paths.fingerprint.options.required).toBe(true);
  });

  it('has status enum with previewed and imported', () => {
    const paths = ImportSession.schema.paths;
    expect(paths.status.options.enum).toEqual(['previewed', 'imported']);
    expect(paths.status.options.default).toBe('previewed');
  });

  it('has preview nested object', () => {
    // Preview is a nested object, check for nested paths
    const paths = Object.keys(ImportSession.schema.paths);
    const hasPreviewPaths = paths.some(p => p.startsWith('preview.'));
    expect(hasPreviewPaths).toBe(true);
  });

  it('has importedConversationIds and importedMemoryIds arrays', () => {
    expect(ImportSession.schema.paths.importedConversationIds).toBeDefined();
    expect(ImportSession.schema.paths.importedMemoryIds).toBeDefined();
  });

  it('has timestamps enabled', () => {
    expect(ImportSession.schema.options.timestamps).toBe(true);
  });

  it('has unique compound index on userId and fingerprint', () => {
    const indexes = ImportSession.schema.indexes();
    const hasIndex = indexes.some(([fields, options]) =>
      fields.userId === 1 && fields.fingerprint === 1 && options.unique === true
    );
    expect(hasIndex).toBe(true);
  });
});

describe('MemoryEntry Model', () => {
  let MemoryEntry;

  beforeEach(() => {
    delete mongoose.models.MemoryEntry;
    if (mongoose.modelSchemas) delete mongoose.modelSchemas.MemoryEntry;
    MemoryEntry = require('../models/MemoryEntry');
  });

  it('exports a Mongoose model', () => {
    expect(MemoryEntry).toBeDefined();
    expect(MemoryEntry.modelName).toBe('MemoryEntry');
  });

  it('has required userId field', () => {
    expect(MemoryEntry.schema.paths.userId.options.required).toBe(true);
  });

  it('has required summary field with maxlength 280', () => {
    const paths = MemoryEntry.schema.paths;
    expect(paths.summary.options.required).toBe(true);
    expect(paths.summary.options.maxlength).toBe(280);
    expect(paths.summary.options.trim).toBe(true);
  });

  it('has details with maxlength 1200', () => {
    expect(MemoryEntry.schema.paths.details.options.maxlength).toBe(1200);
    expect(MemoryEntry.schema.paths.details.options.default).toBe('');
  });

  it('has required fingerprint', () => {
    expect(MemoryEntry.schema.paths.fingerprint.options.required).toBe(true);
  });

  it('has required sourceType enum', () => {
    const paths = MemoryEntry.schema.paths;
    expect(paths.sourceType.options.enum).toEqual(['conversation', 'room', 'import', 'manual']);
    expect(paths.sourceType.options.required).toBe(true);
  });

  it('has score fields with defaults', () => {
    const paths = MemoryEntry.schema.paths;
    expect(paths.confidenceScore.options.default).toBe(0.6);
    expect(paths.importanceScore.options.default).toBe(0.5);
    expect(paths.recencyScore.options.default).toBe(1);
  });

  it('has confidenceScore with min/max', () => {
    const paths = MemoryEntry.schema.paths;
    expect(paths.confidenceScore.options.min).toBe(0);
    expect(paths.confidenceScore.options.max).toBe(1);
  });

  it('has pinned with default false', () => {
    expect(MemoryEntry.schema.paths.pinned.options.default).toBe(false);
  });

  it('has usageCount default 0', () => {
    expect(MemoryEntry.schema.paths.usageCount.options.default).toBe(0);
  });

  it('has lastUsedAt default null', () => {
    expect(MemoryEntry.schema.paths.lastUsedAt.options.default).toBeNull();
  });

  it('has timestamps enabled', () => {
    expect(MemoryEntry.schema.options.timestamps).toBe(true);
  });

  it('has unique compound index on userId and fingerprint', () => {
    const indexes = MemoryEntry.schema.indexes();
    const hasIndex = indexes.some(([fields, options]) =>
      fields.userId === 1 && fields.fingerprint === 1 && options.unique === true
    );
    expect(hasIndex).toBe(true);
  });

  it('has compound index on userId and updatedAt', () => {
    const indexes = MemoryEntry.schema.indexes();
    const hasIndex = indexes.some(([fields]) =>
      fields.userId === 1 && fields.updatedAt === -1
    );
    expect(hasIndex).toBe(true);
  });

  it('has compound index on userId, pinned, and updatedAt', () => {
    const indexes = MemoryEntry.schema.indexes();
    const hasIndex = indexes.some(([fields]) =>
      fields.userId === 1 && fields.pinned === 1 && fields.updatedAt === -1
    );
    expect(hasIndex).toBe(true);
  });
});

describe('PromptTemplate Model', () => {
  let PromptTemplate;

  beforeEach(() => {
    delete mongoose.models.PromptTemplate;
    if (mongoose.modelSchemas) delete mongoose.modelSchemas.PromptTemplate;
    PromptTemplate = require('../models/PromptTemplate');
  });

  it('exports a Mongoose model', () => {
    expect(PromptTemplate).toBeDefined();
    expect(PromptTemplate.modelName).toBe('PromptTemplate');
  });

  it('has required key field with unique index', () => {
    const paths = PromptTemplate.schema.paths;
    expect(paths.key.options.required).toBe(true);
    expect(paths.key.options.unique).toBe(true);
  });

  it('has required version field with default v1', () => {
    const paths = PromptTemplate.schema.paths;
    expect(paths.version.options.required).toBe(true);
    expect(paths.version.options.default).toBe('v1');
  });

  it('has description with default empty string', () => {
    expect(PromptTemplate.schema.paths.description.options.default).toBe('');
  });

  it('has required content field', () => {
    expect(PromptTemplate.schema.paths.content.options.required).toBe(true);
  });

  it('has isActive with default true', () => {
    expect(PromptTemplate.schema.paths.isActive.options.default).toBe(true);
  });

  it('has timestamps enabled', () => {
    expect(PromptTemplate.schema.options.timestamps).toBe(true);
  });
});

describe('RefreshToken Model', () => {
  let RefreshToken;

  beforeEach(() => {
    delete mongoose.models.RefreshToken;
    if (mongoose.modelSchemas) delete mongoose.modelSchemas.RefreshToken;
    RefreshToken = require('../models/RefreshToken');
  });

  it('exports a Mongoose model', () => {
    expect(RefreshToken).toBeDefined();
    expect(RefreshToken.modelName).toBe('RefreshToken');
  });

  it('has required userId field', () => {
    expect(RefreshToken.schema.paths.userId.options.required).toBe(true);
  });

  it('has required token field with unique index', () => {
    const paths = RefreshToken.schema.paths;
    expect(paths.token.options.required).toBe(true);
    expect(paths.token.options.unique).toBe(true);
  });

  it('has required expiresAt field', () => {
    expect(RefreshToken.schema.paths.expiresAt.options.required).toBe(true);
  });

  it('has timestamps enabled', () => {
    expect(RefreshToken.schema.options.timestamps).toBe(true);
  });

  it('has TTL index on expiresAt', () => {
    const indexes = RefreshToken.schema.indexes();
    const hasTTLIndex = indexes.some(([fields, options]) =>
      fields.expiresAt === 1 && options.expireAfterSeconds === 0
    );
    expect(hasTTLIndex).toBe(true);
  });
});

describe('Report Model', () => {
  let Report;

  beforeEach(() => {
    delete mongoose.models.Report;
    if (mongoose.modelSchemas) delete mongoose.modelSchemas.Report;
    Report = require('../models/Report');
  });

  it('exports a Mongoose model', () => {
    expect(Report).toBeDefined();
    expect(Report.modelName).toBe('Report');
  });

  it('has required reporterId field', () => {
    expect(Report.schema.paths.reporterId.options.required).toBe(true);
  });

  it('has required targetType enum', () => {
    const paths = Report.schema.paths;
    expect(paths.targetType.options.required).toBe(true);
    expect(paths.targetType.options.enum).toEqual(['user', 'message']);
  });

  it('has required targetId field', () => {
    expect(Report.schema.paths.targetId.options.required).toBe(true);
  });

  it('has roomId with default null', () => {
    expect(Report.schema.paths.roomId.options.default).toBeNull();
  });

  it('has required reason enum', () => {
    const paths = Report.schema.paths;
    expect(paths.reason.options.required).toBe(true);
    expect(paths.reason.options.enum).toEqual(['spam', 'harassment', 'hate_speech', 'inappropriate_content', 'impersonation', 'other']);
  });

  it('has description with maxlength 1000', () => {
    expect(Report.schema.paths.description.options.maxlength).toBe(1000);
    expect(Report.schema.paths.description.options.default).toBe('');
  });

  it('has status enum with default pending', () => {
    const paths = Report.schema.paths;
    expect(paths.status.options.enum).toEqual(['pending', 'reviewed', 'action_taken', 'dismissed']);
    expect(paths.status.options.default).toBe('pending');
  });

  it('has reviewedBy with default null', () => {
    expect(Report.schema.paths.reviewedBy.options.default).toBeNull();
  });

  it('has reviewNote with default empty string', () => {
    expect(Report.schema.paths.reviewNote.options.default).toBe('');
  });

  it('has reviewedAt with default null', () => {
    expect(Report.schema.paths.reviewedAt.options.default).toBeNull();
  });

  it('has timestamps enabled', () => {
    expect(Report.schema.options.timestamps).toBe(true);
  });

  it('has indexes on reporterId, status, targetType+targetId, reason', () => {
    const indexes = Report.schema.indexes();
    expect(indexes.length).toBeGreaterThanOrEqual(4);
  });
});
