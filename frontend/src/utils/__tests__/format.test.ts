import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, formatRelativeTime, getAvatarColor, getInitials } from '../format';

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-14T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "No activity" for null/undefined', () => {
    expect(formatDate(null)).toBe('No activity');
    expect(formatDate(undefined)).toBe('No activity');
  });

  it('returns "Updated just now" for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(formatDate(now)).toBe('Updated just now');
  });

  it('returns hours ago for timestamps within 24h', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatDate(threeHoursAgo)).toBe('Updated 3h ago');
  });

  it('returns formatted date for older timestamps', () => {
    const oldDate = new Date('2026-05-01T12:00:00Z').toISOString();
    const result = formatDate(oldDate);
    expect(result).toContain('May');
    expect(result).toContain('1');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-14T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for very recent timestamps', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('Just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });
});

describe('getAvatarColor', () => {
  it('returns a consistent color for the same userId', () => {
    const color1 = getAvatarColor('user123');
    const color2 = getAvatarColor('user123');
    expect(color1).toBe(color2);
  });

  it('returns a tailwind gradient class', () => {
    const color = getAvatarColor('test');
    expect(color).toMatch(/^from-\w+-\d+ to-\w+-\d+$/);
  });

  it('returns different colors for different user IDs', () => {
    const colors = new Set(Array.from({ length: 20 }, (_, i) => getAvatarColor(`user${i}`)));
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe('getInitials', () => {
  it('returns first two characters uppercased', () => {
    expect(getInitials('john')).toBe('JO');
    expect(getInitials('Alice')).toBe('AL');
  });

  it('handles short strings', () => {
    expect(getInitials('A')).toBe('A');
  });

  it('handles empty string', () => {
    expect(getInitials('')).toBe('');
  });

  it('takes only first two characters', () => {
    expect(getInitials('BobSmith')).toBe('BO');
  });
});

describe('formatDate edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "No activity" for empty string', () => {
    expect(formatDate('')).toBe('No activity');
  });

  it('handles exactly 1 hour ago', () => {
    const oneHourAgo = new Date('2024-06-15T11:00:00Z').toISOString();
    expect(formatDate(oneHourAgo)).toBe('Updated 1h ago');
  });

  it('handles exactly 24 hours ago', () => {
    const oneDayAgo = new Date('2024-06-14T12:00:00Z').toISOString();
    expect(formatDate(oneDayAgo)).toBe('Updated Jun 14');
  });
});

describe('formatRelativeTime edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('handles exactly 1 minute ago', () => {
    const oneMinAgo = new Date('2024-06-15T11:59:00Z').toISOString();
    expect(formatRelativeTime(oneMinAgo)).toBe('1m ago');
  });

  it('handles exactly 60 minutes ago', () => {
    const oneHourAgo = new Date('2024-06-15T11:00:00Z').toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe('1h ago');
  });

  it('handles exactly 24 hours ago', () => {
    const oneDayAgo = new Date('2024-06-14T12:00:00Z').toISOString();
    expect(formatRelativeTime(oneDayAgo)).toBe('Jun 14');
  });
});

describe('getAvatarColor edge cases', () => {
  it('handles empty string', () => {
    const color = getAvatarColor('');
    expect(typeof color).toBe('string');
    expect(color).toContain('from-');
  });

  it('handles special characters', () => {
    const color = getAvatarColor('user@#$%');
    expect(typeof color).toBe('string');
  });

  it('handles long userId', () => {
    const color = getAvatarColor('a'.repeat(1000));
    expect(typeof color).toBe('string');
  });
});
