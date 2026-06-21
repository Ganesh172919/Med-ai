/**
 * =============================================================================
 * ChatSphere Server Entry Point
 * =============================================================================
 *
 * ARCHITECTURE OVERVIEW:
 * This file bootstraps the ChatSphere backend:
 *   1. Express HTTP server for REST API endpoints
 *   2. Socket.IO WebSocket server for real-time communication
 *   3. All route mounting, middleware, and configuration
 *
 * SOCKET.IO HANDLERS:
 * Previously a 700+ line monolithic block, socket event handlers are now
 * extracted into modular files under socket/:
 *   - socket/state.js — Shared in-memory state
 *   - socket/helpers.js — Utility functions
 *   - socket/formatMessage.js — Message DTO formatter
 *   - socket/handlers/room.js — Room join/leave
 *   - socket/handlers/typing.js — Typing indicators
 *   - socket/handlers/message.js — Message CRUD
 *   - socket/handlers/reaction.js — Emoji reactions
 *   - socket/handlers/ai.js — AI responses
 *   - socket/handlers/pin.js — Pin/unpin messages
 *   - socket/index.js — Connection lifecycle + handler wiring
 *
 * LEARNING NOTES:
 * - Express handles HTTP request/response cycles (REST API)
 * - Socket.IO handles persistent WebSocket connections (real-time events)
 * - Both share the same HTTP server instance (port)
 * - MongoDB provides persistent storage via Mongoose ODM
 *
 * DATA FLOW:
 * Client → Socket.IO → Event Handler → MongoDB → Broadcast → All Clients
 * Client → Express → Route → Controller → Service → MongoDB → Response
 * =============================================================================
 */

// =============================================================================
// DEPENDENCIES
// =============================================================================
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Server } = require('socket.io');
const passport = require('passport');
const logger = require('./helpers/logger');

// =============================================================================
// DATABASE & PASSPORT
// =============================================================================
const connectDB = require('./config/db');
require('./config/passport');

// =============================================================================
// ROUTE IMPORTS
// =============================================================================
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversations');
const roomRoutes = require('./routes/rooms');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const aiRoutes = require('./routes/ai');
const projectRoutes = require('./routes/projects');
const settingsRoutes = require('./routes/settings');
const pollRoutes = require('./routes/polls');
const groupRoutes = require('./routes/groups');
const moderationRoutes = require('./routes/moderation');
const exportRoutes = require('./routes/export');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/uploads');
const memoryRoutes = require('./routes/memory');

// =============================================================================
// MIDDLEWARE IMPORTS
// =============================================================================
const socketAuthMiddleware = require('./middleware/socketAuth');
const { apiLimiter } = require('./middleware/rateLimit');
const { securityHeaders } = require('./middleware/security');
const { createCompressionMiddleware } = require('./middleware/compression');

// =============================================================================
// SOCKET.IO HANDLER MODULE
// =============================================================================
const { initializeSocketHandlers } = require('./socket');

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================
const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS — allows frontend (different port) to call API
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// Security headers — add before other middleware
app.use(securityHeaders);

// Response compression — reduces payload size by 60-80%
app.use(createCompressionMiddleware({ threshold: 1024 }));

const cookieParser = require('cookie-parser');
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// =============================================================================
// REQUEST LOGGING MIDDLEWARE
// =============================================================================
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = logger.createRequestId();
  req.requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  logger.info('API_REQUEST_START', 'Incoming request', logger.buildRequestSummary(req));

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userLabel = req.user?.username || req.user?.email || 'guest';
    logger.info('API_REQUEST_END', 'Completed request', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      user: userLabel,
    });
    console.log(`→ [API] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms — ${userLabel}`);
  });

  next();
});

// Apply general rate limiter to all API routes
app.use('/api', apiLimiter);

// =============================================================================
// HEALTH CHECK
// =============================================================================
// Health check endpoint for load balancers, monitoring, and container orchestration.
// Returns server status, uptime, and connection count.
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    },
  });
});

// =============================================================================
// API ROUTES
// =============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/memory', memoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'mongodb' });
});

// =============================================================================
// SOCKET.IO SETUP
// =============================================================================
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

// Socket.IO auth middleware — verifies JWT on handshake
io.use(socketAuthMiddleware);

// Initialize all socket event handlers from modular files
initializeSocketHandlers(io);

// =============================================================================
// SERVER STARTUP
// =============================================================================
const PORT = process.env.PORT || 3000;

/**
 * Start the ChatSphere server.
 *
 * STARTUP SEQUENCE:
 * 1. Connect to MongoDB
 * 2. Refresh AI model catalogs from providers
 * 3. Start HTTP/Socket.IO server
 * 4. Log server info and available models
 */
async function startServer() {
  const { refreshModelCatalogs, getAvailableModels } = require('./services/gemini');

  await connectDB();
  await refreshModelCatalogs().catch((err) => {
    console.warn('⚠ Could not refresh AI model catalogs:', err.message);
  });
  const configuredModels = getAvailableModels({ includeFallback: false });
  const providerCounts = configuredModels.reduce((accumulator, model) => {
    accumulator[model.provider] = (accumulator[model.provider] || 0) + 1;
    return accumulator;
  }, {});

  await new Promise((resolve, reject) => {
    const handleError = (error) => {
      server.off('listening', handleListening);
      reject(error);
    };
    const handleListening = () => {
      server.off('error', handleError);
      resolve();
    };
    server.once('error', handleError);
    server.once('listening', handleListening);
    server.listen(PORT);
  });

  console.log(`\n✦ ChatSphere server running on port ${PORT}`);
  console.log(`  → API:      http://localhost:${PORT}/api`);
  console.log(`  → Socket:   ws://localhost:${PORT}`);
  console.log(`  → Client:   ${CLIENT_URL}`);
  console.log(`  → Database: MongoDB`);
  if (configuredModels.length === 0) {
    console.log('⚠ [AI] No provider-backed AI models are configured. Add API keys in backend/.env');
  } else {
    console.log('→ [AI] Available models loaded:');
    console.log(`  total models: ${configuredModels.length}`);
    Object.entries(providerCounts).forEach(([provider, count]) => {
      console.log(`  - ${provider}: ${count}`);
    });
  }
  console.log();
}

startServer().catch((err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing process using port ${PORT}, or change PORT in backend/.env.`);
  } else {
    console.error('Failed to start server:', err);
  }
  process.exit(1);
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds

function gracefulShutdown(signal) {
  console.log(`\n⚠ [SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);

  const forceExitTimeout = setTimeout(() => {
    console.error('⚠ [SHUTDOWN] Forced exit due to timeout');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);
  forceExitTimeout.unref();

  io.close(() => {
    console.log('✦ [SHUTDOWN] Socket.IO server closed');
  });

  server.close(() => {
    console.log('✦ [SHUTDOWN] HTTP server closed');
    const mongoose = require('mongoose');
    mongoose.connection.close(false).then(() => {
      console.log('✦ [SHUTDOWN] MongoDB connection closed');
      console.log('✦ [SHUTDOWN] Graceful shutdown complete');
      process.exit(0);
    }).catch((err) => {
      console.error('✗ [SHUTDOWN] Error closing MongoDB:', err.message);
      process.exit(1);
    });
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('✗ [FATAL] Uncaught exception:', err);
  gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ [FATAL] Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
