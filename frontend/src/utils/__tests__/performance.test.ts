import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackTiming, getMetrics, clearMetrics } from '../performance';

describe('performance utilities', () => {
  beforeEach(() => {
    clearMetrics();
  });

  describe('trackTiming', () => {
    it('records a custom metric', () => {
      const startTime = performance.now() - 50;
      trackTiming('message-send', startTime);
      const metrics = getMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(1);
      expect(metrics.some((m) => m.name === 'message-send')).toBe(true);
    });

    it('calls the onMetric callback', () => {
      const callback = vi.fn();
      const startTime = performance.now() - 10;
      trackTiming('test-metric', startTime, callback);
      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0]).toMatchObject({
        name: 'test-metric',
        rating: expect.any(String),
      });
    });
  });

  describe('getMetrics', () => {
    it('returns an empty array initially', () => {
      clearMetrics();
      expect(getMetrics()).toEqual([]);
    });

    it('returns accumulated metrics', () => {
      trackTiming('a', performance.now() - 10);
      trackTiming('b', performance.now() - 20);
      expect(getMetrics().length).toBe(2);
    });
  });

  describe('clearMetrics', () => {
    it('empties the metrics store', () => {
      trackTiming('a', performance.now());
      expect(getMetrics().length).toBe(1);
      clearMetrics();
      expect(getMetrics().length).toBe(0);
    });
  });
});
