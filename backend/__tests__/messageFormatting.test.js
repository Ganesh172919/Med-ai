jest.mock('../middleware/upload', () => ({
  ALLOWED_TYPES: {
    'image/png': true,
    'image/jpeg': true,
    'image/gif': true,
    'image/webp': true,
    'application/pdf': true,
  },
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
}));

const { formatMessage, formatMemoryRefs, validateAttachmentPayload } = require('../services/messageFormatting');

describe('formatMemoryRefs', () => {
  test('returns empty array for empty input', () => {
    expect(formatMemoryRefs([])).toEqual([]);
  });

  test('returns empty array for undefined', () => {
    expect(formatMemoryRefs(undefined)).toEqual([]);
  });

  test('formats memory refs with id, summary, score', () => {
    const refs = [{ id: 'mem1', summary: 'User likes JS', score: 0.95 }];
    const result = formatMemoryRefs(refs);
    expect(result).toEqual([{ id: 'mem1', summary: 'User likes JS', score: 0.95 }]);
  });

  test('converts id to string', () => {
    const refs = [{ id: 12345, summary: 'test', score: 0.5 }];
    expect(formatMemoryRefs(refs)[0].id).toBe('12345');
  });

  test('sets score to null when not a number', () => {
    const refs = [{ id: 'm1', summary: 'test', score: 'high' }];
    expect(formatMemoryRefs(refs)[0].score).toBeNull();
  });

  test('sets score to null when missing', () => {
    const refs = [{ id: 'm1', summary: 'test' }];
    expect(formatMemoryRefs(refs)[0].score).toBeNull();
  });
});

describe('formatMessage', () => {
  const baseMessage = {
    _id: { toString: () => 'msg123' },
    userId: 'user1',
    username: 'alice',
    content: 'Hello world',
    createdAt: '2024-01-01T00:00:00Z',
  };

  test('formats basic message fields', () => {
    const result = formatMessage(baseMessage);
    expect(result.id).toBe('msg123');
    expect(result.userId).toBe('user1');
    expect(result.username).toBe('alice');
    expect(result.content).toBe('Hello world');
    expect(result.timestamp).toBe('2024-01-01T00:00:00Z');
  });

  test('sets default values for optional fields', () => {
    const result = formatMessage(baseMessage);
    expect(result.isAI).toBe(false);
    expect(result.triggeredBy).toBeNull();
    expect(result.replyTo).toBeNull();
    expect(result.reactions).toEqual({});
    expect(result.status).toBe('sent');
    expect(result.isPinned).toBe(false);
    expect(result.isEdited).toBe(false);
    expect(result.editedAt).toBeNull();
    expect(result.isDeleted).toBe(false);
    expect(result.fileUrl).toBeNull();
    expect(result.fileName).toBeNull();
    expect(result.fileType).toBeNull();
    expect(result.fileSize).toBeNull();
    expect(result.modelId).toBeNull();
    expect(result.provider).toBeNull();
  });

  test('shows deletion placeholder for deleted messages', () => {
    const msg = { ...baseMessage, isDeleted: true, content: 'original' };
    // Canonical format from socket/formatMessage.js includes emoji prefix
    expect(formatMessage(msg).content).toBe('🗑️ This message was deleted');
  });

  test('preserves AI message fields', () => {
    const msg = { ...baseMessage, isAI: true, triggeredBy: 'user1', modelId: 'gpt-4', provider: 'openrouter' };
    const result = formatMessage(msg);
    expect(result.isAI).toBe(true);
    expect(result.triggeredBy).toBe('user1');
    expect(result.modelId).toBe('gpt-4');
    expect(result.provider).toBe('openrouter');
  });

  test('converts Map reactions to object', () => {
    const reactions = new Map([['👍', ['user1', 'user2']], ['❤️', ['user3']]]);
    const msg = { ...baseMessage, reactions };
    const result = formatMessage(msg);
    expect(result.reactions).toEqual({ '👍': ['user1', 'user2'], '❤️': ['user3'] });
  });

  test('passes plain object reactions through', () => {
    const reactions = { '👍': ['user1'] };
    const msg = { ...baseMessage, reactions };
    expect(formatMessage(msg).reactions).toEqual({ '👍': ['user1'] });
  });

  test('includes replyTo when it has id', () => {
    const replyTo = { id: 'msg999', username: 'bob', content: 'original' };
    const msg = { ...baseMessage, replyTo };
    expect(formatMessage(msg).replyTo).toEqual(replyTo);
  });

  test('sets replyTo to null when it has no id', () => {
    const msg = { ...baseMessage, replyTo: { username: 'bob' } };
    expect(formatMessage(msg).replyTo).toBeNull();
  });

  test('includes file attachment fields', () => {
    const msg = {
      ...baseMessage,
      fileUrl: '/api/uploads/file.png',
      fileName: 'file.png',
      fileType: 'image/png',
      fileSize: 1024,
    };
    const result = formatMessage(msg);
    expect(result.fileUrl).toBe('/api/uploads/file.png');
    expect(result.fileName).toBe('file.png');
    expect(result.fileType).toBe('image/png');
    expect(result.fileSize).toBe(1024);
  });
});

describe('validateAttachmentPayload', () => {
  test('returns null when no file fields provided', () => {
    expect(validateAttachmentPayload({})).toBeNull();
  });

  test('returns error when only some file fields provided', () => {
    expect(validateAttachmentPayload({ fileUrl: '/api/uploads/test.png' })).toBe('Incomplete file attachment data');
  });

  test('returns error when fileUrl missing', () => {
    expect(validateAttachmentPayload({
      fileName: 'test.png', fileType: 'image/png', fileSize: 1024,
    })).toBe('Incomplete file attachment data');
  });

  test('returns error when fileSize is not a number', () => {
    expect(validateAttachmentPayload({
      fileUrl: '/api/uploads/test.png', fileName: 'test.png', fileType: 'image/png', fileSize: 'big',
    })).toBe('Incomplete file attachment data');
  });

  test('returns error for invalid file URL', () => {
    expect(validateAttachmentPayload({
      fileUrl: 'https://evil.com/file.png', fileName: 'file.png', fileType: 'image/png', fileSize: 1024,
    })).toBe('Invalid file URL');
  });

  test('returns error for unsupported file type', () => {
    expect(validateAttachmentPayload({
      fileUrl: '/api/uploads/file.exe', fileName: 'file.exe', fileType: 'application/exe', fileSize: 1024,
    })).toBe('Unsupported file type');
  });

  test('returns error for zero-size file', () => {
    expect(validateAttachmentPayload({
      fileUrl: '/api/uploads/file.png', fileName: 'file.png', fileType: 'image/png', fileSize: 0,
    })).toMatch(/must be smaller/);
  });

  test('returns error for oversized file', () => {
    expect(validateAttachmentPayload({
      fileUrl: '/api/uploads/file.png', fileName: 'file.png', fileType: 'image/png', fileSize: 999 * 1024 * 1024,
    })).toMatch(/must be smaller/);
  });

  test('returns null for valid attachment', () => {
    expect(validateAttachmentPayload({
      fileUrl: '/api/uploads/file.png', fileName: 'file.png', fileType: 'image/png', fileSize: 1024,
    })).toBeNull();
  });

  test('accepts all allowed file types', () => {
    const types = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];
    for (const fileType of types) {
      expect(validateAttachmentPayload({
        fileUrl: '/api/uploads/file', fileName: 'file', fileType, fileSize: 1024,
      })).toBeNull();
    }
  });
});
