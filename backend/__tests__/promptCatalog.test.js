jest.mock('../models/PromptTemplate', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

const PromptTemplate = require('../models/PromptTemplate');
const {
  DEFAULT_PROMPTS,
  interpolatePrompt,
  buildInitialRoomHistory,
  getPromptTemplate,
  listPromptTemplates,
  upsertPromptTemplate,
} = require('../services/promptCatalog');

describe('interpolatePrompt', () => {
  test('replaces single variable', () => {
    expect(interpolatePrompt('Hello {{name}}!', { name: 'World' })).toBe('Hello World!');
  });

  test('replaces multiple variables', () => {
    const result = interpolatePrompt('{{greeting}} {{name}}, welcome to {{place}}.', {
      greeting: 'Hi', name: 'Alice', place: 'ChatSphere',
    });
    expect(result).toBe('Hi Alice, welcome to ChatSphere.');
  });

  test('handles missing variables by replacing with empty string', () => {
    expect(interpolatePrompt('Hello {{missing}}!')).toBe('Hello !');
  });

  test('handles null input', () => {
    expect(interpolatePrompt(null)).toBe('');
  });

  test('handles undefined input', () => {
    expect(interpolatePrompt(undefined)).toBe('');
  });

  test('handles whitespace in variable syntax', () => {
    expect(interpolatePrompt('Hello {{ name }}!', { name: 'Bob' })).toBe('Hello Bob!');
  });

  test('returns original string when no variables present', () => {
    expect(interpolatePrompt('No variables here.')).toBe('No variables here.');
  });

  test('handles numeric variable values', () => {
    expect(interpolatePrompt('Count: {{n}}', { n: 42 })).toBe('Count: 42');
  });
});

describe('DEFAULT_PROMPTS', () => {
  test('contains expected prompt keys', () => {
    const keys = Object.keys(DEFAULT_PROMPTS);
    expect(keys).toContain('solo-chat');
    expect(keys).toContain('group-chat');
    expect(keys).toContain('memory-extract');
    expect(keys).toContain('conversation-insight');
    expect(keys).toContain('smart-replies');
    expect(keys).toContain('sentiment');
    expect(keys).toContain('grammar');
  });

  test('each prompt has version, description, and content', () => {
    for (const [key, prompt] of Object.entries(DEFAULT_PROMPTS)) {
      expect(prompt).toHaveProperty('version');
      expect(prompt).toHaveProperty('description');
      expect(prompt).toHaveProperty('content');
      expect(typeof prompt.content).toBe('string');
      expect(prompt.content.length).toBeGreaterThan(0);
    }
  });

  test('group-chat prompt contains roomName template variable', () => {
    expect(DEFAULT_PROMPTS['group-chat'].content).toContain('{{roomName}}');
  });
});

describe('buildInitialRoomHistory', () => {
  test('returns array with two messages', () => {
    const history = buildInitialRoomHistory('Test Room');
    expect(history).toHaveLength(2);
    expect(history[0].role).toBe('user');
    expect(history[1].role).toBe('model');
  });

  test('interpolates room name into user prompt', () => {
    const history = buildInitialRoomHistory('Dev Chat');
    expect(history[0].parts[0].text).toContain('Dev Chat');
  });

  test('uses default room name when not provided', () => {
    const history = buildInitialRoomHistory();
    expect(history[0].parts[0].text).toContain('ChatSphere room');
  });

  test('uses default room name for empty string', () => {
    const history = buildInitialRoomHistory('');
    expect(history[0].parts[0].text).toContain('ChatSphere room');
  });

  test('model response acknowledges collaboration', () => {
    const history = buildInitialRoomHistory('Room');
    expect(history[1].parts[0].text).toMatch(/collaboratively/i);
  });
});

describe('getPromptTemplate', () => {
  beforeEach(() => {
    PromptTemplate.findOne.mockReset();
  });

  test('returns database prompt when found', async () => {
    PromptTemplate.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        key: 'solo-chat', version: 'v2', description: 'Custom', content: 'Custom content',
      }),
    });
    const result = await getPromptTemplate('solo-chat');
    expect(result.version).toBe('v2');
    expect(result.content).toBe('Custom content');
  });

  test('falls back to default when not in database', async () => {
    PromptTemplate.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    const result = await getPromptTemplate('solo-chat');
    expect(result.version).toBe('v1');
    expect(result.content).toBe(DEFAULT_PROMPTS['solo-chat'].content);
  });

  test('returns null for unknown key not in database or defaults', async () => {
    PromptTemplate.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    const result = await getPromptTemplate('nonexistent-key');
    expect(result).toBeNull();
  });
});

describe('listPromptTemplates', () => {
  beforeEach(() => {
    PromptTemplate.find.mockReset();
  });

  test('returns all default prompts when database is empty', async () => {
    PromptTemplate.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });
    const result = await listPromptTemplates();
    expect(result.length).toBe(Object.keys(DEFAULT_PROMPTS).length);
    expect(result.every((p) => p.source === 'default')).toBe(true);
  });

  test('merges database overrides with defaults', async () => {
    PromptTemplate.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { key: 'solo-chat', version: 'v2', description: 'Custom', content: 'Custom content' },
      ]),
    });
    const result = await listPromptTemplates();
    const soloChat = result.find((p) => p.key === 'solo-chat');
    expect(soloChat.source).toBe('database');
    expect(soloChat.version).toBe('v2');
  });

  test('includes custom database-only prompts', async () => {
    PromptTemplate.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { key: 'custom-prompt', version: 'v1', description: 'Custom', content: 'Custom content' },
      ]),
    });
    const result = await listPromptTemplates();
    const custom = result.find((p) => p.key === 'custom-prompt');
    expect(custom).toBeDefined();
    expect(custom.source).toBe('database');
  });
});

describe('upsertPromptTemplate', () => {
  beforeEach(() => {
    PromptTemplate.findOneAndUpdate.mockReset();
  });

  test('calls findOneAndUpdate with correct parameters', async () => {
    PromptTemplate.findOneAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ key: 'solo-chat', content: 'new content' }),
    });
    await upsertPromptTemplate('solo-chat', { content: 'new content' });
    expect(PromptTemplate.findOneAndUpdate).toHaveBeenCalledWith(
      { key: 'solo-chat' },
      expect.objectContaining({
        $set: expect.objectContaining({
          content: 'new content',
          isActive: true,
        }),
      }),
      { new: true, upsert: true }
    );
  });

  test('uses default version when not provided', async () => {
    PromptTemplate.findOneAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue({}),
    });
    await upsertPromptTemplate('solo-chat', { content: 'test' });
    const call = PromptTemplate.findOneAndUpdate.mock.calls[0][1];
    expect(call.$set.version).toBe('v1');
  });
});
