describe('server configuration', () => {
  describe('route imports', () => {
    test('auth routes are importable', () => {
      const routes = require('../routes/auth.routes');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('chat routes are importable', () => {
      const routes = require('../routes/chat');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('conversation routes are importable', () => {
      const routes = require('../routes/conversations');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('room routes are importable', () => {
      const routes = require('../routes/rooms');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('dashboard routes are importable', () => {
      const routes = require('../routes/dashboard');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('user routes are importable', () => {
      const routes = require('../routes/users');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('search routes are importable', () => {
      const routes = require('../routes/search');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('ai routes are importable', () => {
      const routes = require('../routes/ai');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('project routes are importable', () => {
      const routes = require('../routes/projects');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('settings routes are importable', () => {
      const routes = require('../routes/settings');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('poll routes are importable', () => {
      const routes = require('../routes/polls');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('group routes are importable', () => {
      const routes = require('../routes/groups');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('moderation routes are importable', () => {
      const routes = require('../routes/moderation');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('export routes are importable', () => {
      const routes = require('../routes/export');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('admin routes are importable', () => {
      const routes = require('../routes/admin');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('analytics routes are importable', () => {
      const routes = require('../routes/analytics');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('upload routes are importable', () => {
      const routes = require('../routes/uploads');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });

    test('memory routes are importable', () => {
      const routes = require('../routes/memory');
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });
  });

  describe('middleware imports', () => {
    test('auth middleware is importable', () => {
      const middleware = require('../middleware/auth');
      expect(typeof middleware).toBe('function');
    });

    test('admin middleware is importable', () => {
      const middleware = require('../middleware/admin');
      expect(typeof middleware).toBe('function');
    });

    test('aiQuota middleware is importable', () => {
      const middleware = require('../middleware/aiQuota');
      expect(typeof middleware).toBe('function');
    });

    test('rate limit middleware is importable', () => {
      const { authLimiter, aiLimiter, apiLimiter } = require('../middleware/rateLimit');
      expect(typeof authLimiter).toBe('function');
      expect(typeof aiLimiter).toBe('function');
      expect(typeof apiLimiter).toBe('function');
    });

    test('socket auth middleware is importable', () => {
      const middleware = require('../middleware/socketAuth');
      expect(typeof middleware).toBe('function');
    });
  });

  describe('service imports', () => {
    test('gemini service is importable', () => {
      const service = require('../services/gemini');
      expect(service).toBeDefined();
      expect(typeof service.sendMessage).toBe('function');
    });

    test('memory service is importable', () => {
      const service = require('../services/memory');
      expect(service).toBeDefined();
      expect(typeof service.retrieveRelevantMemories).toBe('function');
    });

    test('auth service is importable', () => {
      const service = require('../services/auth.service');
      expect(service).toBeDefined();
      expect(typeof service.registerUser).toBe('function');
    });

    test('email service is importable', () => {
      const service = require('../services/email');
      expect(service).toBeDefined();
      expect(typeof service.sendResetEmail).toBe('function');
    });

    test('importExport service is importable', () => {
      const service = require('../services/importExport');
      expect(service).toBeDefined();
      expect(typeof service.previewImport).toBe('function');
    });

    test('promptCatalog service is importable', () => {
      const service = require('../services/promptCatalog');
      expect(service).toBeDefined();
      expect(typeof service.getPromptTemplate).toBe('function');
    });

    test('conversationInsights service is importable', () => {
      const service = require('../services/conversationInsights');
      expect(service).toBeDefined();
      expect(typeof service.getConversationInsight).toBe('function');
    });

    test('messageFormatting service is importable', () => {
      const service = require('../services/messageFormatting');
      expect(service).toBeDefined();
      expect(typeof service.formatMessage).toBe('function');
    });

    test('aiQuota service is importable', () => {
      const service = require('../services/aiQuota');
      expect(service).toBeDefined();
      expect(typeof service.consumeAiQuota).toBe('function');
    });
  });

  describe('helper imports', () => {
    test('validate helper is importable', () => {
      const helper = require('../helpers/validate');
      expect(helper).toBeDefined();
      expect(typeof helper.isValidObjectId).toBe('function');
    });

    test('logger helper is importable', () => {
      const helper = require('../helpers/logger');
      expect(helper).toBeDefined();
      expect(typeof helper.info).toBe('function');
    });
  });

  describe('socket handler imports', () => {
    test('room handlers are importable', () => {
      const handlers = require('../socket/handlers/room');
      expect(typeof handlers.registerRoomHandlers).toBe('function');
    });

    test('typing handlers are importable', () => {
      const handlers = require('../socket/handlers/typing');
      expect(typeof handlers.registerTypingHandlers).toBe('function');
    });

    test('message handlers are importable', () => {
      const handlers = require('../socket/handlers/message');
      expect(typeof handlers.registerMessageHandlers).toBe('function');
    });

    test('reaction handlers are importable', () => {
      const handlers = require('../socket/handlers/reaction');
      expect(typeof handlers.registerReactionHandlers).toBe('function');
    });

    test('pin handlers are importable', () => {
      const handlers = require('../socket/handlers/pin');
      expect(typeof handlers.registerPinHandlers).toBe('function');
    });

    test('ai handlers are importable', () => {
      const handlers = require('../socket/handlers/ai');
      expect(typeof handlers.registerAIHandlers).toBe('function');
    });
  });
});
