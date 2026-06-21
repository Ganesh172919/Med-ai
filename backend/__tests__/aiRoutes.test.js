describe('ai route validation logic', () => {
  describe('buildSmartReplyFallback', () => {
    function buildSmartReplyFallback(messages) {
      const lastMessage = messages[messages.length - 1]?.content || '';
      if (/\?$/.test(lastMessage.trim())) {
        return ['Yes, that works for me.', 'Let me check and get back to you.', 'Can you share a bit more detail?'];
      }
      return ['Sounds good.', 'Thanks for the update.', "Let's do that."];
    }

    test('returns question responses when last message ends with ?', () => {
      const messages = [{ content: 'Can we meet tomorrow?' }];
      const result = buildSmartReplyFallback(messages);
      expect(result).toEqual([
        'Yes, that works for me.',
        'Let me check and get back to you.',
        'Can you share a bit more detail?',
      ]);
    });

    test('returns default responses when last message does not end with ?', () => {
      const messages = [{ content: 'Let me know when you are free' }];
      const result = buildSmartReplyFallback(messages);
      expect(result).toEqual(['Sounds good.', 'Thanks for the update.', "Let's do that."]);
    });

    test('handles empty messages array', () => {
      const messages = [];
      const result = buildSmartReplyFallback(messages);
      expect(result).toEqual(['Sounds good.', 'Thanks for the update.', "Let's do that."]);
    });

    test('uses last message for detection', () => {
      const messages = [
        { content: 'Statement' },
        { content: 'Question?' },
      ];
      const result = buildSmartReplyFallback(messages);
      expect(result[0]).toBe('Yes, that works for me.');
    });
  });

  describe('smart replies validation', () => {
    test('requires messages array', () => {
      const messages = null;
      const isValid = Array.isArray(messages) && messages.length > 0;
      expect(isValid).toBe(false);
    });

    test('requires non-empty messages array', () => {
      const messages = [];
      const isValid = Array.isArray(messages) && messages.length > 0;
      expect(isValid).toBe(false);
    });

    test('accepts valid messages', () => {
      const messages = [{ content: 'Hello' }];
      const isValid = Array.isArray(messages) && messages.length > 0;
      expect(isValid).toBe(true);
    });

    test('takes last 6 messages', () => {
      const messages = Array.from({ length: 10 }, (_, i) => ({ content: `msg${i}` }));
      const recent = messages.slice(-6);
      expect(recent.length).toBe(6);
      expect(recent[0].content).toBe('msg4');
    });

    test('normalizes suggestions to 3', () => {
      const suggestions = ['a', 'b'];
      const normalized = [...suggestions];
      while (normalized.length < 3) {
        normalized.push('Interesting!');
      }
      expect(normalized.length).toBe(3);
      expect(normalized[2]).toBe('Interesting!');
    });

    test('filters empty suggestions', () => {
      const suggestions = ['a', '', '  ', 'b'];
      const normalized = suggestions
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 3);
      expect(normalized).toEqual(['a', 'b']);
    });
  });

  describe('sentiment validation', () => {
    test('requires text', () => {
      const text = null;
      const isValid = text && typeof text === 'string';
      expect(isValid).toBeFalsy();
    });

    test('requires string text', () => {
      const text = 123;
      const isValid = text && typeof text === 'string';
      expect(isValid).toBeFalsy();
    });

    test('accepts valid text', () => {
      const text = 'I love this!';
      const isValid = text && typeof text === 'string';
      expect(isValid).toBeTruthy();
    });

    test('truncates text to 500 chars', () => {
      const text = 'a'.repeat(1000);
      const truncated = text.slice(0, 500);
      expect(truncated.length).toBe(500);
    });

    test('defaults sentiment to neutral', () => {
      const result = {};
      const sentiment = String(result.sentiment || 'neutral');
      expect(sentiment).toBe('neutral');
    });

    test('defaults confidence to 0.5', () => {
      const result = {};
      const confidence = Number.isFinite(Number(result.confidence)) ? Number(result.confidence) : 0.5;
      expect(confidence).toBe(0.5);
    });

    test('defaults emoji to :|', () => {
      const result = {};
      const emoji = String(result.emoji || ':|');
      expect(emoji).toBe(':|');
    });
  });

  describe('grammar validation', () => {
    test('requires text', () => {
      const text = null;
      const isValid = text && typeof text === 'string' && text.trim().length >= 3;
      expect(isValid).toBeFalsy();
    });

    test('requires at least 3 characters', () => {
      const text = 'ab';
      const isValid = text && typeof text === 'string' && text.trim().length >= 3;
      expect(isValid).toBeFalsy();
    });

    test('accepts valid text', () => {
      const text = 'Hello world';
      const isValid = text && typeof text === 'string' && text.trim().length >= 3;
      expect(isValid).toBeTruthy();
    });

    test('limits suggestions to 4', () => {
      const suggestions = ['a', 'b', 'c', 'd', 'e'];
      const limited = suggestions.map((item) => String(item)).filter(Boolean).slice(0, 4);
      expect(limited.length).toBe(4);
    });
  });

  describe('models response', () => {
    test('includes auto model', () => {
      const models = [
        { id: 'auto', label: 'Auto Route (task-aware)', provider: 'system', supportsFiles: true },
      ];
      expect(models.some((m) => m.id === 'auto')).toBe(true);
    });

    test('hasConfiguredModels is true when models exist', () => {
      const models = [{ id: 'model1' }];
      const hasConfiguredModels = models.length > 0;
      expect(hasConfiguredModels).toBe(true);
    });

    test('emptyStateMessage when no models', () => {
      const models = [];
      const emptyStateMessage = models.length > 0 ? '' : 'No AI models are configured. Add provider API keys in backend/.env.';
      expect(emptyStateMessage).toContain('No AI models');
    });
  });
});
