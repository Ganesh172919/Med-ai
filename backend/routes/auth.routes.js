const express = require('express');
const authMiddleware = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const authController = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middleware/validate');

const router = express.Router();

// ─── Local auth ───────────────────────────────────────────────────────────────
// validateRegistration enforces: username 3-30 chars, valid email, password 8-128 chars
// This runs BEFORE the controller, so invalid input never reaches business logic.
router.post('/register',        authLimiter, validateRegistration, authController.register);
router.post('/login',           authLimiter, validateLogin,        authController.login);
router.post('/refresh',         authLimiter,                        authController.refresh);
router.post('/logout',                                              authController.logout);
router.get('/me',               authMiddleware,                     authController.getMe);

// ─── Password reset ──────────────────────────────────────────────────────────
router.post('/forgot-password', authLimiter,  authController.forgotPassword);
router.post('/reset-password',  authLimiter,  authController.resetPassword);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google',                         authController.googleAuth);
router.get('/google/callback',  authController.googleCallbackGuard, authController.googleCallback);
router.post('/google/exchange',               authController.googleExchange);

module.exports = router;
