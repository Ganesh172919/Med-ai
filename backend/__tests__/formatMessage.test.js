const { formatMessage } = require('../socket/formatMessage');

describe('formatMessage', () => {
  const baseMsg = {
    _id: { toString: () => 'msg123' },
    userId: 'user1',
    username: 'testuser',
    content: 'Hello world',
    createdAt: '2025-01-01T00:00:00Z',
    isAI: false,
    triggeredBy: null,
    replyTo: null,
    reactions: null,
    status: 'sent',
    isPinned: false,
    isEdited: false,
    editedAt: null,
    isDeleted: false,
    fileUrl: null,
    fileName: null,
    fileType: null,
    fileSize: null,
    memoryRefs: [],
    modelId: null,
    provider: null,
  };

  it('converts _id to string id', () => {
    const result = formatMessage(baseMsg);
    expect(result.id).toBe('msg123');
  });

  it('preserves userId and username', () => {
    const result = formatMessage(baseMsg);
    expect(result.userId).toBe('user1');
    expect(result.username).toBe('testuser');
  });

  it('returns content for non-deleted messages', () => {
    const result = formatMessage(baseMsg);
    expect(result.content).toBe('Hello world');
  });

  it('returns placeholder for deleted messages', () => {
    const msg = { ...baseMsg, isDeleted: true };
    const result = formatMessage(msg);
    expect(result.content).toBe('🗑️ This message was deleted');
  });

  it('handles Map reactions by converting to object', () => {
    const reactions = new Map([['👍', ['user1', 'user2']], ['🔥', ['user3']]]);
    const msg = { ...baseMsg, reactions };
    const result = formatMessage(msg);
    expect(result.reactions).toEqual({ '👍': ['user1', 'user2'], '🔥': ['user3'] });
  });

  it('handles plain object reactions', () => {
    const reactions = { '👍': ['user1'] };
    const msg = { ...baseMsg, reactions };
    const result = formatMessage(msg);
    expect(result.reactions).toEqual({ '👍': ['user1'] });
  });

  it('returns empty object when reactions is null', () => {
    const result = formatMessage(baseMsg);
    expect(result.reactions).toEqual({});
  });

  it('preserves replyTo when valid', () => {
    const replyTo = { id: 'msg001', username: 'other', content: 'hi' };
    const msg = { ...baseMsg, replyTo };
    const result = formatMessage(msg);
    expect(result.replyTo).toEqual(replyTo);
  });

  it('returns null for replyTo when missing id', () => {
    const msg = { ...baseMsg, replyTo: { username: 'other' } };
    const result = formatMessage(msg);
    expect(result.replyTo).toBeNull();
  });

  it('defaults missing optional fields to null/empty', () => {
    const minimalMsg = {
      _id: { toString: () => 'msg456' },
      userId: 'user1',
      username: 'testuser',
      content: 'test',
      createdAt: '2025-01-01T00:00:00Z',
    };
    const result = formatMessage(minimalMsg);
    expect(result.isAI).toBe(false);
    expect(result.triggeredBy).toBeNull();
    expect(result.replyTo).toBeNull();
    expect(result.reactions).toEqual({});
    expect(result.status).toBe('sent');
    expect(result.isPinned).toBe(false);
    expect(result.isEdited).toBe(false);
    expect(result.isDeleted).toBe(false);
    expect(result.fileUrl).toBeNull();
    expect(result.fileName).toBeNull();
    expect(result.fileType).toBeNull();
    expect(result.fileSize).toBeNull();
    expect(result.memoryRefs).toEqual([]);
    expect(result.modelId).toBeNull();
    expect(result.provider).toBeNull();
  });

  it('preserves file metadata', () => {
    const msg = {
      ...baseMsg,
      fileUrl: 'https://example.com/file.pdf',
      fileName: 'file.pdf',
      fileType: 'application/pdf',
      fileSize: 12345,
    };
    const result = formatMessage(msg);
    expect(result.fileUrl).toBe('https://example.com/file.pdf');
    expect(result.fileName).toBe('file.pdf');
    expect(result.fileType).toBe('application/pdf');
    expect(result.fileSize).toBe(12345);
  });

  it('preserves AI metadata', () => {
    const msg = {
      ...baseMsg,
      isAI: true,
      triggeredBy: 'user2',
      modelId: 'gemini-pro',
      provider: 'google',
    };
    const result = formatMessage(msg);
    expect(result.isAI).toBe(true);
    expect(result.triggeredBy).toBe('user2');
    expect(result.modelId).toBe('gemini-pro');
    expect(result.provider).toBe('google');
  });

  it('preserves pinned state', () => {
    const msg = { ...baseMsg, isPinned: true };
    const result = formatMessage(msg);
    expect(result.isPinned).toBe(true);
  });

  it('preserves edited state and timestamp', () => {
    const msg = { ...baseMsg, isEdited: true, editedAt: '2025-01-02T00:00:00Z' };
    const result = formatMessage(msg);
    expect(result.isEdited).toBe(true);
    expect(result.editedAt).toBe('2025-01-02T00:00:00Z');
  });

  it('preserves memory refs', () => {
    const memoryRefs = [
      { id: 'mem1', summary: 'User likes JS', score: 0.9 },
      { id: 'mem2', summary: 'User lives in NYC', score: 0.8 },
    ];
    const msg = { ...baseMsg, memoryRefs };
    const result = formatMessage(msg);
    expect(result.memoryRefs).toEqual(memoryRefs);
  });

  it('handles replyTo with null id', () => {
    const msg = { ...baseMsg, replyTo: { id: null, username: 'other' } };
    const result = formatMessage(msg);
    expect(result.replyTo).toBeNull();
  });

  it('handles replyTo with undefined', () => {
    const msg = { ...baseMsg, replyTo: undefined };
    const result = formatMessage(msg);
    expect(result.replyTo).toBeNull();
  });

  it('handles empty Map reactions', () => {
    const reactions = new Map();
    const msg = { ...baseMsg, reactions };
    const result = formatMessage(msg);
    expect(result.reactions).toEqual({});
  });

  it('preserves status field', () => {
    const msg = { ...baseMsg, status: 'delivered' };
    const result = formatMessage(msg);
    expect(result.status).toBe('delivered');
  });

  it('defaults status to sent when missing', () => {
    const msg = { ...baseMsg, status: undefined };
    const result = formatMessage(msg);
    expect(result.status).toBe('sent');
  });
});
