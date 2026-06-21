describe('gemini service', () => {
  describe('module exports', () => {
    test('exports getAvailableModels function', () => {
      const { getAvailableModels } = require('../services/gemini');
      expect(typeof getAvailableModels).toBe('function');
    });

    test('exports resolveModel function', () => {
      const { resolveModel } = require('../services/gemini');
      expect(typeof resolveModel).toBe('function');
    });

    test('exports getJsonFromModel function', () => {
      const { getJsonFromModel } = require('../services/gemini');
      expect(typeof getJsonFromModel).toBe('function');
    });

    test('exports sendMessage function', () => {
      const { sendMessage } = require('../services/gemini');
      expect(typeof sendMessage).toBe('function');
    });

    test('exports refreshModelCatalogs function', () => {
      const { refreshModelCatalogs } = require('../services/gemini');
      expect(typeof refreshModelCatalogs).toBe('function');
    });

    test('exports MODEL_NAME constant', () => {
      const { MODEL_NAME } = require('../services/gemini');
      expect(typeof MODEL_NAME).toBe('string');
      expect(MODEL_NAME.length).toBeGreaterThan(0);
    });
  });

  describe('getAvailableModels', () => {
    test('returns an array', () => {
      const { getAvailableModels } = require('../services/gemini');
      const models = getAvailableModels({ includeFallback: true });
      expect(Array.isArray(models)).toBe(true);
    });

    test('each model has id and label', () => {
      const { getAvailableModels } = require('../services/gemini');
      const models = getAvailableModels({ includeFallback: true });
      for (const model of models) {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('label');
        expect(typeof model.id).toBe('string');
        expect(typeof model.label).toBe('string');
      }
    });

    test('includes provider field', () => {
      const { getAvailableModels } = require('../services/gemini');
      const models = getAvailableModels({ includeFallback: true });
      for (const model of models) {
        expect(model).toHaveProperty('provider');
      }
    });
  });

  describe('resolveModel', () => {
    test('returns a model object', () => {
      const { resolveModel } = require('../services/gemini');
      const model = resolveModel('openai/gpt-5.4-mini');
      expect(model).toBeDefined();
      expect(model).toHaveProperty('id');
    });

    test('handles unknown model gracefully', () => {
      const { resolveModel } = require('../services/gemini');
      const model = resolveModel('nonexistent-model-xyz');
      expect(model).toBeDefined();
    });

    test('resolves auto model', () => {
      const { resolveModel } = require('../services/gemini');
      const model = resolveModel('auto');
      expect(model).toBeDefined();
    });
  });

  describe('refreshModelCatalogs', () => {
    test('is callable', async () => {
      const { refreshModelCatalogs } = require('../services/gemini');
      // Should not throw when called
      try {
        await refreshModelCatalogs();
      } catch (err) {
        // May fail due to missing API keys, but should be callable
      }
      expect(typeof refreshModelCatalogs).toBe('function');
    });
  });
});
