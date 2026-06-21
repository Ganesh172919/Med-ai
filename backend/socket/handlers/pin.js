/**
 * =============================================================================
 * Pin/Unpin Socket Event Handlers
 * =============================================================================
 *
 * PURPOSE:
 * Handles pinning and unpinning of messages in group chat rooms.
 * Pinned messages are displayed in a separate panel for easy reference.
 *
 * EVENTS:
 * - pin_message({roomId, messageId}, callback) — Pin a message
 * - unpin_message({roomId, messageId}, callback) — Unpin a message
 *
 * PERMISSIONS:
 * Only room moderators and admins can pin/unpin messages.
 * Deleted messages cannot be pinned.
 * =============================================================================
 */

const Room = require('../../models/Room');
const Message = require('../../models/Message');
const { isValidObjectId, findRoomMember, hasRoomRole } = require('../../helpers/validate');
const {
  isFlooded, getAck, emitSocketError,
  isSocketInRoom,
} = require('../helpers');

/**
 * Register pin/unpin socket event handlers.
 *
 * @param {Socket} socket - The authenticated socket instance
 * @param {Server} io - The Socket.IO server instance
 */
function registerPinHandlers(socket, io) {
  /**
   * pin_message — Pin a message in a room (mod/admin only).
   *
   * FLOW:
   * 1. Validate IDs and room membership
   * 2. Check moderator/admin permission
   * 3. Load message and verify it's not deleted
   * 4. Mark as pinned
   * 5. Add to room's pinned messages list
   * 6. Broadcast message_pinned to room
   */
  socket.on('pin_message', async ({ roomId, messageId }, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;

    try {
      if (!isValidObjectId(messageId) || !isValidObjectId(roomId)) {
        return emitSocketError(socket, ack, 'Invalid room or message ID');
      }

      const room = await Room.findById(roomId).select('members creatorId pinnedMessages');
      if (!room || !findRoomMember(room, socket.user.id)) {
        return emitSocketError(socket, ack, 'Join this room before pinning messages');
      }

      if (!isSocketInRoom(roomId, socket.id)) {
        return emitSocketError(socket, ack, 'Join the room before pinning messages');
      }

      if (!hasRoomRole(room, socket.user.id, ['admin', 'moderator'])) {
        return emitSocketError(socket, ack, 'Only room moderators can pin messages');
      }

      const msg = await Message.findById(messageId);
      if (!msg || msg.roomId.toString() !== roomId.toString()) {
        return emitSocketError(socket, ack, 'Message not found in this room');
      }

      if (msg.isDeleted) {
        return emitSocketError(socket, ack, 'Deleted messages cannot be pinned');
      }

      msg.isPinned = true;
      msg.pinnedBy = socket.user.username;
      msg.pinnedAt = new Date();
      await msg.save();

      if (!room.pinnedMessages.some((id) => id.toString() === messageId.toString())) {
        room.pinnedMessages.push(msg._id);
        await room.save();
      }

      io.to(roomId).emit('message_pinned', {
        messageId,
        pinnedBy: socket.user.username,
        message: {
          id: msg._id.toString(),
          content: msg.content,
          username: msg.username,
          timestamp: msg.createdAt,
          pinnedBy: socket.user.username,
          pinnedAt: msg.pinnedAt,
        },
      });

      ack({ success: true, messageId });
    } catch (err) {
      console.error('Pin message error:', err);
      emitSocketError(socket, ack, 'Failed to pin message');
    }
  });

  /**
   * unpin_message — Unpin a message in a room (mod/admin only).
   *
   * FLOW:
   * 1. Validate IDs and room membership
   * 2. Check moderator/admin permission
   * 3. Remove pin status from message
   * 4. Remove from room's pinned messages list
   * 5. Broadcast message_unpinned to room
   */
  socket.on('unpin_message', async ({ roomId, messageId }, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;

    try {
      if (!isValidObjectId(messageId) || !isValidObjectId(roomId)) {
        return emitSocketError(socket, ack, 'Invalid room or message ID');
      }

      const room = await Room.findById(roomId).select('members creatorId pinnedMessages');
      if (!room || !findRoomMember(room, socket.user.id)) {
        return emitSocketError(socket, ack, 'Join this room before unpinning messages');
      }

      if (!isSocketInRoom(roomId, socket.id)) {
        return emitSocketError(socket, ack, 'Join the room before unpinning messages');
      }

      if (!hasRoomRole(room, socket.user.id, ['admin', 'moderator'])) {
        return emitSocketError(socket, ack, 'Only room moderators can unpin messages');
      }

      const msg = await Message.findById(messageId);
      if (msg && msg.roomId.toString() === roomId.toString()) {
        msg.isPinned = false;
        msg.pinnedBy = null;
        msg.pinnedAt = null;
        await msg.save();
      }

      room.pinnedMessages = room.pinnedMessages.filter(
        (id) => id.toString() !== messageId.toString()
      );
      await room.save();

      io.to(roomId).emit('message_unpinned', { messageId });
      ack({ success: true, messageId });
    } catch (err) {
      console.error('Unpin message error:', err);
      emitSocketError(socket, ack, 'Failed to unpin message');
    }
  });
}

module.exports = { registerPinHandlers };
