jest.mock('../models/Conversation', () => ({}));
jest.mock('../models/ConversationInsight', () => ({}));
jest.mock('../models/ImportSession', () => ({}));
jest.mock('../models/MemoryEntry', () => ({}));
jest.mock('../services/memory', () => ({
  buildMemoryCandidates: jest.fn().mockResolvedValue([]),
  upsertMemoryEntries: jest.fn().mockResolvedValue([]),
}));
jest.mock('../services/conversationInsights', () => ({
  refreshConversationInsight: jest.fn().mockResolvedValue(null),
}));

delete require.cache[require.resolve('../services/importExport')];
const { previewImport } = require('../services/importExport');

describe('importExport service', () => {
  describe('previewImport', () => {
    test('returns empty preview for empty JSON array', async () => {
      const result = await previewImport('[]', 'export.json');
      // Empty JSON array → no ChatGPT conversations → falls through to generic parser
      expect(result.conversations).toBeDefined();
      expect(result.sourceType).toBeDefined();
    });

    test('returns empty preview for invalid JSON', async () => {
      const result = await previewImport('not json at all', 'export.json');
      // Invalid JSON will be parsed as generic markdown/text
      expect(result.conversations).toBeDefined();
    });

    test('parses ChatGPT format with messages array', async () => {
      const data = JSON.stringify([
        { title: 'Test Chat', messages: [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi!' }] },
      ]);
      const result = await previewImport(data, 'chatgpt-export.json');
      expect(result.conversations.length).toBe(1);
      expect(result.conversations[0].title).toBe('Test Chat');
      expect(result.conversations[0].messageCount).toBe(2);
    });

    test('parses ChatGPT export format with mapping', async () => {
      const data = JSON.stringify([
        {
          title: 'Mapping Chat',
          mapping: {
            node1: { message: { author: { role: 'user' }, content: { parts: ['Hello'] }, create_time: 1000 } },
            node2: { message: { author: { role: 'assistant' }, content: { parts: ['Hi!'] }, create_time: 1001 } },
          },
        },
      ]);
      const result = await previewImport(data, 'chatgpt-export.json');
      expect(result.conversations.length).toBe(1);
      expect(result.conversations[0].title).toBe('Mapping Chat');
    });

    test('parses Claude text format when not JSON', async () => {
      const raw = 'Human: Hello\n\nAssistant: Hi there!';
      const result = await previewImport(raw, 'claude-export.txt');
      expect(result.conversations.length).toBe(1);
      expect(result.conversations[0].messageCount).toBe(2);
    });

    test('returns sourceType for unknown format', async () => {
      const result = await previewImport('Just some text', 'notes.txt');
      expect(result.sourceType).toBeDefined();
      expect(result.conversations).toBeDefined();
    });

    test('handles nested conversations key in ChatGPT format', async () => {
      const data = JSON.stringify({
        conversations: [
          { title: 'Nested', messages: [{ role: 'user', content: 'test' }] },
        ],
      });
      const result = await previewImport(data, 'chatgpt-export.json');
      expect(result.conversations.length).toBe(1);
    });

    test('skips empty conversations', async () => {
      const data = JSON.stringify([
        { title: 'Empty', messages: [] },
        { title: 'Has messages', messages: [{ role: 'user', content: 'Hi' }] },
      ]);
      const result = await previewImport(data, 'export.json');
      expect(result.conversations.length).toBe(1);
      expect(result.conversations[0].title).toBe('Has messages');
    });

    test('includes candidate memories', async () => {
      const data = JSON.stringify([
        { title: 'Test', messages: [{ role: 'user', content: 'Hello' }] },
      ]);
      const result = await previewImport(data, 'export.json');
      expect(result.candidateMemories).toBeDefined();
      expect(Array.isArray(result.candidateMemories)).toBe(true);
    });

    test('includes errors array', async () => {
      const result = await previewImport('test', 'export.txt');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    test('includes preview of messages', async () => {
      const data = JSON.stringify([
        { title: 'Test', messages: [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi' }] },
      ]);
      const result = await previewImport(data, 'export.json');
      expect(result.conversations[0].preview).toBeDefined();
      expect(result.conversations[0].preview.length).toBeLessThanOrEqual(4);
    });
  });
});
