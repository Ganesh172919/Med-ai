/**
 * =============================================================================
 * Message DTO Formatter
 * =============================================================================
 *
 * PURPOSE:
 * Formats MongoDB message documents into clean DTOs for client consumption.
 * This is the single source of truth for message serialization, replacing
 * the duplicate formatMessage that existed in both index.js and messageFormatting.js.
 *
 * PATTERN: Data Transfer Object (DTO)
 * Transforms internal database objects into a safe, consistent shape
 * for API responses. This ensures:
 * - String IDs (not ObjectId)
 * - Safe content (handle deleted messages)
 * - Serialized reactions (Map → plain object)
 * - Null-safe optional fields
 *
 * SECURITY:
 * Deleted messages show a placeholder instead of original content.
 * This prevents accidental data leaks through cached messages.
 * =============================================================================
 */

/**
 * Format a MongoDB message document for client consumption.
 *
 * @param {Object} msg - Mongoose message document
 * @returns {Object} Clean message object for API response
 */
function formatMessage(msg) {
  return {
    id: msg._id.toString(),
    userId: msg.userId,
    username: msg.username,
    content: msg.isDeleted ? '🗑️ This message was deleted' : msg.content,
    timestamp: msg.createdAt,
    isAI: msg.isAI || false,
    triggeredBy: msg.triggeredBy || null,
    replyTo: msg.replyTo && msg.replyTo.id ? msg.replyTo : null,
    reactions: msg.reactions
      ? (msg.reactions instanceof Map ? Object.fromEntries(msg.reactions) : msg.reactions)
      : {},
    status: msg.status || 'sent',
    isPinned: msg.isPinned || false,
    isEdited: msg.isEdited || false,
    editedAt: msg.editedAt || null,
    isDeleted: msg.isDeleted || false,
    fileUrl: msg.fileUrl || null,
    fileName: msg.fileName || null,
    fileType: msg.fileType || null,
    fileSize: msg.fileSize || null,
    memoryRefs: msg.memoryRefs || [],
    modelId: msg.modelId || null,
    provider: msg.provider || null,
  };
}

module.exports = { formatMessage };
