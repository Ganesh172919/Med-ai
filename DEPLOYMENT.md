# ChatSphere Deployment Guide

## Overview

This guide covers deploying ChatSphere to production.

---

## Prerequisites

- Node.js 18+ (recommended: 20+)
- MongoDB instance (local or Atlas)
- Domain name (optional)
- SSL certificate (for HTTPS)

---

## Environment Variables

### Required

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatsphere
JWT_ACCESS_SECRET=<random-64-char-hex>
JWT_REFRESH_SECRET=<different-random-64-char-hex>
CLIENT_URL=https://yourdomain.com
PORT=3000
```

### AI Provider (at least one)

```env
OPENROUTER_API_KEY=sk-or-...
# or
GEMINI_API_KEY=AI...
# or
GROQ_API_KEY=gsk_...
```

### Generate Secrets

```powershell
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Deployment Options

### Option 1: Railway (Recommended for beginners)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Connect GitHub repo
4. Add environment variables
5. Deploy

### Option 2: Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create Web Service
4. Connect GitHub repo
5. Add environment variables
6. Deploy

### Option 3: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repo
4. Set root directory to `frontend`
5. Deploy

**Backend (Railway):**
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repo
4. Set root directory to `backend`
5. Add environment variables
6. Deploy

### Option 4: Docker

```dockerfile
# Dockerfile (backend)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/chatsphere
      - JWT_ACCESS_SECRET=your_secret
      - JWT_REFRESH_SECRET=your_secret
      - CLIENT_URL=http://localhost:5173
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Add to MONGO_URI in .env

---

## SSL/HTTPS

### Using Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Using Let's Encrypt

```powershell
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

---

## Production Checklist

### Security

- [ ] HTTPS enabled
- [ ] Strong JWT secrets (64+ chars)
- [ ] CORS restricted to production domain
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] MongoDB authentication enabled
- [ ] Environment variables secured

### Performance

- [ ] Frontend built and optimized
- [ ] Compression enabled (gzip)
- [ ] CDN for static assets (optional)
- [ ] MongoDB indexes created
- [ ] Connection pooling configured

### Monitoring

- [ ] Health check endpoint working
- [ ] Error logging configured
- [ ] Uptime monitoring set up
- [ ] Database backup scheduled

### Reliability

- [ ] Graceful shutdown implemented
- [ ] Process manager (PM2) configured
- [ ] Auto-restart on failure
- [ ] Database replication (optional)

---

## Process Manager (PM2)

```powershell
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start index.js --name chatsphere-backend

# Save PM2 config
pm2 save

# Setup auto-start on reboot
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs chatsphere-backend
```

---

## Monitoring

### Health Check

```powershell
curl https://yourdomain.com/api/health
# Expected: {"status":"ok","timestamp":"...","db":"mongodb"}
```

### Uptime Monitoring

- [UptimeRobot](https://uptimerobot.com) - Free
- [Better Uptime](https://betterstack.com) - Free tier
- [Pingdom](https://pingdom.com) - Paid

---

## Troubleshooting

### "Application failed to start"

```powershell
# Check logs
pm2 logs chatsphere-backend

# Common issues:
# - Missing environment variables
# - MongoDB connection failed
# - Port already in use
```

### "CORS error"

```powershell
# Ensure CLIENT_URL matches your frontend domain
CLIENT_URL=https://yourdomain.com
```

### "Database connection failed"

```powershell
# Check MongoDB URI
# Ensure IP is whitelisted in Atlas
# Check database user credentials
```

---

## Rollback Strategy

### If deployment fails:

1. Check logs for errors
2. Revert to previous commit
3. Redeploy

```powershell
git revert HEAD
git push origin main
# Redeploy on your platform
```

### If database migration fails:

1. Stop the backend
2. Restore database from backup
3. Fix the migration
4. Restart backend
