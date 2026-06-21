/**
 * =============================================================================
 * AI Socket Event Handler
 * =============================================================================
 *
 * PURPOSE:
 * Handles AI-triggered responses in group chat rooms.
 * When a user sends @ai or uses the trigger_ai event, this handler:
 * 1. Validates the request
 * 2. Checks AI quota
 * 3. Sends the prompt to the AI service
 * 4. Broadcasts the AI response to the room
 *
 * EVENTS:
 * - trigger_ai({roomId, prompt, modelId, attachment}, callback) — Request AI response
 *
 * QUOTA:
 * Each user gets 20 AI requests per 15-minute window (in-memory).
 * This prevents abuse while allowing active conversations.
 * =============================================================================
 */

const Room = require('../../models/Room');
const Message = require('../../models/Message');
const { isValidObjectId, findRoomMember } = require('../../helpers/validate');
const { sendGroupMessage, resolveModel } = require('../../services/gemini');
const { consumeAiQuota } = require('../../services/aiQuota');
const { validateAttachmentPayload } = require('../../services/messageFormatting');
const { formatMessage } = require('../formatMessage');
const {
  isFlooded, getAck, emitSocketError,
  isSocketInRoom, clearTyping,
} = require('../helpers');
const { AI_USERNAME } = require('../state');

/**
 * Register AI-related socket event handlers.
 *
 * @param {Socket} socket - The authenticated socket instance
 * @param {Server} io - The Socket.IO server instance
 */
function registerAIHandlers(socket, io) {
  /**
   * trigger_ai — Request an AI response in a group chat room.
   *
   * FLOW:
   * 1. Validate prompt and attachment
   * 2. Check AI quota for the user
   * 3. Verify room membership
   * 4. Send prompt to AI service with room history
   * 5. Update room's AI history
   * 6. Persist AI message to database
   * 7. Broadcast ai_response to room
   *
   * ERROR HANDLING:
   * On failure, a friendly error message is persisted as an AI message
   * so the user sees something in the chat rather than a silent failure.
   */
  socket.on('trigger_ai', async ({ roomId, prompt, modelId, attachment }, callback) => {
    const ack = getAck(callback);
    if (isFlooded(socket, ack)) return;
    const requestedModel = resolveModel(modelId);

    if (!prompt || prompt.trim().length === 0) return emitSocketError(socket, ack, 'Prompt is required');
    if (prompt.trim().length > 4000) return emitSocketError(socket, ack, 'Prompt must be under 4000 characters');
    const attachmentError = validateAttachmentPayload(attachment || {});
    if (attachmentError) return emitSocketError(socket, ack, attachmentError);

    io.to(roomId).emit('ai_thinking', { roomId, status: true });

    try {
      const quota = consumeAiQuota(`user:${socket.user.id}`);
      if (!quota.allowed) {
        io.to(roomId).emit('ai_thinking', { roomId, status: false });
        return emitSocketError(socket, ack, 'AI request limit reached. Please wait a few minutes.');
      }

      // Verify room membership
      if (!isValidObjectId(roomId)) {
        io.to(roomId).emit('ai_thinking', { roomId, status: false });
        return emitSocketError(socket, ack, 'Invalid room ID');
      }
      const room = await Room.findById(roomId).select('members creatorId maxUsers aiHistory name');
      if (!room || !findRoomMember(room, socket.user.id)) {
        io.to(roomId).emit('ai_thinking', { roomId, status: false });
        return emitSocketError(socket, ack, 'Join this room before using AI');
      }

      if (!isSocketInRoom(roomId, socket.id)) {
        io.to(roomId).emit('ai_thinking', { roomId, status: false });
        return emitSocketError(socket, ack, 'Join the room before using AI');
      }

      console.log(`→ [AI] Trigger from ${socket.user.username} in room ${room.name} using ${requestedModel?.id || 'fallback/offline'} via ${requestedModel?.provider || 'fallback'}`);

      const response = await sendGroupMessage(room.aiHistory, prompt.trim(), socket.user.username, {
        roomName: room.name,
        modelId,
        attachment,
      });

      // Update AI history in room
      room.aiHistory.push({ role: 'user', parts: [{ text: `[${socket.user.username} asks]: ${prompt.trim()}` }] });
      room.aiHistory.push({ role: 'model', parts: [{ text: response.content }] });

      // Trim AI history to last 40 entries + system prompt
      if (room.aiHistory.length > 42) {
        room.aiHistory = [room.aiHistory[0], room.aiHistory[1], ...room.aiHistory.slice(-38)];
      }
      await room.save();

      // Persist AI message
      const aiMsg = new Message({
        roomId,
        userId: 'ai',
        username: AI_USERNAME,
        content: response.content,
        isAI: true,
        triggeredBy: socket.user.username,
        status: 'delivered',
        reactions: new Map(),
        modelId: response.model.id,
        provider: response.model.provider,
      });
      await aiMsg.save();

      console.log(`✦ [AI] Room response ready from ${response.model.id} via ${response.model.provider} (${response.content.length} chars)`);
      io.to(roomId).emit('ai_thinking', { roomId, status: false });
      const aiMessage = formatMessage(aiMsg);
      io.to(roomId).emit('ai_response', aiMessage);
      ack({ success: true, message: aiMessage });
    } catch (err) {
      const failedModel = err?.model || requestedModel;
      console.error(`✗ [AI] trigger_ai failed for ${socket.user.username} with ${failedModel?.id || 'fallback/offline'} via ${failedModel?.provider || 'fallback'}:`, err.stack || err.message);
      io.to(roomId).emit('ai_thinking', { roomId, status: false });

      const errorMsg = new Message({
        roomId,
        userId: 'ai',
        username: AI_USERNAME,
        content: 'I ran into an error while processing that request. Please try again.',
        isAI: true,
        triggeredBy: socket.user.username,
        status: 'delivered',
        reactions: new Map(),
      });
      await errorMsg.save();
      io.to(roomId).emit('ai_response', formatMessage(errorMsg));
      emitSocketError(socket, ack, 'AI request failed', {
        modelId: failedModel?.id || null,
        provider: failedModel?.provider || null,
      });
    }
  });
}

module.exports = { registerAIHandlers };
