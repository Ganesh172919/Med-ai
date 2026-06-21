# ChatSphere FAQ

Frequently asked questions about ChatSphere.

---

## General

### What is ChatSphere?

ChatSphere is a full-stack AI-native chat platform with solo AI conversations, collaborative group rooms, and real-time messaging. It supports multiple AI providers including OpenRouter, Gemini, Grok, Groq, Together AI, and Hugging Face.

### Is ChatSphere free?

Yes, ChatSphere is open source and free to use. You need your own AI provider API keys for AI features.

### What AI providers are supported?

- OpenRouter (multi-model gateway)
- Google Gemini (direct)
- xAI Grok (direct)
- Groq (fast inference)
- Together AI (open-source models)
- Hugging Face (open-source models)

### Can I use ChatSphere without AI?

Yes! The chat, rooms, and real-time messaging work without any AI provider configured. AI features are optional.

---

## Setup

### How do I install ChatSphere?

```powershell
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

See [README.md](./README.md) for detailed instructions.

### What do I need in .env?

Minimum required:
```
MONGO_URI=mongodb://localhost:27017/chatsphere
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_different_secret_here
CLIENT_URL=http://localhost:5173
```

For AI features, add at least one API key:
```
OPENROUTER_API_KEY=sk-or-...
```

See [.env.example](./backend/.env.example) for all options.

### Do I need MongoDB?

Yes, MongoDB is required. You can use:
- Local MongoDB (free)
- MongoDB Atlas (free tier available)

---

## Features

### How do I chat with AI?

1. Go to `/chat` (Solo Chat)
2. Select a provider and model
3. Type your message and press Enter

### How do I create a room?

1. Go to `/rooms`
2. Click "Create Room"
3. Fill in name, description, tags
4. Set visibility (public/private)
5. Click Create

### How do I use AI in rooms?

Type `@ai` followed by your prompt in any room where you're a member.

### How does AI memory work?

The AI remembers context from your conversations. Go to `/memory` to view and manage your memory entries.

### Can I export my chats?

Yes! Go to `/export` to download your conversations.

---

## Account

### How do I change my password?

Go to `/settings` → Account → Change Password.

### How do I reset a forgotten password?

1. Click "Forgot Password" on the login page
2. Enter your email
3. Check your email for reset link
4. Click the link and set new password

### How do I enable Google OAuth?

Add to backend/.env:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

Get credentials from [Google Cloud Console](https://console.cloud.google.com).

### How do I delete my account?

Contact an admin or use the API endpoint (if available).

---

## Technical

### What's the tech stack?

- **Frontend**: React 18, TypeScript, Vite, Zustand, Tailwind CSS
- **Backend**: Express, Mongoose, Socket.IO
- **Database**: MongoDB
- **AI**: Multi-provider gateway

### How do I run tests?

```powershell
# Frontend
cd frontend
npm run test

# Backend
cd backend
npm run test
```

### How do I build for production?

```powershell
# Frontend
cd frontend
npm run build

# Backend
# Just ensure NODE_ENV=production
```

### How do I deploy?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides (Railway, Render, Vercel, Docker).

---

## AI

### Why are no models showing?

Check that you have at least one API key configured in backend/.env. Restart the backend after adding keys.

### How do I switch AI models?

In Solo Chat, use the provider/model selector in the header or composer.

### What is "auto" mode?

Auto mode automatically selects the best model based on prompt complexity. It tries to balance speed and quality.

### Why did the AI fallback to a different model?

If the primary model fails (rate limit, error, unavailable), ChatSphere automatically tries backup models. This ensures you always get a response.

### How do I add my own models?

Add custom models to backend/.env:
```
OPENROUTER_MODELS=custom/model-id=Custom Label
```

---

## Rooms

### What's the difference between public and private rooms?

- **Public**: Anyone can find and join
- **Private**: Requires invite link or join key

### How do I pin a message?

Hover over a message → Click the pin icon (requires moderator/admin role).

### How do I moderate a room?

Room creators are admins. They can:
- Assign moderators
- Delete messages
- Pin/unpin messages
- Remove members

### Can I use polls in rooms?

Yes! Create polls to gather opinions from room members.

---

## Troubleshooting

### "Port 3000 is already in use"

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "MongoDB connection failed"

Ensure MongoDB is running:
```powershell
net start MongoDB
```

### Messages not appearing in real-time

1. Check browser console for errors
2. Ensure backend is running
3. Check WebSocket connection

### AI requests failing

1. Check API key validity
2. Check rate limits
3. Try a different model/provider

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more.

---

## Contributing

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guide.

### Where do I report bugs?

Open an issue on GitHub with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

### How do I request features?

Open an issue with the "feature request" label describing:
- The feature you want
- Why you want it
- How it should work

---

## Security

### Is ChatSphere secure?

Yes, ChatSphere implements:
- JWT authentication
- bcrypt password hashing
- Rate limiting
- Input validation
- Security headers
- CORS protection

See [SECURITY.md](./SECURITY.md) for details.

### Are messages encrypted?

Messages are stored in MongoDB and transmitted over HTTP/HTTPS. For production, use HTTPS to encrypt in transit.

### Can admins see my messages?

Admins can see messages in rooms they moderate. Solo chat messages are private.

---

## Performance

### How many users can ChatSphere handle?

Single server: ~5000 concurrent WebSocket connections, ~1000 HTTP requests/second.

### How do I improve performance?

1. Enable compression (already enabled)
2. Add Redis caching
3. Use CDN for frontend
4. Optimize database queries
5. Scale horizontally

See [PERFORMANCE.md](./PERFORMANCE.md) for details.

---

## More Questions?

- Check the [documentation](./README.md#documentation)
- Search [existing issues](https://github.com/your-username/chatsphere/issues)
- Open a [new issue](https://github.com/your-username/chatsphere/issues/new)
