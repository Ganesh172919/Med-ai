/**
 * =============================================================================
 * Reaction Socket Event Handler
 * =============================================================================
 *
 * PURPOSE:
 * Handles emoji reactions on messages in real-time rooms.
 *
 * EVENTS:
 * - add_reaction({roomId, messageId, emoji}, callback) — Toggle a reaction
 *
 * ALLOWED REACTIONS:
 * Only 4 predefined emojis are allowed: 👍 🔥 🤯 💡
 * This prevents abuse and keeps the UI clean.
 *
 * BEHAVIOR:
 * Reactions are toggle-based — clicking the same emoji again removes it.
 * Users cannot react to deleted messages or messages from blocked users.
 * =============================================================================
 */

const Room = require('../../models/Room');
const Message = require('../../models/Message');
const { isValidObjectId, findRoomMember } = require('../../helpers/validate');
const {
  isFlooded, getAck, emitSocketError,
  hasBlockingRelationship,
} = require('../helpers');
const { ALLOWED_REACTIONS } = require('../state');

/**
 * Register reaction-related socket event handlers.
 *
 * @param {Socket} socket - The authenticated socket instance
 * @param {Server} io - The Socket.IO server instance
 */
function registerReactionHandlers(socket, io) {
  /**
   * add_reaction — Toggle an emoji reaction on a message.
   *
   * FLOW:
   * 1. Validate IDs and emoji
   * 2. Verify room membership
   * 3. Load message and check for blocking
   * 4. Toggle reaction (add if absent, remove if present)
   * 5. Broadcast reaction_update to room
   */
  socket.on('add_reaction', async ({ roomId, messageId, emoji }, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;

    try {
      if (!isValidObjectId(roomId) || !isValidObjectId(messageId)) {
        return emitSocketError(socket, ack, 'Invalid room or message ID');
      }

      if (!ALLOWED_REACTIONS.has(emoji)) {
        return emitSocketError(socket, ack, 'Unsupported reaction');
      }

      // Verify room membership
      if (!isValidObjectId(roomId)) {
        return emitSocketError(socket, ack, 'Invalid room ID');
      }
      const room = await Room.findById(roomId).select('members');
      if (!room || !findRoomMember(room, socket.user.id)) {
        return emitSocketError(socket, ack, 'Join this room before reacting');
      }

      const msg = await Message.findById(messageId);
      if (!msg || msg.roomId.toString() !== roomId.toString()) {
        return emitSocketError(socket, ack, 'Message not found in this room');
      }
      if (msg.isDeleted) return emitSocketError(socket, ack, 'Cannot react to a deleted message');

      if (await hasBlockingRelationship(socket.user.id, msg.userId)) {
        return emitSocketError(socket, ack, 'You cannot react because one of you has blocked the other');
      }

      // Toggle reaction
      const currentReactors = msg.reactions.get(emoji) || [];
      const idx = currentReactors.indexOf(socket.user.id);

      if (idx > -1) {
        currentReactors.splice(idx, 1);
        if (currentReactors.length === 0) {
          msg.reactions.delete(emoji);
        } else {
          msg.reactions.set(emoji, currentReactors);
        }
      } else {
        currentReactors.push(socket.user.id);
        msg.reactions.set(emoji, currentReactors);
      }

      await msg.save();

      const reactionsObj = Object.fromEntries(msg.reactions);
      io.to(roomId).emit('reaction_update', { messageId, reactions: reactionsObj });
      ack({ success: true, messageId, reactions: reactionsObj });
    } catch (err) {
      console.error('Reaction error:', err);
      emitSocketError(socket, ack, 'Failed to update reaction');
    }
  });
}

module.exports = { registerReactionHandlers };
