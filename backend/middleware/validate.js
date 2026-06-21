/**
 * =============================================================================
 * Request Validation Middleware
 * =============================================================================
 *
 * PURPOSE:
 * Provides reusable validation functions for Express route handlers.
 * Validates request body, query parameters, and URL parameters before
 * they reach the business logic layer.
 *
 * WHY VALIDATION MIDDLEWARE:
 * - Separates validation from business logic (Single Responsibility)
 * - Provides consistent error responses across all endpoints
 * - Prevents invalid data from reaching the database
 * - Reduces code duplication in route handlers
 * - Makes validation rules explicit and documented
 *
 * USAGE:
 *   router.post('/rooms', authMiddleware, validateRoom, async (req, res) => {
 *     // req.body is guaranteed valid here
 *   });
 *
 * VALIDATION LAYER ARCHITECTURE:
 *
 *   Request → [Auth] → [Validation] → [Route Handler] → [Service] → [DB]
 *                              ↓
 *                         400 Error
 *                         (if invalid)
 *
 * LEARNING NOTES:
 * - Validation is a "fail fast" pattern - reject bad input early
 * - Always validate on the server, even if the client validates too
 * - Client-side validation is for UX, server-side is for security
 * - Return 400 (Bad Request) for validation errors, not 500
 * =============================================================================
 */

/**
 * Create a validation error response.
 *
 * WHY STANDARDIZED ERRORS:
 * Consistent error format makes it easier for clients to handle errors.
 * All validation errors follow the same structure:
 * { success: false, error: "message", details: [...] }
 *
 * @param {Object} res - Express response object
 * @param {string} message - Human-readable error message
 * @param {Array} details - Optional array of field-specific errors
 * @returns {Object} Express response
 */
function validationError(res, message, details = []) {
  const response = {
    success: false,
    error: message,
  };

  if (details.length > 0) {
    response.details = details;
  }

  return res.status(400).json(response);
}

/**
 * Validate required fields in request body.
 *
 * PATTERN: Whitelist validation
 * We specify which fields are required and their types, rather than
 * trying to blacklist bad inputs. This is more secure because new
 * fields are rejected by default.
 *
 * @param {Array<string>} fields - Required field names
 * @returns {Function} Express middleware
 */
function requireBodyFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return validationError(res, `Missing required fields: ${missing.join(', ')}`,
        missing.map((field) => ({ field, message: `${field} is required` }))
      );
    }

    next();
  };
}

/**
 * Validate request body is not empty.
 *
 * WHY THIS EXISTS:
 * Some endpoints require a body but don't have specific field requirements.
 * This middleware ensures the body isn't empty.
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function requireBody(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return validationError(res, 'Request body is required');
  }
  next();
}

/**
 * Validate string field length.
 *
 * @param {string} field - Field name
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {Function} Express middleware
 */
function validateStringLength(field, min = 0, max = Infinity) {
  return (req, res, next) => {
    const value = req.body[field];

    if (value === undefined || value === null) {
      return next(); // Let requireBodyFields handle missing fields
    }

    if (typeof value !== 'string') {
      return validationError(res, `${field} must be a string`);
    }

    const trimmed = value.trim();

    if (trimmed.length < min) {
      return validationError(res, `${field} must be at least ${min} characters`);
    }

    if (trimmed.length > max) {
      return validationError(res, `${field} must be at most ${max} characters`);
    }

    // Sanitize: trim the value
    req.body[field] = trimmed;

    next();
  };
}

/**
 * Validate email format.
 *
 * WHY THIS REGEX:
 * Matches 99.9% of valid email addresses. Not perfect (no regex is),
 * but good enough for validation. The actual verification happens when
 * we send a confirmation email.
 *
 * @param {string} field - Field name (default: 'email')
 * @returns {Function} Express middleware
 */
function validateEmail(field = 'email') {
  return (req, res, next) => {
    const value = req.body[field];

    if (value === undefined || value === null) {
      return next(); // Let requireBodyFields handle missing fields
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof value !== 'string' || !emailRegex.test(value.trim())) {
      return validationError(res, `${field} must be a valid email address`);
    }

    // Sanitize: lowercase and trim
    req.body[field] = value.trim().toLowerCase();

    next();
  };
}

/**
 * Validate field is one of allowed values.
 *
 * @param {string} field - Field name
 * @param {Array} allowedValues - Allowed values
 * @returns {Function} Express middleware
 */
function validateEnum(field, allowedValues) {
  return (req, res, next) => {
    const value = req.body[field];

    if (value === undefined || value === null) {
      return next(); // Let requireBodyFields handle missing fields
    }

    if (!allowedValues.includes(value)) {
      return validationError(
        res,
        `${field} must be one of: ${allowedValues.join(', ')}`,
        [{ field, message: `Invalid value: ${value}` }]
      );
    }

    next();
  };
}

/**
 * Validate numeric field.
 *
 * @param {string} field - Field name
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {Function} Express middleware
 */
function validateNumber(field, min = -Infinity, max = Infinity) {
  return (req, res, next) => {
    const value = req.body[field];

    if (value === undefined || value === null) {
      return next(); // Let requireBodyFields handle missing fields
    }

    const num = Number(value);

    if (isNaN(num)) {
      return validationError(res, `${field} must be a number`);
    }

    if (num < min) {
      return validationError(res, `${field} must be at least ${min}`);
    }

    if (num > max) {
      return validationError(res, `${field} must be at most ${max}`);
    }

    // Sanitize: convert to number
    req.body[field] = num;

    next();
  };
}

/**
 * Validate array field.
 *
 * @param {string} field - Field name
 * @param {number} minLength - Minimum array length (optional)
 * @param {number} maxLength - Maximum array length (optional)
 * @returns {Function} Express middleware
 */
function validateArray(field, minLength = 0, maxLength = Infinity) {
  return (req, res, next) => {
    const value = req.body[field];

    if (value === undefined || value === null) {
      return next(); // Let requireBodyFields handle missing fields
    }

    if (!Array.isArray(value)) {
      return validationError(res, `${field} must be an array`);
    }

    if (value.length < minLength) {
      return validationError(res, `${field} must have at least ${minLength} items`);
    }

    if (value.length > maxLength) {
      return validationError(res, `${field} must have at most ${maxLength} items`);
    }

    next();
  };
}

/**
 * Sanitize HTML from string fields.
 *
 * WHY THIS EXISTS:
 * Prevents XSS attacks by stripping HTML tags from user input.
 * This is a defense-in-depth measure - React already escapes output,
 * but we sanitize input too for stored XSS prevention.
 *
 * @param {Array<string>} fields - Field names to sanitize
 * @returns {Function} Express middleware
 */
function sanitizeHtml(fields) {
  return (req, res, next) => {
    for (const field of fields) {
      if (typeof req.body[field] === 'string') {
        // Strip HTML tags
        req.body[field] = req.body[field].replace(/<[^>]*>/g, '');
      }
    }
    next();
  };
}

/**
 * Validate room creation request.
 *
 * COMPOSITION:
 * Composes multiple validation middleware into a single validation chain.
 * This is the recommended pattern for complex validation requirements.
 */
const validateRoom = [
  requireBodyFields(['name']),
  validateStringLength('name', 1, 50),
  validateStringLength('description', 0, 500),
  validateEnum('visibility', ['public', 'private']),
  validateNumber('maxUsers', 2, 100),
  validateArray('tags', 0, 10),
  sanitizeHtml(['name', 'description']),
];

/**
 * Validate message send request.
 */
const validateMessage = [
  requireBody,
  validateStringLength('content', 1, 4000),
  sanitizeHtml(['content']),
];

/**
 * Validate user registration request.
 */
const validateRegistration = [
  requireBodyFields(['username', 'email', 'password']),
  validateStringLength('username', 3, 30),
  validateEmail('email'),
  validateStringLength('password', 8, 128),
];

/**
 * Validate user login request.
 */
const validateLogin = [
  requireBodyFields(['email', 'password']),
  validateEmail('email'),
];

module.exports = {
  validationError,
  requireBodyFields,
  requireBody,
  validateStringLength,
  validateEmail,
  validateEnum,
  validateNumber,
  validateArray,
  sanitizeHtml,
  validateRoom,
  validateMessage,
  validateRegistration,
  validateLogin,
};
