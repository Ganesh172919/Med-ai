/**
 * =============================================================================
 * Socket.IO Shared State
 * =============================================================================
 *
 * PURPOSE:
 * Centralizes all in-memory real-time state used by Socket.IO handlers.
 * Extracting state into its own module allows handlers to import shared
 * state without circular dependencies.
 *
 * WHY IN-MEMORY (NOT REDIS/MONGODB):
 * - Speed: Socket events fire hundreds of times per second
 * - Ephemeral: Typing indicators, online status change constantly
 * - Scope: State is per-server-instance, not shared
 *
 * SCALING CONSIDERATION:
 * When running multiple server instances (horizontal scaling), this in-memory
 * state becomes a problem. Solution: Use Redis adapter for Socket.IO and store
 * presence/typing state in Redis. This is the standard pattern for multi-instance
 * Socket.IO deployments.
 *
 * DATA STRUCTURES:
 * - roomUsers: Map<roomId, Map<socketId, {id, username}>>
 *   Two-level map allows O(1) lookup by room AND by socket.
 *
 * - globalOnlineUsers: Map<userId, {socketId, username}>
 *   Tracks which users are online across all rooms.
 *
 * - typingUsers: Map<roomId, Map<userId, {username, timeout}>>
 *   Tracks typing indicators with auto-clear timeouts.
 *
 * - socketFlood: Map<socketId, {count, resetTime}>
 *   Token bucket flood control per socket connection.
 * =============================================================================
 */

// Track online users per room: Map<roomId, Map<socketId, {id, username}>>
const roomUsers = new Map();

// Track global online users: Map<userId, {socketId, username}>
const globalOnlineUsers = new Map();

// Track typing state: Map<roomId, Map<userId, {username, timeout}>>
const typingUsers = new Map();

// Socket flood control: Map<socketId, { count, resetTime }>
const socketFlood = new Map();

// Flood control constants
const FLOOD_MAX = 30;       // max events per window
const FLOOD_WINDOW = 10000; // 10 seconds

// Reaction allowlist — only these emojis are permitted
const ALLOWED_REACTIONS = new Set(['👍', '🔥', '🤯', '💡']);

// Edit window for messages (default 15 minutes)
const EDIT_WINDOW_MS = (parseInt(process.env.MESSAGE_EDIT_WINDOW_MINUTES, 10) || 15) * 60 * 1000;

// AI bot display name
const AI_USERNAME = process.env.GEMINI_GROUP_BOT_NAME || 'Gemini';

module.exports = {
  roomUsers,
  globalOnlineUsers,
  typingUsers,
  socketFlood,
  FLOOD_MAX,
  FLOOD_WINDOW,
  ALLOWED_REACTIONS,
  EDIT_WINDOW_MS,
  AI_USERNAME,
};
