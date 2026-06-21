const { consumeAiQuota, AI_WINDOW_MS, AI_MAX_REQUESTS } = require('../services/aiQuota');

describe('aiQuota service', () => {
  // Reset the quota map between tests by using unique keys
  let testCounter = 0;
  function uniqueKey() {
    return `test-key-${++testCounter}`;
  }

  describe('consumeAiQuota', () => {
    test('allows first request', () => {
      const result = consumeAiQuota(uniqueKey());
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(AI_MAX_REQUESTS - 1);
      expect(result.retryAfterMs).toBe(0);
    });

    test('tracks request count', () => {
      const key = uniqueKey();
      consumeAiQuota(key);
      consumeAiQuota(key);
      const result = consumeAiQuota(key);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(AI_MAX_REQUESTS - 3);
    });

    test('blocks after max requests', () => {
      const key = uniqueKey();
      for (let i = 0; i < AI_MAX_REQUESTS; i++) {
        consumeAiQuota(key);
      }
      const result = consumeAiQuota(key);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    test('uses custom max requests', () => {
      const key = uniqueKey();
      const max = 3;
      consumeAiQuota(key, max);
      consumeAiQuota(key, max);
      consumeAiQuota(key, max);
      const result = consumeAiQuota(key, max);
      expect(result.allowed).toBe(false);
    });

    test('uses custom window', () => {
      const key = uniqueKey();
      const result = consumeAiQuota(key, 10, 60000);
      expect(result.allowed).toBe(true);
    });

    test('different keys have independent quotas', () => {
      const key1 = uniqueKey();
      const key2 = uniqueKey();
      for (let i = 0; i < AI_MAX_REQUESTS; i++) {
        consumeAiQuota(key1);
      }
      const result = consumeAiQuota(key2);
      expect(result.allowed).toBe(true);
    });

    test('returns correct remaining count', () => {
      const key = uniqueKey();
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(consumeAiQuota(key));
      }
      expect(results[0].remaining).toBe(AI_MAX_REQUESTS - 1);
      expect(results[4].remaining).toBe(AI_MAX_REQUESTS - 5);
    });
  });

  describe('constants', () => {
    test('AI_WINDOW_MS is 15 minutes', () => {
      expect(AI_WINDOW_MS).toBe(15 * 60 * 1000);
    });

    test('AI_MAX_REQUESTS is 20', () => {
      expect(AI_MAX_REQUESTS).toBe(20);
    });
  });
});
