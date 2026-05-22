import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../errors';

describe('getErrorMessage', () => {
  it('extracts error from API error response', () => {
    const err = { response: { data: { error: 'Not found' } } };
    expect(getErrorMessage(err)).toBe('Not found');
  });

  it('returns fallback for API error without message', () => {
    const err = { response: { data: {} } };
    expect(getErrorMessage(err, 'Default')).toBe('Default');
  });

  it('extracts message from Error instances', () => {
    const err = new Error('Something broke');
    expect(getErrorMessage(err)).toBe('Something broke');
  });

  it('returns default fallback for unknown errors', () => {
    expect(getErrorMessage('string error')).toBe('An unexpected error occurred');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
  });

  it('accepts custom fallback', () => {
    expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});
