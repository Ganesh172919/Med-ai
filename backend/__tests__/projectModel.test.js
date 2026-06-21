/**
 * Project Model Tests
 * Tests schema structure, defaults, and indexes.
 */

const mongoose = require('mongoose');

let Project;

beforeEach(() => {
  delete mongoose.models.Project;
  if (mongoose.modelSchemas) delete mongoose.modelSchemas.Project;
  Project = require('../models/Project');
});

describe('Project Model', () => {
  describe('schema structure', () => {
    it('exports a Mongoose model', () => {
      expect(Project).toBeDefined();
      expect(Project.modelName).toBe('Project');
    });

    it('has required userId field', () => {
      const paths = Project.schema.paths;
      expect(paths.userId).toBeDefined();
      expect(paths.userId.options.required).toBe(true);
    });

    it('has required name field with maxlength 80', () => {
      const paths = Project.schema.paths;
      expect(paths.name).toBeDefined();
      expect(paths.name.options.required).toBe(true);
      expect(paths.name.options.maxlength).toBe(80);
      expect(paths.name.options.trim).toBe(true);
    });

    it('has description with maxlength 280', () => {
      const paths = Project.schema.paths;
      expect(paths.description).toBeDefined();
      expect(paths.description.options.maxlength).toBe(280);
      expect(paths.description.options.default).toBe('');
    });

    it('has instructions with maxlength 5000', () => {
      const paths = Project.schema.paths;
      expect(paths.instructions).toBeDefined();
      expect(paths.instructions.options.maxlength).toBe(5000);
      expect(paths.instructions.options.default).toBe('');
    });

    it('has context with maxlength 8000', () => {
      const paths = Project.schema.paths;
      expect(paths.context).toBeDefined();
      expect(paths.context.options.maxlength).toBe(8000);
      expect(paths.context.options.default).toBe('');
    });

    it('has tags array', () => {
      expect(Project.schema.paths.tags).toBeDefined();
    });

    it('has suggestedPrompts array', () => {
      expect(Project.schema.paths.suggestedPrompts).toBeDefined();
    });

    it('has files array', () => {
      expect(Project.schema.paths.files).toBeDefined();
    });

    it('has timestamps enabled', () => {
      expect(Project.schema.options.timestamps).toBe(true);
    });
  });

  describe('indexes', () => {
    it('has compound index on userId and updatedAt', () => {
      const indexes = Project.schema.indexes();
      const hasIndex = indexes.some(([fields]) =>
        fields.userId === 1 && fields.updatedAt === -1
      );
      expect(hasIndex).toBe(true);
    });
  });

  describe('files subdocument', () => {
    it('has required fileUrl field', () => {
      const fileSchema = Project.schema.paths.files.schema;
      expect(fileSchema.paths.fileUrl).toBeDefined();
      expect(fileSchema.paths.fileUrl.options.required).toBe(true);
    });

    it('has required fileName field', () => {
      const fileSchema = Project.schema.paths.files.schema;
      expect(fileSchema.paths.fileName).toBeDefined();
      expect(fileSchema.paths.fileName.options.required).toBe(true);
      expect(fileSchema.paths.fileName.options.trim).toBe(true);
    });

    it('has required fileType field', () => {
      const fileSchema = Project.schema.paths.files.schema;
      expect(fileSchema.paths.fileType).toBeDefined();
      expect(fileSchema.paths.fileType.options.required).toBe(true);
    });

    it('has required fileSize field', () => {
      const fileSchema = Project.schema.paths.files.schema;
      expect(fileSchema.paths.fileSize).toBeDefined();
      expect(fileSchema.paths.fileSize.options.required).toBe(true);
    });

    it('has note with maxlength 240', () => {
      const fileSchema = Project.schema.paths.files.schema;
      expect(fileSchema.paths.note).toBeDefined();
      expect(fileSchema.paths.note.options.maxlength).toBe(240);
      expect(fileSchema.paths.note.options.default).toBe('');
    });

    it('has addedAt with default Date.now', () => {
      const fileSchema = Project.schema.paths.files.schema;
      expect(fileSchema.paths.addedAt.options.default).toBeDefined();
    });
  });

  describe('tags subdocument', () => {
    it('is an array field', () => {
      const tagsPath = Project.schema.paths.tags;
      expect(tagsPath).toBeDefined();
      expect(tagsPath.instance).toBe('Array');
    });
  });

  describe('suggestedPrompts subdocument', () => {
    it('is an array field', () => {
      const promptsPath = Project.schema.paths.suggestedPrompts;
      expect(promptsPath).toBeDefined();
      expect(promptsPath.instance).toBe('Array');
    });
  });
});
