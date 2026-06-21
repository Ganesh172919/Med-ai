/**
 * =============================================================================
 * Room Socket Event Handlers
 * =============================================================================
 *
 * PURPOSE:
 * Handles join_room and leave_room socket events.
 * Manages room membership for real-time connections.
 *
 * EVENTS:
 * - join_room(roomId, callback) — Join a room's real-time channel
 * - leave_room(roomId, callback) — Leave a room's real-time channel
 * =============================================================================
 */

const Room = require('../../models/Room');
const Message = require('../../models/Message');
const { isValidObjectId, findRoomMember } = require('../../helpers/validate');
const {
  isFlooded, getAck, emitSocketError,
  isSocketInRoom, addUserToRoom, removeUserFromRoom, removeUserFromAllRooms,
  getRoomOnlineUsers, clearTyping,
} = require('../helpers');

/**
 * Register room-related socket event handlers.
 *
 * @param {Socket} socket - The authenticated socket instance
 * @param {Server} io - The Socket.IO server instance
 */
function registerRoomHandlers(socket, io) {
  /**
   * join_room — Join a room's real-time channel.
   *
   * FLOW:
   * 1. Validate room ID and check membership
   * 2. Leave all previous rooms (one room at a time)
   * 3. Join the new room
   * 4. Broadcast user_joined and room_users
   * 5. Mark unread messages as delivered
   */
  socket.on('join_room', async (roomId, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;

    try {
      console.log(`→ [ROOM] ${socket.user.username} requested join_room for ${roomId}`);

      if (!isValidObjectId(roomId)) {
        return emitSocketError(socket, ack, 'Invalid room ID');
      }

      const room = await Room.findById(roomId).select('members maxUsers');
      if (!room) {
        return emitSocketError(socket, ack, 'Room not found');
      }

      if (!findRoomMember(room, socket.user.id)) {
        return emitSocketError(socket, ack, 'Join this room before connecting to chat');
      }

      if (isSocketInRoom(roomId, socket.id)) {
        io.to(roomId).emit('room_users', getRoomOnlineUsers(roomId));
        return ack({ success: true, roomId });
      }

      // Leave previous rooms
      const leftRooms = removeUserFromAllRooms(socket.id);
      leftRooms.forEach(({ roomId: leftRoomId, user }) => {
        clearTyping(leftRoomId, user.id);
        socket.leave(leftRoomId);
        io.to(leftRoomId).emit('user_left', { username: user.username, userId: user.id });
        io.to(leftRoomId).emit('room_users', getRoomOnlineUsers(leftRoomId));
      });

      socket.join(roomId);
      addUserToRoom(roomId, socket.id, socket.user);

      io.to(roomId).emit('user_joined', { username: socket.user.username, userId: socket.user.id });
      io.to(roomId).emit('room_users', getRoomOnlineUsers(roomId));

      // Mark unread messages as delivered
      await Message.updateMany(
        { roomId, status: 'sent', userId: { $ne: socket.user.id } },
        { $set: { status: 'delivered' } }
      );

      console.log(`✦ [ROOM] ${socket.user.username} joined room ${roomId}`);
      ack({ success: true, roomId });
    } catch (err) {
      console.error(`✗ [ROOM] join_room failed for ${socket.user.username}:`, err.stack || err.message);
      emitSocketError(socket, ack, 'Failed to join room');
    }
  });

  /**
   * leave_room — Leave a room's real-time channel.
   *
   * FLOW:
   * 1. Validate socket is in the room
   * 2. Clear typing state
   * 3. Remove from room tracking
   * 4. Broadcast user_left and room_users
   */
  socket.on('leave_room', (roomId, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;
    if (!roomId || !isSocketInRoom(roomId, socket.id)) {
      return emitSocketError(socket, ack, 'You are not connected to that room');
    }

    clearTyping(roomId, socket.user.id);
    const user = removeUserFromRoom(roomId, socket.id);
    socket.leave(roomId);
    if (user) {
      io.to(roomId).emit('user_left', { username: user.username, userId: user.id });
      io.to(roomId).emit('room_users', getRoomOnlineUsers(roomId));
    }
    ack({ success: true, roomId });
  });
}

module.exports = { registerRoomHandlers };
