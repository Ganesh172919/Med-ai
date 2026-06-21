/**
 * =============================================================================
 * Typing Indicator Socket Event Handlers
 * =============================================================================
 *
 * PURPOSE:
 * Manages typing indicators for real-time chat rooms.
 * Shows "User is typing..." to other room members.
 *
 * EVENTS:
 * - typing_start({roomId}, callback) — User started typing
 * - typing_stop({roomId}, callback) — User stopped typing
 *
 * AUTO-CLEAR:
 * Typing indicators automatically clear after 3 seconds to prevent
 * stale "typing" states from lingering if a user closes the tab.
 * =============================================================================
 */

const { typingUsers } = require('../state');
const {
  isFlooded, getAck, emitSocketError,
  isSocketInRoom, clearTyping,
} = require('../helpers');

/**
 * Register typing-related socket event handlers.
 *
 * @param {Socket} socket - The authenticated socket instance
 * @param {Server} io - The Socket.IO server instance
 */
function registerTypingHandlers(socket, io) {
  /**
   * typing_start — User started typing in a room.
   *
   * FLOW:
   * 1. Validate room membership
   * 2. Clear any existing typing timeout
   * 3. Set a 3-second auto-clear timeout
   * 4. Broadcast typing_start to other room members
   */
  socket.on('typing_start', ({ roomId } = {}, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;
    if (!roomId || !isSocketInRoom(roomId, socket.id)) {
      return emitSocketError(socket, ack, 'Join the room before sending typing updates');
    }

    clearTyping(roomId, socket.user.id);

    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Map());
    }

    // Auto-clear after 3 seconds
    const timeout = setTimeout(() => {
      clearTyping(roomId, socket.user.id);
      socket.to(roomId).emit('typing_stop', {
        userId: socket.user.id,
        username: socket.user.username,
      });
    }, 3000);

    typingUsers.get(roomId).set(socket.user.id, {
      username: socket.user.username,
      timeout,
    });

    socket.to(roomId).emit('typing_start', {
      userId: socket.user.id,
      username: socket.user.username,
    });

    ack({ success: true });
  });

  /**
   * typing_stop — User stopped typing in a room.
   *
   * FLOW:
   * 1. Validate room membership
   * 2. Clear typing state and timeout
   * 3. Broadcast typing_stop to other room members
   */
  socket.on('typing_stop', ({ roomId } = {}, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;
    if (!roomId || !isSocketInRoom(roomId, socket.id)) {
      return emitSocketError(socket, ack, 'Join the room before sending typing updates');
    }
    clearTyping(roomId, socket.user.id);
    socket.to(roomId).emit('typing_stop', {
      userId: socket.user.id,
      username: socket.user.username,
    });
    ack({ success: true });
  });
}

module.exports = { registerTypingHandlers };
