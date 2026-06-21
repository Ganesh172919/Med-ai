/**
 * =============================================================================
 * Message Formatting Service
 * =============================================================================
 *
 * PURPOSE:
 * Provides message DTO formatting and attachment validation for the HTTP API
 * routes and socket handlers.
 *
 * MIGRATION NOTE (Iteration 3):
 * The `formatMessage` function was previously duplicated in both this file and
 * `socket/formatMessage.js` with minor differences (deleted message placeholder).
 * It is now imported from the canonical `socket/formatMessage.js` to eliminate
 * duplication. All existing import paths continue to work.
 *
 * This file retains:
 * - `formatMemoryRefs` — formats memory reference entries for API responses
 * - `validateAttachmentPayload` — validates file attachment data (HTTP-specific)
 * - Re-export of `formatMessage` for backward compatibility
 * =============================================================================
 */

const { ALLOWED_TYPES, MAX_FILE_SIZE } = require('../middleware/upload');
const { formatMessage } = require('../socket/formatMessage');

/**
 * Format memory reference entries for API responses.
 *
 * WHY: Memory references in messages contain ObjectId and scoring data
 * that needs to be serialized to safe client-facing types.
 *
 * @param {Array} memoryRefs - Raw memory reference entries
 * @returns {Array} Formatted memory references
 */
function formatMemoryRefs(memoryRefs = []) {
  return memoryRefs.map((entry) => ({
    id: String(entry.id),
    summary: entry.summary,
    score: typeof entry.score === 'number' ? entry.score : null,
  }));
}

/**
 * Validate file attachment payload for upload.
 *
 * WHY: Ensures all required file fields are present and within limits
 * before the message is persisted. This prevents orphaned file references.
 *
 * SECURITY: Validates URL prefix to prevent arbitrary file paths.
 * Validates MIME type against allowlist to prevent malicious uploads.
 *
 * @param {Object} attachment - File attachment data
 * @returns {string|null} Error message or null if valid
 */
function validateAttachmentPayload({ fileUrl, fileName, fileType, fileSize }) {
  const hasAnyFileField = fileUrl || fileName || fileType || fileSize;
  if (!hasAnyFileField) {
    return null;
  }

  if (!fileUrl || !fileName || !fileType || typeof fileSize !== 'number') {
    return 'Incomplete file attachment data';
  }

  if (!fileUrl.startsWith('/api/uploads/')) {
    return 'Invalid file URL';
  }

  if (!ALLOWED_TYPES[fileType]) {
    return 'Unsupported file type';
  }

  if (fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
    return `Files must be smaller than ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`;
  }

  return null;
}

module.exports = {
  formatMessage,
  formatMemoryRefs,
  validateAttachmentPayload,
};
