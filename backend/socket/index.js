/**
 * =============================================================================
 * Socket.IO Module Index
 * =============================================================================
 *
 * PURPOSE:
 * Wires together all socket event handlers and manages the connection lifecycle.
 * This is the single entry point for Socket.IO configuration.
 *
 * ARCHITECTURE:
 * Instead of a 700+ line monolithic handler in index.js, socket logic is
 * decomposed into focused handler modules:
 *   - handlers/room.js — join_room, leave_room
 *   - handlers/typing.js — typing_start, typing_stop
 *   - handlers/message.js — send, reply, edit, delete, mark_read
 *   - handlers/reaction.js — add_reaction
 *   - handlers/ai.js — trigger_ai
 *   - handlers/pin.js — pin_message, unpin_message
 *
 * CONNECTION LIFECYCLE:
 * 1. Client connects → JWT verified by socketAuth middleware
 * 2. socket.user is attached with {id, username, email}
 * 3. All event handlers are registered
 * 4. User joins rooms, sends messages, etc.
 * 5. On disconnect: cleanup all state
 * =============================================================================
 */

const User = require('../models/User');
const { globalOnlineUsers, socketFlood } = require('./state');
const { removeUserFromAllRooms, clearTyping, getRoomOnlineUsers } = require('./helpers');
const { registerRoomHandlers } = require('./handlers/room');
const { registerTypingHandlers } = require('./handlers/typing');
const { registerMessageHandlers } = require('./handlers/message');
const { registerReactionHandlers } = require('./handlers/reaction');
const { registerAIHandlers } = require('./handlers/ai');
const { registerPinHandlers } = require('./handlers/pin');

/**
 * Initialize Socket.IO event handling.
 *
 * @param {Server} io - The Socket.IO server instance
 */
function initializeSocketHandlers(io) {
  io.on('connection', async (socket) => {
    console.log(`✦ [SOCKET] User connected: ${socket.user.username} (${socket.id})`);

    // =========================================================================
    // CONNECTION SETUP
    // =========================================================================
    // Track global online status
    globalOnlineUsers.set(socket.user.id, { socketId: socket.id, username: socket.user.username });

    // Update user online status in DB
    try {
      await User.findByIdAndUpdate(socket.user.id, {
        onlineStatus: 'online',
        lastSeen: new Date(),
      });
    } catch (err) {
      console.error('Failed to update user status:', err.message);
    }

    // Broadcast presence
    io.emit('user_status_change', {
      userId: socket.user.id,
      username: socket.user.username,
      status: 'online',
    });

    // =========================================================================
    // AUTHENTICATE EVENT
    // =========================================================================
    socket.on('authenticate', (callback) => {
      if (typeof callback === 'function') {
        callback({ success: true, user: socket.user });
      }
    });

    // =========================================================================
    // REGISTER ALL EVENT HANDLERS
    // =========================================================================
    registerRoomHandlers(socket, io);
    registerTypingHandlers(socket, io);
    registerMessageHandlers(socket, io);
    registerReactionHandlers(socket, io);
    registerAIHandlers(socket, io);
    registerPinHandlers(socket, io);

    // =========================================================================
    // DISCONNECT
    // =========================================================================
    socket.on('disconnect', async () => {
      console.log(`→ [SOCKET] User disconnected: ${socket.user.username} (${socket.id})`);

      // Clean flood tracking
      socketFlood.delete(socket.id);

      // Remove from global online
      globalOnlineUsers.delete(socket.user.id);

      // Update DB status
      try {
        await User.findByIdAndUpdate(socket.user.id, {
          onlineStatus: 'offline',
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error('Failed to update user status on disconnect:', err.message);
      }

      // Broadcast offline status
      io.emit('user_status_change', {
        userId: socket.user.id,
        username: socket.user.username,
        status: 'offline',
      });

      // Clean up room presence
      const leftRooms = removeUserFromAllRooms(socket.id);
      leftRooms.forEach(({ roomId, user }) => {
        clearTyping(roomId, user.id);
        io.to(roomId).emit('user_left', { username: user.username, userId: user.id });
        io.to(roomId).emit('room_users', getRoomOnlineUsers(roomId));
      });
    });
  });
}

module.exports = { initializeSocketHandlers };
