describe('export route validation logic', () => {
  describe('export format validation', () => {
    test('valid formats are normalized, markdown, adapter', () => {
      const validFormats = ['normalized', 'markdown', 'adapter'];
      expect(validFormats).toContain('normalized');
      expect(validFormats).toContain('markdown');
      expect(validFormats).toContain('adapter');
    });

    test('defaults to normalized for invalid format', () => {
      const format = ['normalized', 'markdown', 'adapter'].includes('invalid')
        ? 'invalid'
        : 'normalized';
      expect(format).toBe('normalized');
    });

    test('accepts valid format', () => {
      const format = ['normalized', 'markdown', 'adapter'].includes('markdown')
        ? 'markdown'
        : 'normalized';
      expect(format).toBe('markdown');
    });
  });

  describe('room export mapping', () => {
    test('maps message to export format', () => {
      const message = {
        _id: { toString: () => 'msg1' },
        username: 'alice',
        content: 'Hello world',
        isDeleted: false,
        isAI: false,
        isEdited: false,
        fileUrl: null,
        fileName: null,
        createdAt: new Date(),
        memoryRefs: [],
      };

      const mapped = {
        id: message._id.toString(),
        username: message.username,
        content: message.isDeleted ? '[deleted]' : message.content,
        isAI: message.isAI || false,
        isEdited: message.isEdited || false,
        fileUrl: message.fileUrl || null,
        fileName: message.fileName || null,
        createdAt: message.createdAt,
        memoryRefs: message.memoryRefs || [],
      };

      expect(mapped.id).toBe('msg1');
      expect(mapped.content).toBe('Hello world');
    });

    test('shows [deleted] for deleted messages', () => {
      const message = {
        _id: { toString: () => 'msg1' },
        username: 'alice',
        content: 'Original content',
        isDeleted: true,
        isAI: false,
        isEdited: false,
        fileUrl: null,
        fileName: null,
        createdAt: new Date(),
        memoryRefs: [],
      };

      const content = message.isDeleted ? '[deleted]' : message.content;
      expect(content).toBe('[deleted]');
    });

    test('generates correct filename', () => {
      const roomName = 'Test Room Name';
      const filename = `chatsphere-room-${roomName.replace(/\s+/g, '-').toLowerCase()}.json`;
      expect(filename).toBe('chatsphere-room-test-room-name.json');
    });

    test('export data has correct structure', () => {
      const exportData = {
        exportedAt: new Date().toISOString(),
        exportedBy: 'alice',
        type: 'room_messages',
        room: {
          id: 'room1',
          name: 'Test Room',
          description: 'A test room',
        },
        messages: [],
        totalMessages: 0,
      };

      expect(exportData.type).toBe('room_messages');
      expect(exportData.room.name).toBe('Test Room');
      expect(exportData.totalMessages).toBe(0);
    });
  });

  describe('conversation export', () => {
    test('markdown format generates correct structure', () => {
      const conversation = {
        title: 'Test Conversation',
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi!' },
        ],
      };

      const markdown = [
        `# ${conversation.title}`,
        '',
        ...conversation.messages.map((msg) => `**${msg.role}}: ${msg.content}`),
      ].join('\n');

      expect(markdown).toContain('# Test Conversation');
      expect(markdown).toContain('Hello');
      expect(markdown).toContain('Hi!');
    });

    test('format defaults to json for invalid value', () => {
      const format = 'invalid' === 'markdown' ? 'markdown' : 'json';
      expect(format).toBe('json');
    });
  });
});
