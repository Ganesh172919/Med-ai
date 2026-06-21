# ChatSphere API Documentation

## Overview

ChatSphere's backend exposes a REST API built with Express.js and a real-time WebSocket API via Socket.IO. All REST endpoints are prefixed with `/api`.

**Base URL**: `http://localhost:3000/api`

**Authentication**: JWT Bearer token in `Authorization` header

---

## Authentication

### Register

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": null,
    "displayName": "john_doe",
    "isAdmin": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Google OAuth

```
GET /api/auth/google
```

Redirects to Google OAuth consent screen.

```
GET /api/auth/google/callback
```

Handles Google OAuth callback, returns JWT tokens.

### Refresh Token

```
POST /api/auth/refresh
```

**Cookies:** `refreshToken` (httpOnly cookie)

**Response (200):**
```json
{
  "success": true,
  "accessToken": "new_access_token..."
}
```

### Forgot Password

```
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password

```
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

---

## Chat (Solo AI)

### Send Message

```
POST /api/chat
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Explain how neural networks work",
  "modelId": "openai/gpt-5.4-mini",
  "conversationId": "conv_abc123",
  "attachment": {
    "fileUrl": "/uploads/file.pdf",
    "fileName": "document.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Neural networks are...",
    "modelId": "openai/gpt-5.4-mini",
    "provider": "openrouter",
    "processingMs": 1234,
    "promptTokens": 150,
    "completionTokens": 300,
    "totalTokens": 450
  },
  "conversationId": "conv_abc123"
}
```

### List Conversations

```
GET /api/conversations
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "conv_abc123",
      "title": "Neural Networks Discussion",
      "messageCount": 5,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T11:00:00Z"
    }
  ]
}
```

### Get Conversation Messages

```
GET /api/conversations/:conversationId
Authorization: Bearer <token>
```

### Delete Conversation

```
DELETE /api/conversations/:conversationId
Authorization: Bearer <token>
```

### Run Conversation Insight

```
POST /api/conversations/:conversationId/insight
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "action": "summarize",
  "modelId": "openai/gpt-5.4-mini"
}
```

**Actions:** `summarize`, `extract-tasks`, `extract-decisions`

---

## Rooms

### List Rooms

```
GET /api/rooms
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` - Filter by name/description
- `tag` - Filter by tag
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Create Room

```
POST /api/rooms
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "AI Research Lab",
  "description": "Discuss latest AI research papers",
  "tags": ["ai", "research", "ml"],
  "maxUsers": 50,
  "visibility": "public"
}
```

### Join Room

```
POST /api/rooms/:roomId/join
Authorization: Bearer <token>
```

### Leave Room

```
POST /api/rooms/:roomId/leave
Authorization: Bearer <token>
```

### Get Room Details

```
GET /api/rooms/:roomId
Authorization: Bearer <token>
```

### Update Room Settings

```
PATCH /api/rooms/:roomId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Room Name",
  "description": "Updated description",
  "maxUsers": 100
}
```

---

## AI

### List Available Models

```
GET /api/ai/models
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "models": [
    {
      "id": "openai/gpt-5.4-mini",
      "provider": "openrouter",
      "label": "GPT-5.4 Mini",
      "supportsFiles": true
    },
    {
      "id": "gemini-2.5-flash",
      "provider": "gemini",
      "label": "Gemini 2.5 Flash (Gemini Direct)",
      "supportsFiles": true
    }
  ],
  "defaultModelId": "openai/gpt-5.4-mini",
  "emptyStateMessage": null
}
```

### Refresh Model Catalogs

```
POST /api/ai/models/refresh
Authorization: Bearer <token>
```

---

## Users

### Get Current User

```
GET /api/users/me
Authorization: Bearer <token>
```

### Update Profile

```
PATCH /api/users/me
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "displayName": "John",
  "bio": "AI enthusiast",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Get User by ID

```
GET /api/users/:userId
Authorization: Bearer <token>
```

---

## Search

### Full-Text Search

```
GET /api/search?q=neural+networks
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` - Search query (required)
- `type` - Filter: `messages`, `rooms`, `users` (optional)
- `limit` - Results per type (default: 20)

---

## Memory

### List Memory Entries

```
GET /api/memory
Authorization: Bearer <token>
```

### Create Memory Entry

```
POST /api/memory
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "summary": "User prefers Python over JavaScript",
  "tags": ["preference", "programming"]
}
```

### Delete Memory Entry

```
DELETE /api/memory/:memoryId
Authorization: Bearer <token>
```

---

## Projects

### List Projects

```
GET /api/projects
Authorization: Bearer <token>
```

### Create Project

```
POST /api/projects
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My AI Project",
  "description": "Building a chatbot",
  "instructions": "Focus on natural language understanding",
  "tags": ["ai", "chatbot"]
}
```

---

## Polls

### Create Poll

```
POST /api/polls
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "roomId": "room_abc123",
  "question": "Which AI model should we use?",
  "options": ["GPT-5", "Claude", "Gemini"],
  "expiresIn": 3600
}
```

### Vote on Poll

```
POST /api/polls/:pollId/vote
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "optionIndex": 0
}
```

---

## Admin

### Get Dashboard Stats

```
GET /api/admin/stats
Authorization: Bearer <token>
```

*Requires admin privileges*

### List All Users

```
GET /api/admin/users
Authorization: Bearer <token>
```

### Ban User

```
POST /api/admin/users/:userId/ban
Authorization: Bearer <token>
```

---

## Health Check

```
GET /api/health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "db": "mongodb"
}
```

---

## Socket.IO Events

### Connection

Connect with JWT token:
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_token' }
});
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticate` | `{}` | Verify connection |
| `join_room` | `roomId` | Join a chat room |
| `leave_room` | `roomId` | Leave a chat room |
| `send_message` | `{roomId, content, fileUrl?, fileName?, fileType?, fileSize?}` | Send message |
| `reply_message` | `{roomId, content, replyToId}` | Reply to message |
| `add_reaction` | `{roomId, messageId, emoji}` | Toggle reaction |
| `edit_message` | `{roomId, messageId, newContent}` | Edit message (15min window) |
| `delete_message` | `{roomId, messageId}` | Soft delete message |
| `pin_message` | `{roomId, messageId}` | Pin message (mod/admin) |
| `unpin_message` | `{roomId, messageId}` | Unpin message |
| `mark_read` | `{roomId, messageIds[]}` | Mark messages as read |
| `typing_start` | `{roomId}` | Start typing indicator |
| `typing_stop` | `{roomId}` | Stop typing indicator |
| `trigger_ai` | `{roomId, prompt, modelId?, attachment?}` | Trigger AI in room |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | `{id, userId, username, content, timestamp, ...}` | New message |
| `ai_response` | `{id, content, isAI, modelId, provider, ...}` | AI response |
| `ai_thinking` | `{roomId, status}` | AI processing indicator |
| `user_joined` | `{username, userId}` | User joined room |
| `user_left` | `{username, userId}` | User left room |
| `room_users` | `[{id, username}]` | Online users in room |
| `user_status_change` | `{userId, username, status}` | Global status change |
| `typing_start` | `{userId, username}` | User started typing |
| `typing_stop` | `{userId, username}` | User stopped typing |
| `message_edited` | `{messageId, content, isEdited, editedAt}` | Message edited |
| `message_deleted` | `{messageId, deletedBy}` | Message deleted |
| `message_pinned` | `{messageId, pinnedBy, message}` | Message pinned |
| `message_unpinned` | `{messageId}` | Message unpinned |
| `message_read` | `{messageIds[], readBy, username}` | Read receipt |
| `message_status_update` | `{messageId, status}` | Delivery status |
| `reaction_update` | `{messageId, reactions}` | Reaction changed |
| `error_message` | `{success: false, error, ...}` | Error notification |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

### Socket Error Codes

| Code | Meaning |
|------|---------|
| `TOKEN_EXPIRED` | JWT expired, need refresh |
| `AI_RATE_LIMITED` | AI quota exceeded |
| `AI_MODEL_UNAVAILABLE` | Selected model not available |
| `AI_PROVIDER_CREDIT_EXHAUSTED` | Provider billing issue |

---

## Rate Limiting

- **REST API**: 100 requests per 15 minutes per IP
- **Socket.IO**: 30 events per 10 seconds per socket
- **AI Requests**: Per-user quota (configurable)

---

## File Uploads

```
POST /api/uploads
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Supported Types:**
- Images: JPEG, PNG, GIF, WebP (max 3MB for AI analysis)
- Documents: PDF, TXT, MD, CSV, JSON, XML
- Code: JS, TS, JSX, TSX

**Response:**
```json
{
  "success": true,
  "file": {
    "url": "/uploads/abc123.pdf",
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 1024000
  }
}
```
