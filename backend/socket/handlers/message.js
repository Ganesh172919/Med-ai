/**
 * =============================================================================
 * Message Socket Event Handlers
 * =============================================================================
 *
 * PURPOSE:
 * Handles message CRUD operations over Socket.IO.
 * Includes send, reply, edit, delete, and read receipts.
 *
 * EVENTS:
 * - send_message({roomId, content, fileUrl, ...}, callback) — Send a new message
 * - reply_message({roomId, content, replyToId}, callback) — Reply to a message
 * - edit_message({roomId, messageId, newContent}, callback) — Edit own message
 * - delete_message({roomId, messageId}, callback) — Soft-delete a message
 * - mark_read({roomId, messageIds}, callback) — Mark messages as read
 * =============================================================================
 */

const Room = require('../../models/Room');
const Message = require('../../models/Message');
const { isValidObjectId, findRoomMember, hasRoomRole } = require('../../helpers/validate');
const { validateAttachmentPayload } = require('../../services/messageFormatting');
const { formatMessage } = require('../formatMessage');
const {
  isFlooded, getAck, emitSocketError,
  isSocketInRoom, getRoomOnlineUsers, clearTyping,
  hasBlockingRelationship,
} = require('../helpers');
const { EDIT_WINDOW_MS } = require('../state');

// =============================================================================
// SHARED HELPERS
// =============================================================================

/**
 * Load a room and verify the user is a member.
 * Common pattern used by all message handlers.
 *
 * @param {string} roomId - The room ID
 * @param {string} userId - The user ID
 * @param {string} projection - Fields to select
 * @returns {{room: Object|null, error: string|null}}
 */
async function loadRoomForMember(roomId, userId, projection = 'members creatorId maxUsers aiHistory name') {
  if (!isValidObjectId(roomId)) {
    return { room: null, error: 'Invalid room ID' };
  }
  const room = await Room.findById(roomId).select(projection);
  if (!room) {
    return { room: null, error: 'Room not found' };
  }
  if (!findRoomMember(room, userId)) {
    return { room: null, error: 'Join this room before using chat actions' };
  }
  return { room, error: null };
}

/**
 * Upgrade a message to 'delivered' if other users are online in the room.
 *
 * @param {Object} message - The Mongoose message document
 * @param {string} roomId - The room ID
 * @param {Server} io - The Socket.IO server instance
 */
async function maybeMarkMessageDelivered(message, roomId, io) {
  const otherUsersOnline = getRoomOnlineUsers(roomId).some(
    (user) => user.id !== message.userId
  );
  if (!otherUsersOnline || message.status !== 'sent') {
    return;
  }
  message.status = 'delivered';
  await message.save();
  io.to(roomId).emit('message_status_update', {
    messageId: message._id.toString(),
    status: 'delivered',
  });
}

// =============================================================================
// HANDLER REGISTRATION
// =============================================================================

/**
 * Register message-related socket event handlers.
 *
 * @param {Socket} socket - The authenticated socket instance
 * @param {Server} io - The Socket.IO server instance
 */
function registerMessageHandlers(socket, io) {
  /**
   * send_message — Send a new message to a room.
   *
   * FLOW:
   * 1. Validate content and attachment
   * 2. Verify room membership
   * 3. Clear typing state
   * 4. Create and save message
   * 5. Mark as delivered if others are online
   * 6. Broadcast to room
   */
  socket.on('send_message', async ({ roomId, content, fileUrl, fileName, fileType, fileSize }, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;

    const textContent = typeof content === 'string' ? content.trim() : '';
    const hasFile = Boolean(fileUrl || fileName || fileType || fileSize);
    const attachmentError = validateAttachmentPayload({ fileUrl, fileName, fileType, fileSize });
    if (!textContent && !hasFile) {
      return emitSocketError(socket, ack, 'Message content or a file is required');
    }
    if (textContent.length > 4000) {
      return emitSocketError(socket, ack, 'Messages must be under 4000 characters');
    }
    if (attachmentError) {
      return emitSocketError(socket, ack, attachmentError);
    }

    try {
      const { room, error } = await loadRoomForMember(roomId, socket.user.id, 'members');
      if (error) return emitSocketError(socket, ack, error);

      if (!isSocketInRoom(roomId, socket.id)) {
        return emitSocketError(socket, ack, 'Join the room before sending messages');
      }

      clearTyping(roomId, socket.user.id);
      socket.to(roomId).emit('typing_stop', { userId: socket.user.id, username: socket.user.username });

      const msg = new Message({
        roomId,
        userId: socket.user.id,
        username: socket.user.username,
        content: textContent || fileName,
        isAI: false,
        status: 'sent',
        reactions: new Map(),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
      });
      await msg.save();

      await maybeMarkMessageDelivered(msg, roomId, io);
      const messageData = formatMessage(msg);
      io.to(roomId).emit('receive_message', messageData);

      ack({ success: true, messageId: msg._id.toString(), message: messageData, roomMemberCount: room.members.length });
    } catch (err) {
      console.error('Send message error:', err);
      emitSocketError(socket, ack, 'Failed to send message');
    }
  });

  /**
   * reply_message — Reply to an existing message in a room.
   *
   * FLOW:
   * 1. Validate content
   * 2. Verify room membership
   * 3. Load parent message and check for blocking
   * 4. Create reply with replyTo reference
   * 5. Broadcast to room
   */
  socket.on('reply_message', async ({ roomId, content, replyToId }, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;

    const textContent = typeof content === 'string' ? content.trim() : '';
    if (!textContent) return emitSocketError(socket, ack, 'Content is required');
    if (textContent.length > 4000) return emitSocketError(socket, ack, 'Replies must be under 4000 characters');

    try {
      const { error } = await loadRoomForMember(roomId, socket.user.id, 'members');
      if (error) return emitSocketError(socket, ack, error);
      if (!isSocketInRoom(roomId, socket.id)) {
        return emitSocketError(socket, ack, 'Join the room before replying');
      }

      clearTyping(roomId, socket.user.id);

      let replyTo = null;
      if (replyToId) {
        if (!isValidObjectId(replyToId)) {
          return emitSocketError(socket, ack, 'Invalid reply target');
        }
        const parentMsg = await Message.findById(replyToId).lean();
        if (!parentMsg || parentMsg.roomId.toString() !== roomId.toString()) {
          return emitSocketError(socket, ack, 'Reply target was not found in this room');
        }
        if (await hasBlockingRelationship(socket.user.id, parentMsg.userId)) {
          return emitSocketError(socket, ack, 'You cannot reply because one of you has blocked the other');
        }
        replyTo = {
          id: parentMsg._id.toString(),
          username: parentMsg.username,
          content: parentMsg.isDeleted ? '[deleted]' : parentMsg.content.substring(0, 100),
        };
      }

      const msg = new Message({
        roomId,
        userId: socket.user.id,
        username: socket.user.username,
        content: textContent,
        isAI: false,
        replyTo,
        status: 'sent',
        reactions: new Map(),
      });
      await msg.save();

      await maybeMarkMessageDelivered(msg, roomId, io);
      const messageData = formatMessage(msg);
      io.to(roomId).emit('receive_message', messageData);
      ack({ success: true, messageId: msg._id.toString(), message: messageData });
    } catch (err) {
      console.error('Reply message error:', err);
      emitSocketError(socket, ack, 'Failed to send reply');
    }
  });

  /**
   * edit_message — Edit an existing message (owner only, within time window).
   *
   * FLOW:
   * 1. Validate content and room membership
   * 2. Verify message exists and is not deleted
   * 3. Verify ownership and edit window
   * 4. Save edit history and update content
   * 5. Broadcast message_edited to room
   */
  socket.on('edit_message', async ({ roomId, messageId, newContent }, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;

    if (!newContent || newContent.trim().length === 0) {
      return emitSocketError(socket, ack, 'Content is required');
    }
    if (newContent.trim().length > 4000) {
      return emitSocketError(socket, ack, 'Messages must be under 4000 characters');
    }

    try {
      const { error } = await loadRoomForMember(roomId, socket.user.id, 'members');
      if (error) return emitSocketError(socket, ack, error);
      if (!isValidObjectId(messageId)) return emitSocketError(socket, ack, 'Invalid message ID');

      const msg = await Message.findById(messageId);
      if (!msg || msg.roomId.toString() !== roomId.toString()) return emitSocketError(socket, ack, 'Message not found in this room');
      if (msg.isDeleted) return emitSocketError(socket, ack, 'Cannot edit a deleted message');
      if (msg.isAI) return emitSocketError(socket, ack, 'Cannot edit AI messages');

      // Only the author can edit
      if (msg.userId !== socket.user.id) {
        return emitSocketError(socket, ack, 'You can only edit your own messages');
      }

      if (Date.now() - msg.createdAt.getTime() > EDIT_WINDOW_MS) {
        return emitSocketError(socket, ack, 'The edit window has expired');
      }

      if (!msg.originalContent) {
        msg.originalContent = msg.content;
      }

      msg.editHistory.push({
        content: msg.content,
        editedAt: new Date(),
      });
      msg.content = newContent.trim();
      msg.isEdited = true;
      msg.editedAt = new Date();
      await msg.save();

      io.to(roomId).emit('message_edited', {
        messageId: msg._id.toString(),
        content: msg.content,
        isEdited: true,
        editedAt: msg.editedAt,
      });

      ack({ success: true, messageId: msg._id.toString(), editedAt: msg.editedAt });
    } catch (err) {
      console.error('Edit message error:', err);
      emitSocketError(socket, ack, 'Failed to edit message');
    }
  });

  /**
   * delete_message — Soft-delete a message (owner or moderator/admin).
   *
   * FLOW:
   * 1. Validate IDs and room membership
   * 2. Verify ownership or moderator role
   * 3. Mark as deleted (soft delete)
   * 4. Remove from pinned messages if pinned
   * 5. Broadcast message_deleted to room
   */
  socket.on('delete_message', async ({ roomId, messageId }, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;

    try {
      if (!isValidObjectId(messageId) || !isValidObjectId(roomId)) {
        return emitSocketError(socket, ack, 'Invalid room or message ID');
      }

      const room = await Room.findById(roomId).select('members creatorId pinnedMessages');
      if (!room || !findRoomMember(room, socket.user.id)) {
        return emitSocketError(socket, ack, 'Join this room before deleting messages');
      }

      const msg = await Message.findById(messageId);
      if (!msg || msg.roomId.toString() !== roomId.toString()) return emitSocketError(socket, ack, 'Message not found in this room');
      if (msg.isDeleted) return emitSocketError(socket, ack, 'This message has already been deleted');

      const isOwner = msg.userId === socket.user.id;
      const isModOrAdmin = hasRoomRole(room, socket.user.id, ['admin', 'moderator']);

      if (!isOwner && !isModOrAdmin) {
        return emitSocketError(socket, ack, 'You can only delete your own messages unless you moderate this room');
      }

      msg.isDeleted = true;
      msg.deletedAt = new Date();
      msg.deletedBy = socket.user.id;
      msg.isPinned = false;
      msg.pinnedBy = null;
      msg.pinnedAt = null;
      await msg.save();

      room.pinnedMessages = room.pinnedMessages.filter(
        (id) => id.toString() !== messageId.toString()
      );
      await room.save();

      io.to(roomId).emit('message_deleted', {
        messageId: msg._id.toString(),
        deletedBy: socket.user.username,
      });

      ack({ success: true, messageId: msg._id.toString() });
    } catch (err) {
      console.error('Delete message error:', err);
      emitSocketError(socket, ack, 'Failed to delete message');
    }
  });

  /**
   * mark_read — Mark messages as read (with backward-transition guard).
   *
   * FLOW:
   * 1. Validate room membership and message IDs
   * 2. Update messages from sent/delivered → read
   * 3. Broadcast message_read to room
   *
   * BACKWARD-TRANSITION GUARD:
   * Messages can only move forward in status: sent → delivered → read.
   * This prevents a read receipt from overwriting a delivered status.
   */
  socket.on('mark_read', async ({ roomId, messageIds } = {}, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;
    if (!roomId || !Array.isArray(messageIds) || messageIds.length === 0) {
      return emitSocketError(socket, ack, 'Room ID and message IDs are required');
    }

    if (!isSocketInRoom(roomId, socket.id)) {
      return emitSocketError(socket, ack, 'Join the room before marking messages as read');
    }

    const validMessageIds = messageIds.filter((messageId) => isValidObjectId(messageId));
    if (validMessageIds.length === 0) {
      return emitSocketError(socket, ack, 'No valid message IDs were provided');
    }

    try {
      // Only update messages that are not already 'read' (prevents backward transition)
      const result = await Message.updateMany(
        {
          _id: { $in: validMessageIds },
          roomId,
          userId: { $ne: socket.user.id },
          status: { $in: ['sent', 'delivered'] },
        },
        {
          $set: { status: 'read' },
          $addToSet: {
            readBy: { userId: socket.user.id, readAt: new Date() },
          },
        }
      );

      io.to(roomId).emit('message_read', {
        messageIds: validMessageIds,
        readBy: socket.user.id,
        username: socket.user.username,
      });

      ack({ success: true, updatedCount: result.modifiedCount || 0 });
    } catch (err) {
      console.error('Mark read error:', err.message);
      emitSocketError(socket, ack, 'Failed to mark messages as read');
    }
  });
}

module.exports = { registerMessageHandlers };
