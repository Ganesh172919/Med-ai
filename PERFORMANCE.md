# ChatSphere Performance Guide

## Overview

Performance optimization strategies for frontend, backend, and database.

---

## Frontend Performance

### Bundle Size Optimization

```
Current bundle analysis (approximate):
├── vendor (React, Router, etc.)  ~150KB gzipped
├── framer-motion                 ~50KB gzipped
├── lucide-react                  ~20KB gzipped
├── application code              ~100KB gzipped
└── CSS                           ~15KB gzipped
Total:                            ~335KB gzipped
```

### Code Splitting

```tsx
// Lazy load all pages (already implemented)
const SoloChat = lazy(() => import('./pages/SoloChat'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Result: Each page loads on demand
// Initial load: Only App.tsx + Landing page
```

### React Rendering Optimization

```tsx
// Memoize expensive computations
const groupedModels = useMemo(() => getModelGroups(availableModels), [availableModels]);

// Memoize callbacks passed to children
const handleClick = useCallback(() => { /* ... */ }, [dependency]);

// Avoid inline functions in JSX (creates new function each render)
// Bad: <button onClick={() => doSomething()}>
// Good: <button onClick={handleClick}>
```

### Image Optimization

```tsx
// Use responsive images
<img
  src={url}
  alt={description}
  loading="lazy"           // Defer off-screen images
  decoding="async"         // Async decoding
  className="max-h-72 w-full object-cover"
/>

// Consider WebP format for smaller sizes
// Use CDN for image delivery in production
```

### CSS Performance

```css
/* Tailwind purges unused classes in production */
/* Only classes used in templates are included */

/* Avoid expensive CSS properties */
/* Bad: filter: blur() on many elements */
/* Good: Use backdrop-blur sparingly */
```

---

## Backend Performance

### Response Compression

```javascript
// Already implemented: gzip compression
// Reduces JSON responses by 60-80%
app.use(createCompressionMiddleware({ threshold: 1024 }));
```

### Database Query Optimization

```javascript
// Use lean() for read-only queries (returns plain objects)
const messages = await Message.find({ roomId }).lean().limit(50);

// Select only needed fields
const user = await User.findById(id).select('username avatar');

// Use compound indexes
messageSchema.index({ roomId: 1, createdAt: -1 });

// Avoid N+1 queries
// Bad: Loop with individual queries
// Good: Single query with $in
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Caching Layers                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Browser Cache                                          │
│  ├── Static assets (JS, CSS, images)                   │
│  ├── Cache-Control: public, max-age=31536000           │
│  └── Content-hash in filenames for cache busting       │
│                                                         │
│  Application Cache (Future)                             │
│  ├── Redis for session data                            │
│  ├── Redis for model catalogs                          │
│  └── Redis for frequent queries                        │
│                                                         │
│  Database Cache                                         │
│  ├── MongoDB WiredTiger cache                          │
│  └── Working set should fit in RAM                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Socket.IO Performance

```javascript
// In-memory state (current)
// Good for: Single server, low-medium traffic
// Limit: ~10K concurrent connections per server

// For scaling: Redis adapter
// const redisAdapter = require('@socket.io/redis-adapter');
// io.adapter(redisAdapter(pubClient, subClient));
```

---

## Database Performance

### Index Strategy

```javascript
// Message queries (most frequent)
{ roomId: 1, createdAt: -1 }    // Room message history
{ content: 'text' }             // Full-text search

// Room queries
{ creatorId: 1 }                // User's rooms
{ tags: 1 }                     // Tag filtering
{ visibility: 1, createdAt: -1 } // Public room discovery

// User queries
{ username: 1 } (unique)        // Username lookup
{ email: 1 } (unique)           // Email lookup
```

### Query Patterns

```javascript
// Efficient: Uses index
Message.find({ roomId }).sort({ createdAt: -1 }).limit(50)

// Efficient: Uses text index
Message.find({ $text: { $search: "query" } })

// Avoid: Full collection scan
Message.find({ content: /regex/ })

// Avoid: Large skip values
Message.find().skip(10000).limit(50)  // Slow for large offsets
// Better: Cursor-based pagination
Message.find({ createdAt: { $lt: lastTimestamp } }).limit(50)
```

### Connection Pooling

```javascript
// Mongoose default pool size: 5
// Increase for production
mongoose.connect(uri, {
  maxPoolSize: 10,    // Max connections
  minPoolSize: 5,     // Min connections
  socketTimeoutMS: 45000,
});
```

---

## Network Performance

### API Response Times

```
Target response times:
├── Health check:      < 50ms
├── Auth endpoints:    < 200ms
├── CRUD operations:   < 100ms
├── Search queries:    < 300ms
├── AI requests:       1-10s (provider dependent)
└── File uploads:      < 5s (size dependent)
```

### WebSocket Performance

```
Socket.IO metrics:
├── Connection time:   < 100ms
├── Message delivery:  < 50ms (same server)
├── Typing indicator:  < 30ms
└── Reconnection:      < 2s
```

---

## Monitoring

### Key Metrics to Track

```
Frontend:
├── First Contentful Paint (FCP): < 1.5s
├── Largest Contentful Paint (LCP): < 2.5s
├── Cumulative Layout Shift (CLS): < 0.1
├── First Input Delay (FID): < 100ms
└── Time to Interactive (TTI): < 3.5s

Backend:
├── Request latency (p50, p95, p99)
├── Error rate (< 1%)
├── Active connections
├── Memory usage
├── CPU usage
└── Database query time

Database:
├── Query execution time
├── Index hit ratio (> 95%)
├── Connection pool utilization
├── Replication lag (if applicable)
└── Disk usage
```

### Profiling Tools

```powershell
# Frontend
# Chrome DevTools → Performance tab
# Lighthouse audit
# React DevTools Profiler

# Backend
node --inspect index.js
# Chrome DevTools → Node.js inspector

# Database
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

---

## Optimization Checklist

### Frontend

- [ ] Lazy load all routes
- [ ] Memoize expensive computations
- [ ] Use React.memo for pure components
- [ ] Avoid inline functions in JSX
- [ ] Optimize images (lazy loading, WebP)
- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Implement service worker (future)

### Backend

- [ ] Enable response compression
- [ ] Use database indexes
- [ ] Implement connection pooling
- [ ] Add Redis caching (future)
- [ ] Use lean() for read queries
- [ ] Limit query results
- [ ] Use cursor-based pagination
- [ ] Monitor slow queries

### Database

- [ ] Create compound indexes
- [ ] Monitor index usage
- [ ] Set up connection pooling
- [ ] Configure WiredTiger cache
- [ ] Enable query profiling
- [ ] Regular compact/repair
- [ ] Monitor replication lag

---

## Load Testing

### Tools

```powershell
# Artillery (recommended)
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3000/api/health

# Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/health

# k6 (modern)
k6 run --vus 100 --duration 30s script.js
```

### Expected Capacity

```
Single server (4 CPU, 8GB RAM):
├── HTTP requests: ~1000 req/s
├── WebSocket connections: ~5000 concurrent
├── Database queries: ~2000 q/s
└── AI requests: ~50 req/s (provider dependent)
```

---

## Scaling Path

### Phase 1: Vertical Scaling
- Increase server RAM/CPU
- Optimize database queries
- Add response compression
- Enable CDN

### Phase 2: Horizontal Scaling
- Add Redis for Socket.IO adapter
- Add Redis for caching
- Load balancer (nginx/HAProxy)
- Multiple backend instances

### Phase 3: Microservices
- Extract AI gateway service
- Extract auth service
- Extract chat service
- Message queue (Bull/BullMQ)

### Phase 4: Distributed
- Database sharding
- CDN for all static assets
- Geographic distribution
- Auto-scaling
