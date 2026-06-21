/**
 * =============================================================================
 * Validate Helper Tests
 * =============================================================================
 *
 * Tests for the validation utility functions used throughout the backend.
 * These functions handle ObjectId validation, string sanitization, room
 * membership checks, and role-based access control.
 *
 * WHY THESE TESTS MATTER:
 * - Validation is the first line of defense against invalid data
 * - Room membership checks prevent unauthorized access
 * - Role checks enforce the permission model
 * - Edge cases in these functions could cause security vulnerabilities
 *
 * TEST STRUCTURE:
 * Each function has tests for:
 * - Normal/expected inputs
 * - Edge cases (null, undefined, empty)
 * - Boundary conditions
 * - Security-relevant scenarios
 * =============================================================================
 */

const {
  isValidObjectId,
  sanitizeString,
  escapeRegex,
  requireFields,
  findRoomMember,
  isRoomCreator,
  getRoomMemberRole,
  hasRoomRole,
  canManageRoomMember,
  isBlockedBy,
} = require('../helpers/validate');

// ---------------------------------------------------------------------------
// isValidObjectId
// ---------------------------------------------------------------------------

describe('isValidObjectId', () => {
  it('returns true for valid 24-char hex string', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
  });

  it('returns false for invalid hex strings', () => {
    expect(isValidObjectId('not-an-id')).toBe(false);
    expect(isValidObjectId('123')).toBe(false);
    expect(isValidObjectId('')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isValidObjectId(null)).toBe(false);
    expect(isValidObjectId(undefined)).toBe(false);
  });

  it('returns false for 24-char string that is not valid ObjectId', () => {
    // This is 24 chars but not a valid ObjectId format
    expect(isValidObjectId('zzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// sanitizeString
// ---------------------------------------------------------------------------

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('truncates to max length', () => {
    const longStr = 'a'.repeat(1000);
    expect(sanitizeString(longStr, 10)).toHaveLength(10);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(123)).toBe('');
  });

  it('uses default max length of 500', () => {
    const longStr = 'a'.repeat(600);
    expect(sanitizeString(longStr)).toHaveLength(500);
  });

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// escapeRegex
// ---------------------------------------------------------------------------

describe('escapeRegex', () => {
  it('escapes special regex characters', () => {
    expect(escapeRegex('hello.world')).toBe('hello\\.world');
    expect(escapeRegex('test*string')).toBe('test\\*string');
    expect(escapeRegex('a+b')).toBe('a\\+b');
  });

  it('returns empty string for non-string input', () => {
    expect(escapeRegex(null)).toBe('');
    expect(escapeRegex(undefined)).toBe('');
  });

  it('handles string with no special chars', () => {
    expect(escapeRegex('hello')).toBe('hello');
  });

  it('escapes all special characters', () => {
    const input = '.*+?^${}()|[]\\';
    const escaped = escapeRegex(input);
    // Every special char should be preceded by backslash
    expect(escaped).toContain('\\.');
    expect(escaped).toContain('\\*');
    expect(escaped).toContain('\\+');
  });
});

// ---------------------------------------------------------------------------
// requireFields
// ---------------------------------------------------------------------------

describe('requireFields', () => {
  it('returns empty array when all fields present', () => {
    const obj = { name: 'John', email: 'john@test.com' };
    expect(requireFields(obj, ['name', 'email'])).toEqual([]);
  });

  it('returns missing field names', () => {
    const obj = { name: 'John' };
    expect(requireFields(obj, ['name', 'email'])).toEqual(['email']);
  });

  it('treats empty string as missing', () => {
    const obj = { name: '' };
    expect(requireFields(obj, ['name'])).toEqual(['name']);
  });

  it('treats null as missing', () => {
    const obj = { name: null };
    expect(requireFields(obj, ['name'])).toEqual(['name']);
  });

  it('treats undefined as missing', () => {
    const obj = { name: undefined };
    expect(requireFields(obj, ['name'])).toEqual(['name']);
  });

  it('returns all fields for empty object', () => {
    expect(requireFields({}, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });
});

// ---------------------------------------------------------------------------
// findRoomMember
// ---------------------------------------------------------------------------

describe('findRoomMember', () => {
  const room = {
    members: [
      { userId: { toString: () => 'user1' }, role: 'admin' },
      { userId: { toString: () => 'user2' }, role: 'member' },
    ],
  };

  it('finds existing member', () => {
    const member = findRoomMember(room, 'user1');
    expect(member).toBeTruthy();
    expect(member.role).toBe('admin');
  });

  it('returns null for non-member', () => {
    expect(findRoomMember(room, 'user999')).toBeNull();
  });

  it('returns null for null room', () => {
    expect(findRoomMember(null, 'user1')).toBeNull();
  });

  it('returns null for room without members', () => {
    expect(findRoomMember({}, 'user1')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isRoomCreator
// ---------------------------------------------------------------------------

describe('isRoomCreator', () => {
  const room = {
    creatorId: { toString: () => 'creator1' },
  };

  it('returns true for room creator', () => {
    expect(isRoomCreator(room, 'creator1')).toBe(true);
  });

  it('returns false for non-creator', () => {
    expect(isRoomCreator(room, 'other')).toBe(false);
  });

  it('returns false for null room', () => {
    expect(isRoomCreator(null, 'creator1')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hasRoomRole
// ---------------------------------------------------------------------------

describe('hasRoomRole', () => {
  const room = {
    creatorId: { toString: () => 'creator1' },
    members: [
      { userId: { toString: () => 'admin1' }, role: 'admin' },
      { userId: { toString: () => 'mod1' }, role: 'moderator' },
      { userId: { toString: () => 'member1' }, role: 'member' },
    ],
  };

  it('creator always has any role', () => {
    expect(hasRoomRole(room, 'creator1', ['admin'])).toBe(true);
    expect(hasRoomRole(room, 'creator1', ['moderator'])).toBe(true);
    expect(hasRoomRole(room, 'creator1', ['member'])).toBe(true);
  });

  it('admin has admin role', () => {
    expect(hasRoomRole(room, 'admin1', ['admin'])).toBe(true);
  });

  it('admin does not have moderator role', () => {
    expect(hasRoomRole(room, 'admin1', ['moderator'])).toBe(false);
  });

  it('member has member role', () => {
    expect(hasRoomRole(room, 'member1', ['member'])).toBe(true);
  });

  it('member does not have admin role', () => {
    expect(hasRoomRole(room, 'member1', ['admin'])).toBe(false);
  });

  it('returns false for non-member', () => {
    expect(hasRoomRole(room, 'unknown', ['admin'])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// canManageRoomMember
// ---------------------------------------------------------------------------

describe('canManageRoomMember', () => {
  const room = {
    creatorId: { toString: () => 'creator' },
    members: [
      { userId: { toString: () => 'admin' }, role: 'admin' },
      { userId: { toString: () => 'mod' }, role: 'moderator' },
      { userId: { toString: () => 'member' }, role: 'member' },
    ],
  };

  it('creator can manage anyone except themselves', () => {
    expect(canManageRoomMember(room, 'creator', 'admin')).toBe(true);
    expect(canManageRoomMember(room, 'creator', 'mod')).toBe(true);
    expect(canManageRoomMember(room, 'creator', 'member')).toBe(true);
    expect(canManageRoomMember(room, 'creator', 'creator')).toBe(false);
  });

  it('admin can manage members and moderators', () => {
    expect(canManageRoomMember(room, 'admin', 'member')).toBe(true);
    expect(canManageRoomMember(room, 'admin', 'mod')).toBe(true);
  });

  it('admin cannot manage creator', () => {
    expect(canManageRoomMember(room, 'admin', 'creator')).toBe(false);
  });

  it('moderator can manage members', () => {
    expect(canManageRoomMember(room, 'mod', 'member')).toBe(true);
  });

  it('moderator cannot manage admins', () => {
    expect(canManageRoomMember(room, 'mod', 'admin')).toBe(false);
  });

  it('member cannot manage anyone', () => {
    expect(canManageRoomMember(room, 'member', 'admin')).toBe(false);
    expect(canManageRoomMember(room, 'member', 'mod')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isBlockedBy
// ---------------------------------------------------------------------------

describe('isBlockedBy', () => {
  it('returns true when user is blocked', () => {
    const user = {
      blockedUsers: [{ toString: () => 'blocked1' }],
    };
    expect(isBlockedBy(user, 'blocked1')).toBe(true);
  });

  it('returns false when user is not blocked', () => {
    const user = {
      blockedUsers: [{ toString: () => 'blocked1' }],
    };
    expect(isBlockedBy(user, 'notblocked')).toBe(false);
  });

  it('returns false for null user', () => {
    expect(isBlockedBy(null, 'anyone')).toBe(false);
  });

  it('returns false for user without blockedUsers', () => {
    expect(isBlockedBy({}, 'anyone')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Additional edge cases
// ---------------------------------------------------------------------------

describe('isValidObjectId edge cases', () => {
  it('returns false for number', () => {
    expect(isValidObjectId(12345)).toBe(false);
  });

  it('returns false for boolean', () => {
    expect(isValidObjectId(true)).toBe(false);
  });

  it('returns false for object', () => {
    expect(isValidObjectId({})).toBe(false);
  });

  it('returns false for array', () => {
    expect(isValidObjectId([])).toBe(false);
  });
});

describe('sanitizeString edge cases', () => {
  it('handles string with only whitespace', () => {
    expect(sanitizeString('   ')).toBe('');
  });

  it('preserves content after trimming', () => {
    expect(sanitizeString('  hello world  ')).toBe('hello world');
  });

  it('handles special characters', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('<script>alert("xss")</script>');
  });
});

describe('escapeRegex edge cases', () => {
  it('escapes parentheses', () => {
    expect(escapeRegex('(test)')).toBe('\\(test\\)');
  });

  it('escapes square brackets', () => {
    expect(escapeRegex('[test]')).toBe('\\[test\\]');
  });

  it('escapes curly braces', () => {
    expect(escapeRegex('{test}')).toBe('\\{test\\}');
  });

  it('escapes pipe', () => {
    expect(escapeRegex('a|b')).toBe('a\\|b');
  });

  it('escapes caret', () => {
    expect(escapeRegex('^test')).toBe('\\^test');
  });

  it('escapes dollar sign', () => {
    expect(escapeRegex('$test')).toBe('\\$test');
  });

  it('escapes question mark', () => {
    expect(escapeRegex('test?')).toBe('test\\?');
  });
});

describe('requireFields edge cases', () => {
  it('handles fields with falsy values', () => {
    const obj = { count: 0, active: false, name: 'test' };
    expect(requireFields(obj, ['count', 'active', 'name'])).toEqual([]);
  });

  it('handles empty fields array', () => {
    expect(requireFields({ a: 1 }, [])).toEqual([]);
  });

  it('handles duplicate field names', () => {
    const obj = {};
    expect(requireFields(obj, ['a', 'a'])).toEqual(['a', 'a']);
  });
});

describe('getRoomMemberRole', () => {
  const room = {
    creatorId: { toString: () => 'creator1' },
    members: [
      { userId: { toString: () => 'admin1' }, role: 'admin' },
      { userId: { toString: () => 'member1' }, role: 'member' },
    ],
  };

  it('returns creator for room creator', () => {
    expect(getRoomMemberRole(room, 'creator1')).toBe('creator');
  });

  it('returns admin for admin member', () => {
    expect(getRoomMemberRole(room, 'admin1')).toBe('admin');
  });

  it('returns member for regular member', () => {
    expect(getRoomMemberRole(room, 'member1')).toBe('member');
  });

  it('returns null for non-member', () => {
    expect(getRoomMemberRole(room, 'unknown')).toBeNull();
  });

  it('returns null for null room', () => {
    expect(getRoomMemberRole(null, 'user1')).toBeNull();
  });
});
