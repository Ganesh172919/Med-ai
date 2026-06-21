/**
 * =============================================================================
 * Socket.IO Helper Functions
 * =============================================================================
 *
 * PURPOSE:
 * Common utility functions used across all socket event handlers.
 * Extracted to reduce duplication and centralize error handling patterns.
 *
 * PATTERN: Utility Module
 * Pure functions that operate on the shared state from state.js.
 * No side effects except flood control state mutations.
 * =============================================================================
 */

const { roomUsers, typingUsers, socketFlood, FLOOD_MAX, FLOOD_WINDOW } = require('./state');
const User = require('../models/User');
const { isValidObjectId } = require('../helpers/validate');

// =============================================================================
// FLOOD CONTROL
// =============================================================================
// Token bucket algorithm - each socket gets 30 events per 10-second window.
// This prevents abuse while allowing normal chat activity.

/**
 * Check if a socket is exceeding the rate limit (flood control).
 *
 * PATTERN: Token bucket with fixed window
 * - Each socket gets FLOOD_MAX tokens per FLOOD_WINDOW milliseconds
 * - Counter resets when window expires
 * - Returns true if flooded (over limit)
 *
 * @param {string} socketId - The socket's unique identifier
 * @returns {boolean} true if the socket should be rate-limited
 */
function checkFlood(socketId) {
  const now = Date.now();
  let entry = socketFlood.get(socketId);
  if (!entry || now > entry.resetTime) {
    entry = { count: 1, resetTime: now + FLOOD_WINDOW };
    socketFlood.set(socketId, entry);
    return false;
  }
  entry.count++;
  return entry.count > FLOOD_MAX;
}

/**
 * Get acknowledgment callback, defaulting to no-op if not provided.
 * Socket.IO acknowledgments are optional — this ensures handlers
 * never crash if the client doesn't pass a callback.
 *
 * @param {Function|any} callback - The client's ack callback
 * @returns {Function} A safe callback function
 */
function getAck(callback) {
  return typeof callback === 'function' ? callback : () => {};
}

/**
 * Emit an error to a socket and call the acknowledgment callback.
 * Centralizes error emission pattern used in every event handler.
 *
 * @param {Socket} socket - The Socket.IO socket instance
 * @param {Function} ack - The acknowledgment callback
 * @param {string} error - Human-readable error message
 * @param {Object} details - Additional error details to include
 */
function emitSocketError(socket, ack, error, details = {}) {
  const payload = { success: false, error, ...details };
  socket.emit('error_message', payload);
  ack(payload);
}

/**
 * Check flood control and emit error if flooded.
 * Combines the flood check and error emission into one call.
 *
 * @param {Socket} socket - The Socket.IO socket instance
 * @param {Function} ack - The acknowledgment callback
 * @returns {boolean} true if the socket is flooded (caller should return)
 */
function isFlooded(socket, ack) {
  if (!checkFlood(socket.id)) return false;
  emitSocketError(socket, ack, 'Too many actions in a short time. Please slow down.');
  return true;
}

// =============================================================================
// ROOM PRESENCE MANAGEMENT
// =============================================================================
// These functions manage the roomUsers Map which tracks which sockets
// are in which rooms. This is critical for:
// - Broadcasting messages only to room members
// - Tracking online users per room
// - Cleaning up on disconnect

/**
 * Get list of online users in a room.
 *
 * @param {string} roomId - The room ID
 * @returns {Array<{id: string, username: string}>} List of online users
 */
function getRoomOnlineUsers(roomId) {
  const users = roomUsers.get(roomId);
  if (!users) return [];
  return Array.from(users.values());
}

/**
 * Check if a socket is currently in a specific room.
 *
 * @param {string} roomId - The room ID
 * @param {string} socketId - The socket ID
 * @returns {boolean} true if the socket is in the room
 */
function isSocketInRoom(roomId, socketId) {
  return Boolean(roomUsers.get(roomId)?.has(socketId));
}

/**
 * Add a user to a room's online user tracking.
 * Creates the room entry if it doesn't exist.
 *
 * @param {string} roomId - The room ID
 * @param {string} socketId - The socket ID
 * @param {Object} user - User object with id and username
 */
function addUserToRoom(roomId, socketId, user) {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Map());
  }
  roomUsers.get(roomId).set(socketId, { id: user.id, username: user.username });
}

/**
 * Remove a user from a room's online user tracking.
 * Cleans up the room entry if it becomes empty.
 *
 * @param {string} roomId - The room ID
 * @param {string} socketId - The socket ID
 * @returns {Object|null} The removed user data, or null if not found
 */
function removeUserFromRoom(roomId, socketId) {
  const users = roomUsers.get(roomId);
  if (users) {
    const user = users.get(socketId);
    users.delete(socketId);
    if (users.size === 0) {
      roomUsers.delete(roomId);
    }
    return user;
  }
  return null;
}

/**
 * Remove a socket from ALL rooms it's connected to.
 * Used during disconnect to ensure clean state.
 *
 * @param {string} socketId - The socket ID
 * @returns {Array<{roomId: string, user: Object}>} List of rooms the user left
 */
function removeUserFromAllRooms(socketId) {
  const leftRooms = [];
  for (const [roomId, users] of roomUsers.entries()) {
    if (users.has(socketId)) {
      const user = users.get(socketId);
      users.delete(socketId);
      if (users.size === 0) {
        roomUsers.delete(roomId);
      }
      leftRooms.push({ roomId, user });
    }
  }
  return leftRooms;
}

// =============================================================================
// TYPING STATE MANAGEMENT
// =============================================================================

/**
 * Clear typing state for a user in a room.
 * Cleans up the timeout and removes the typing entry.
 *
 * @param {string} roomId - The room ID
 * @param {string} userId - The user ID
 */
function clearTyping(roomId, userId) {
  const roomTyping = typingUsers.get(roomId);
  if (roomTyping) {
    const typing = roomTyping.get(userId);
    if (typing) {
      clearTimeout(typing.timeout);
      roomTyping.delete(userId);
      if (roomTyping.size === 0) {
        typingUsers.delete(roomId);
      }
    }
  }
}

// =============================================================================
// BLOCKING RELATIONSHIP CHECK
// =============================================================================
// Shared by message.js and reaction.js handlers to check if two users
// have blocked each other. Prevents interactions between blocked users.

/**
 * Check if two users have a blocking relationship.
 * Returns true if either user has blocked the other.
 *
 * WHY: Both message replies and reactions need to verify that users
 * haven't blocked each other. This was previously duplicated in both
 * handler files — centralized here for DRY.
 *
 * COMPLEXITY: O(1) database lookups (two indexed findById queries)
 *
 * @param {string} userId - First user ID
 * @param {string} otherUserId - Second user ID
 * @returns {Promise<boolean>} true if there's a blocking relationship
 */
async function hasBlockingRelationship(userId, otherUserId) {
  if (!isValidObjectId(userId) || !isValidObjectId(otherUserId)) return false;
  const [user, otherUser] = await Promise.all([
    User.findById(userId).select('blockedUsers').lean(),
    User.findById(otherUserId).select('blockedUsers').lean(),
  ]);
  const userBlocked = (user?.blockedUsers || []).some(
    (blockedId) => blockedId.toString() === otherUserId.toString()
  );
  const otherUserBlocked = (otherUser?.blockedUsers || []).some(
    (blockedId) => blockedId.toString() === userId.toString()
  );
  return userBlocked || otherUserBlocked;
}

module.exports = {
  checkFlood,
  getAck,
  emitSocketError,
  isFlooded,
  getRoomOnlineUsers,
  isSocketInRoom,
  addUserToRoom,
  removeUserFromRoom,
  removeUserFromAllRooms,
  clearTyping,
  hasBlockingRelationship,
};
