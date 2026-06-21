# ChatSphere Troubleshooting Guide

Common issues and their solutions.

---

## Table of Contents

- [Setup Issues](#setup-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [AI Provider Issues](#ai-provider-issues)
- [Socket.IO Issues](#socketio-issues)
- [Frontend Issues](#frontend-issues)
- [Build Issues](#build-issues)
- [Performance Issues](#performance-issues)

---

## Setup Issues

### "Port 3000 is already in use"

**Cause:** Another process is using port 3000.

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in backend/.env
PORT=3001
```

### "Cannot find module" errors

**Cause:** Dependencies not installed.

**Solution:**
```powershell
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### ".env file not found"

**Cause:** Missing environment configuration.

**Solution:**
```powershell
cd backend
cp .env.example .env
# Edit .env with your values
```

---

## Database Issues

### "MongoDB connection failed"

**Cause:** MongoDB not running or incorrect connection string.

**Solution:**
```powershell
# Check if MongoDB is running
mongosh --eval "db.runCommand({ping:1})"

# If not running, start it
# Windows:
net start MongoDB

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in backend/.env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatsphere
```

### "ECONNREFUSED 127.0.0.1:27017"

**Cause:** MongoDB service not running locally.

**Solution:**
```powershell
# Start MongoDB service
net start MongoDB

# Or install MongoDB if not installed
# Download from: https://www.mongodb.com/try/download/community
```

### "Mongoose: CastError: Cast to ObjectId failed"

**Cause:** Invalid MongoDB ObjectId format.

**Solution:**
- Ensure IDs are 24-character hex strings
- Check that the ID exists in the database
- The app has validation for this, but older data may have issues

---

## Authentication Issues

### "Token expired" errors

**Cause:** Access token has expired (15 min TTL).

**Solution:**
- The frontend should automatically refresh using the refresh token
- If persistent, clear cookies and log in again
- Check that JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set in .env

### "Invalid token" errors

**Cause:** Token doesn't match the server's secret.

**Solution:**
```powershell
# Ensure secrets are set in backend/.env
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_different_secret_here

# Restart the backend after changing secrets
```

### Google OAuth not working

**Cause:** Missing or incorrect Google OAuth credentials.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
4. Update backend/.env:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

---

## AI Provider Issues

### "No AI models are configured"

**Cause:** No API keys set for any AI provider.

**Solution:**
```powershell
# Add at least one API key to backend/.env
OPENROUTER_API_KEY=sk-or-...  # Recommended: access to many models
# or
GEMINI_API_KEY=AI...
# or
GROQ_API_KEY=gsk_...
```

### "AI request failed" or "Model not found"

**Cause:** API key invalid, expired, or rate limited.

**Solution:**
1. Check API key validity on provider dashboard
2. Check rate limits / billing
3. Try a different model
4. The app has automatic fallback - it will try other models

### "AI rate limited" (429 errors)

**Cause:** Too many requests to the AI provider.

**Solution:**
- Wait a few minutes
- Switch to a different provider
- The app has built-in rate limiting and quota management

### Models not showing in dropdown

**Cause:** Model catalog refresh failed.

**Solution:**
```powershell
# Restart the backend to refresh catalogs
cd backend
npm run dev

# Or call the refresh endpoint
curl -X POST http://localhost:3000/api/ai/models/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Socket.IO Issues

### Messages not appearing in real-time

**Cause:** Socket.IO connection failed.

**Solution:**
1. Check browser console for WebSocket errors
2. Ensure CORS is configured correctly
3. Check that the backend is running

```javascript
// In browser console, check socket connection:
// The socket should be connected
```

### "Join this room before connecting to chat"

**Cause:** User hasn't joined the room via the REST API.

**Solution:**
- First join the room through the UI
- The room membership must exist before Socket.IO connection

### Typing indicators not working

**Cause:** Socket.IO events not being received.

**Solution:**
- Check that the user is connected to the room
- Check browser console for errors
- The typing indicator auto-stops after 3 seconds

---

## Frontend Issues

### White screen / app not loading

**Cause:** JavaScript error preventing render.

**Solution:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Clear browser cache and reload

### "Loading ChatSphere..." stuck

**Cause:** Lazy-loaded component failed to load.

**Solution:**
```powershell
# Rebuild the frontend
cd frontend
npm run build

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Styles not applying

**Cause:** Tailwind CSS not processing correctly.

**Solution:**
```powershell
# Rebuild CSS
cd frontend
npm run build

# Check tailwind.config.ts content paths
# Ensure all component files are in the content paths
```

---

## Build Issues

### TypeScript compilation errors

**Cause:** Type errors in the codebase.

**Solution:**
```powershell
# Run type checking
cd frontend
npx tsc --noEmit

# Common fixes:
# - Add missing type annotations
# - Fix import paths
# - Update type definitions
```

### Vite build fails

**Cause:** Build configuration or dependency issues.

**Solution:**
```powershell
# Clear cache and rebuild
cd frontend
rm -rf node_modules/.vite dist
npm run build

# Check for circular dependencies
# Check vite.config.ts for issues
```

### Backend syntax errors

**Cause:** JavaScript syntax errors.

**Solution:**
```powershell
# Check all JS files for syntax errors
cd backend
Get-ChildItem -Path . -Recurse -Filter *.js -File |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
  ForEach-Object { node --check $_.FullName }
```

---

## Performance Issues

### Slow API responses

**Cause:** Database queries or AI provider latency.

**Solution:**
1. Check MongoDB indexes (run `db.messages.getIndexes()` in mongosh)
2. Check AI provider status pages
3. Use a faster model (e.g., gemini-2.5-flash instead of gpt-5.4)

### High memory usage

**Cause:** Large message history or memory leaks.

**Solution:**
- The backend has in-memory state for Socket.IO (roomUsers, typingUsers)
- This is expected and scales with concurrent users
- For production, add Redis for Socket.IO adapter

### Socket.IO reconnection loops

**Cause:** Network issues or authentication failures.

**Solution:**
- Check that the JWT token is valid
- Check network connectivity
- The client should handle reconnection automatically

---

## Getting More Help

1. **Check the logs**: Backend logs are in the terminal running the server
2. **Browser DevTools**: F12 → Console and Network tabs
3. **GitHub Issues**: Search existing issues or create a new one
4. **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system details
5. **API Reference**: See [API.md](./API.md) for endpoint documentation

---

## Debug Mode

### Enable verbose logging

```powershell
# Backend: Add to .env
DEBUG=chatsphere:*

# Or use Node.js debug
NODE_DEBUG=module,net,http
```

### Check database state

```powershell
# Connect to MongoDB
mongosh

# Switch to chatsphere database
use chatsphere

# Check collections
show collections

# Count documents
db.users.countDocuments()
db.messages.countDocuments()
db.rooms.countDocuments()

# Check indexes
db.messages.getIndexes()
```

### Test API endpoints

```powershell
# Health check
curl http://localhost:3000/api/health

# List models (requires auth)
curl http://localhost:3000/api/ai/models \
  -H "Authorization: Bearer YOUR_TOKEN"
```
