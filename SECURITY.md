# ChatSphere Security Guide

## Overview

This document outlines ChatSphere's security architecture, threat model, and best practices.

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Layers                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Transport (HTTPS, TLS 1.3)                           │
│  Layer 2: Headers (CSP, HSTS, X-Frame-Options)                 │
│  Layer 3: Rate Limiting (API + Socket flood control)            │
│  Layer 4: Authentication (JWT + OAuth)                          │
│  Layer 5: Authorization (RBAC: admin/moderator/member)          │
│  Layer 6: Input Validation (sanitize, validate, escape)         │
│  Layer 7: Data Protection (bcrypt, httpOnly cookies)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication

### JWT Token Strategy

```
Access Token (15 min)
├── Stored in memory/localStorage
├── Sent in Authorization header
├── Contains: userId, username, email
└── Short-lived limits exposure if stolen

Refresh Token (7 days)
├── Stored in httpOnly cookie
├── Cannot be read by JavaScript
├── Rotated on each use
└── Used to obtain new access tokens
```

### Token Security

- **Access tokens**: Short TTL (15 min) limits damage if compromised
- **Refresh tokens**: httpOnly cookies prevent XSS theft
- **Token rotation**: Old refresh tokens invalidated on use
- **Secure flags**: httpOnly, sameSite, secure (production)

### Google OAuth

- OAuth 2.0 flow with Google
- No passwords stored for OAuth users
- Google ID stored for account linking

---

## Authorization

### Role-Based Access Control (RBAC)

```
Creator (room owner)
├── Full control over room
├── Can manage all members
└── Can delete room

Admin
├── Can manage moderators and members
├── Can pin/unpin messages
└── Can delete any message

Moderator
├── Can manage members
├── Can pin/unpin messages
└── Can delete any message

Member
├── Can send messages
├── Can react to messages
└── Can edit own messages
```

### Permission Checks

Every protected operation checks:
1. Authentication (is user logged in?)
2. Membership (is user in this room?)
3. Role (does user have required role?)
4. Ownership (is this user's own resource?)

---

## Input Validation

### Server-Side Validation

```javascript
// All inputs validated before processing
validateRoom: [
  requireBodyFields(['name']),
  validateStringLength('name', 1, 50),
  validateEnum('visibility', ['public', 'private']),
  sanitizeHtml(['name', 'description']),
]
```

### Validation Rules

| Input | Rule | Purpose |
|-------|------|---------|
| Username | 3-30 chars, alphanumeric | Prevent abuse |
| Email | Valid format | Ensure deliverability |
| Password | 8-128 chars | Minimum security |
| Message | 1-4000 chars | Prevent spam |
| Room name | 1-50 chars | UI readability |
| File size | Configurable limit | Prevent DoS |

### XSS Prevention

1. **React auto-escapes** rendered content
2. **sanitizeHtml middleware** strips tags from input
3. **Content-Security-Policy** restricts script sources
4. **Markdown rendering** sanitizes HTML in AI responses

---

## Rate Limiting

### API Rate Limiting

```javascript
// 100 requests per 15 minutes per IP
app.use('/api', apiLimiter);
```

### Socket.IO Flood Control

```javascript
// 30 events per 10 seconds per socket
const FLOOD_MAX = 30;
const FLOOD_WINDOW = 10000; // 10 seconds
```

### AI Quota System

```javascript
// Per-user AI request limits
consumeAiQuota(`user:${userId}`);
```

---

## Security Headers

### Implemented Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: (production mode)
Strict-Transport-Security: max-age=31536000 (production)
```

### CSP Policy (Production)

```
default-src 'self'
script-src 'self'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https:
connect-src 'self' wss: https:
object-src 'none'
frame-src 'none'
```

---

## Data Protection

### Password Security

```javascript
// bcrypt with 12 salt rounds
const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(password, salt);
```

### Sensitive Data Handling

- Passwords never stored in plain text
- Password hashes never returned in API responses
- JWT secrets stored in environment variables
- API keys stored in .env (not committed)
- User settings sanitized before storage

### Database Security

- MongoDB authentication enabled in production
- Connection strings use credentials
- Queries use parameterized inputs (Mongoose)
- No raw `$where` or `$eval` operators

---

## Dependency Security

### Regular Audits

```powershell
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix
```

### Dependency Pinning

- Lock files (package-lock.json) committed
- Major versions pinned
- Regular updates for security patches

---

## Socket.IO Security

### Authentication

```javascript
// JWT verified on connection
io.use(socketAuthMiddleware);

// Token extracted from handshake
const token = socket.handshake.auth.token;
```

### Event Validation

Every socket event:
1. Checks flood control
2. Validates input
3. Verifies room membership
4. Checks permissions
5. Returns errors via acknowledgment

### Block System

```javascript
// Users can block others
// Blocked users cannot:
// - Send messages to blocker
// - Reply to blocker's messages
// - React to blocker's messages
```

---

## File Upload Security

### Allowed Types

```javascript
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain', 'text/markdown', 'text/csv',
  'application/json', 'application/xml',
  'text/javascript', 'application/javascript',
  'text/x-typescript', 'application/x-typescript',
];
```

### Size Limits

- Default: 5MB per file
- Configurable via environment variable
- Files stored outside web root

---

## Threat Model

### Threats Mitigated

| Threat | Mitigation |
|--------|------------|
| XSS | React escaping, CSP, input sanitization |
| CSRF | SameSite cookies, origin checks |
| Clickjacking | X-Frame-Options: DENY |
| Token theft | httpOnly cookies, short TTL |
| Brute force | Rate limiting, account lockout |
| SQL Injection | Mongoose ODM (no raw queries) |
| DoS | Rate limiting, body size limits |
| Prompt injection | Input validation, output sanitization |

### Residual Risks

| Risk | Notes |
|------|-------|
| AI hallucination | AI responses may contain incorrect info |
| Social engineering | Users can be tricked into sharing info |
| Zero-day deps | Dependency vulnerabilities unknown |
| Insider threat | Admin users have elevated access |

---

## Security Checklist

### Pre-deployment

- [ ] HTTPS enabled
- [ ] Strong JWT secrets (64+ chars)
- [ ] CORS restricted to production domain
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] MongoDB authentication enabled
- [ ] Environment variables secured
- [ ] Dependencies audited
- [ ] File upload limits set
- [ ] Error messages don't leak info

### Runtime Monitoring

- [ ] Failed login attempts logged
- [ ] Rate limit violations logged
- [ ] Unusual API patterns detected
- [ ] Error rates monitored
- [ ] Uptime monitored

---

## Incident Response

### If a Breach is Suspected

1. **Rotate secrets**: Change JWT secrets, API keys
2. **Force logout**: Invalidate all sessions
3. **Check logs**: Identify affected accounts
4. **Notify users**: If data was exposed
5. **Patch vulnerability**: Fix the root cause
6. **Document**: Record incident details

### Contact

For security issues, please email: security@chatsphere.app (placeholder)

---

## Best Practices for Developers

### DO

- Validate all input on the server
- Use parameterized queries (Mongoose)
- Hash passwords with bcrypt
- Use HTTPS in production
- Keep dependencies updated
- Log security events
- Follow principle of least privilege

### DON'T

- Trust client-side validation alone
- Store secrets in code
- Use `eval()` or `new Function()`
- Expose stack traces in production
- Skip authentication checks
- Use weak passwords/secrets
- Commit .env files
