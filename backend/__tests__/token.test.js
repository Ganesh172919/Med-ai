/**
 * =============================================================================
 * Token Utility Tests
 * =============================================================================
 *
 * Tests for JWT token generation utilities.
 *
 * WHY THESE TESTS:
 * - Token generation is critical for authentication
 * - Tokens must contain correct user data
 * - Token expiry must be set correctly
 * - Access and refresh tokens must use different secrets
 *
 * NOTE:
 * These tests require JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
 * environment variables to be set.
 * =============================================================================
 */

const jwt = require('jsonwebtoken');

// Set test environment variables before importing token utils
process.env.JWT_ACCESS_SECRET = 'test-access-secret-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing';

const { generateAccessToken, generateRefreshToken, generateTokens } = require('../utils/token');

// Helper to create a mock user
function createMockUser(overrides = {}) {
  return {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    username: 'testuser',
    email: 'test@example.com',
    ...overrides,
  };
}

describe('generateAccessToken', () => {
  it('generates a valid JWT token', () => {
    const user = createMockUser();
    const token = generateAccessToken(user);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('contains correct user data', () => {
    const user = createMockUser();
    const token = generateAccessToken(user);
    const decoded = jwt.decode(token);

    expect(decoded.id).toBe('507f1f77bcf86cd799439011');
    expect(decoded.username).toBe('testuser');
    expect(decoded.email).toBe('test@example.com');
  });

  it('sets expiry to 15 minutes', () => {
    const user = createMockUser();
    const token = generateAccessToken(user);
    const decoded = jwt.decode(token);

    // Token should have exp and iat
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();

    // exp - iat should be approximately 15 minutes (900 seconds)
    const expirySeconds = decoded.exp - decoded.iat;
    expect(expirySeconds).toBe(900);
  });

  it('is signed with the access secret', () => {
    const user = createMockUser();
    const token = generateAccessToken(user);

    // Should verify with access secret
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    expect(decoded.username).toBe('testuser');

    // Should fail with refresh secret
    expect(() => jwt.verify(token, process.env.JWT_REFRESH_SECRET)).toThrow();
  });
});

describe('generateRefreshToken', () => {
  it('generates a valid JWT token', () => {
    const user = createMockUser();
    const token = generateRefreshToken(user);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('contains correct user data', () => {
    const user = createMockUser();
    const token = generateRefreshToken(user);
    const decoded = jwt.decode(token);

    expect(decoded.id).toBe('507f1f77bcf86cd799439011');
    expect(decoded.username).toBe('testuser');
    expect(decoded.email).toBe('test@example.com');
  });

  it('sets expiry to 7 days', () => {
    const user = createMockUser();
    const token = generateRefreshToken(user);
    const decoded = jwt.decode(token);

    const expirySeconds = decoded.exp - decoded.iat;
    expect(expirySeconds).toBe(7 * 24 * 60 * 60); // 7 days in seconds
  });

  it('is signed with the refresh secret', () => {
    const user = createMockUser();
    const token = generateRefreshToken(user);

    // Should verify with refresh secret
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    expect(decoded.username).toBe('testuser');

    // Should fail with access secret
    expect(() => jwt.verify(token, process.env.JWT_ACCESS_SECRET)).toThrow();
  });
});

describe('generateTokens', () => {
  it('returns both access and refresh tokens', () => {
    const user = createMockUser();
    const tokens = generateTokens(user);

    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
    expect(typeof tokens.accessToken).toBe('string');
    expect(typeof tokens.refreshToken).toBe('string');
  });

  it('generates different tokens for access and refresh', () => {
    const user = createMockUser();
    const tokens = generateTokens(user);

    expect(tokens.accessToken).not.toBe(tokens.refreshToken);
  });

  it('access token has shorter expiry than refresh token', () => {
    const user = createMockUser();
    const tokens = generateTokens(user);

    const accessDecoded = jwt.decode(tokens.accessToken);
    const refreshDecoded = jwt.decode(tokens.refreshToken);

    const accessExpiry = accessDecoded.exp - accessDecoded.iat;
    const refreshExpiry = refreshDecoded.exp - refreshDecoded.iat;

    expect(accessExpiry).toBeLessThan(refreshExpiry);
  });
});

describe('token edge cases', () => {
  it('handles user with different ObjectId format', () => {
    const user = createMockUser({ _id: { toString: () => 'abc123def456' } });
    const token = generateAccessToken(user);
    const decoded = jwt.decode(token);
    expect(decoded.id).toBe('abc123def456');
  });

  it('handles user with special characters in username', () => {
    const user = createMockUser({ username: 'user.name-123' });
    const token = generateAccessToken(user);
    const decoded = jwt.decode(token);
    expect(decoded.username).toBe('user.name-123');
  });

  it('handles user with long email', () => {
    const user = createMockUser({ email: 'very.long.email.address@subdomain.example.com' });
    const token = generateAccessToken(user);
    const decoded = jwt.decode(token);
    expect(decoded.email).toBe('very.long.email.address@subdomain.example.com');
  });

  it('generates unique tokens for different users', () => {
    const user1 = createMockUser({ _id: { toString: () => 'user1' } });
    const user2 = createMockUser({ _id: { toString: () => 'user2' } });
    const token1 = generateAccessToken(user1);
    const token2 = generateAccessToken(user2);
    expect(token1).not.toBe(token2);
  });

  it('generates unique refresh tokens for different users', () => {
    const user1 = createMockUser({ _id: { toString: () => 'user1' } });
    const user2 = createMockUser({ _id: { toString: () => 'user2' } });
    const token1 = generateRefreshToken(user1);
    const token2 = generateRefreshToken(user2);
    expect(token1).not.toBe(token2);
  });

  it('access and refresh tokens have correct structure', () => {
    const user = createMockUser();
    const tokens = generateTokens(user);

    // JWT structure: header.payload.signature
    const accessParts = tokens.accessToken.split('.');
    const refreshParts = tokens.refreshToken.split('.');

    expect(accessParts).toHaveLength(3);
    expect(refreshParts).toHaveLength(3);

    // Each part should be base64url encoded
    for (const part of accessParts) {
      expect(part).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
});
