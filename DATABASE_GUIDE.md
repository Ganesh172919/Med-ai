# ChatSphere Database Guide

## Overview

ChatSphere uses MongoDB with Mongoose ODM. This guide covers schema design, indexing, and optimization.

---

## Collections

### Users

```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  passwordHash: String,
  googleId: String (sparse index),
  avatar: String,
  displayName: String,
  bio: String,
  authProvider: 'local' | 'google',
  onlineStatus: 'online' | 'away' | 'offline',
  lastSeen: Date,
  settings: { theme, accentColor, notifications, aiFeatures },
  blockedUsers: [ObjectId],
  isAdmin: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages

```javascript
{
  _id: ObjectId,
  roomId: ObjectId (indexed),
  userId: String,
  username: String,
  content: String (text indexed),
  isAI: Boolean,
  triggeredBy: String,
  replyTo: { id, username, content },
  reactions: Map<String, [String]>,
  status: 'sent' | 'delivered' | 'read',
  readBy: [{ userId, readAt }],
  isPinned: Boolean,
  isEdited: Boolean,
  editHistory: [{ content, editedAt }],
  isDeleted: Boolean,
  fileUrl, fileName, fileType, fileSize,
  memoryRefs: [{ id, summary, score }],
  modelId: String,
  provider: String,
  createdAt: Date (indexed with roomId),
  updatedAt: Date
}
```

### Rooms

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  tags: [String] (indexed),
  maxUsers: Number,
  visibility: 'public' | 'private',
  privateJoinKey: String,
  creatorId: ObjectId (indexed),
  members: [{ userId, role, joinedAt }],
  pinnedMessages: [ObjectId],
  aiHistory: [{ role, parts }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Index Strategy

### Current Indexes

```javascript
// Messages
{ roomId: 1, createdAt: -1 }    // Room message queries
{ content: 'text', username: 'text' }  // Full-text search
{ roomId: 1, isPinned: 1 }      // Pinned messages

// Rooms
{ creatorId: 1 }                 // User's created rooms
{ tags: 1 }                      // Tag filtering

// Users
{ username: 1 } (unique)         // Username lookup
{ email: 1 } (unique)            // Email lookup
{ googleId: 1 } (sparse)         // OAuth lookup
```

### Recommended Additional Indexes

```javascript
// For message status queries
db.messages.createIndex({ status: 1, roomId: 1 })

// For recent messages across all rooms
db.messages.createIndex({ createdAt: -1 })

// For user's messages
db.messages.createIndex({ userId: 1, createdAt: -1 })

// For room discovery
db.rooms.createIndex({ visibility: 1, createdAt: -1 })

// For user online status
db.users.createIndex({ onlineStatus: 1, lastSeen: -1 })
```

---

## Query Patterns

### Efficient: Use Indexes

```javascript
// Good: Uses compound index
Message.find({ roomId }).sort({ createdAt: -1 }).limit(50)

// Good: Uses text index
Message.find({ $text: { $search: "query" } })

// Good: Uses pinned index
Message.find({ roomId, isPinned: true })
```

### Avoid: Full Collection Scans

```javascript
// Bad: No index on content alone
Message.find({ content: /regex/ })

// Better: Use text index
Message.find({ $text: { $search: "words" } })
```

### Pagination

```javascript
// Cursor-based (recommended for real-time)
const messages = await Message.find({ roomId, createdAt: { $lt: lastTimestamp } })
  .sort({ createdAt: -1 })
  .limit(50);

// Offset-based (simpler but slower for large offsets)
const messages = await Message.find({ roomId })
  .sort({ createdAt: -1 })
  .skip(offset)
  .limit(50);
```

---

## Performance Tips

### 1. Select Only Needed Fields

```javascript
// Good: Only fetch what you need
User.findById(id).select('username avatar onlineStatus')

// Bad: Fetch everything
User.findById(id)
```

### 2. Use lean() for Read-Only Queries

```javascript
// Returns plain objects instead of Mongoose documents
// Faster for read-only operations
Message.find({ roomId }).lean()
```

### 3. Limit Result Sets

```javascript
// Always limit queries
Message.find({ roomId }).limit(50)

// Don't fetch entire collections
// Bad: Message.find({}) without limit
```

### 4. Use Compound Queries

```javascript
// Good: Single query with conditions
Message.find({ roomId, isDeleted: false, status: 'sent' })

// Bad: Multiple separate queries
const msgs = await Message.find({ roomId });
const filtered = msgs.filter(m => !m.isDeleted && m.status === 'sent');
```

### 5. Batch Operations

```javascript
// Good: Bulk write
Message.updateMany(
  { roomId, status: 'sent', userId: { $ne: userId } },
  { $set: { status: 'delivered' } }
)

// Bad: Loop with individual updates
for (const msg of messages) {
  await Message.updateOne({ _id: msg._id }, { status: 'delivered' });
}
```

---

## Data Modeling Patterns

### Embedded vs Referenced

```javascript
// Embedded (good for 1:1 or 1:few)
{
  members: [
    { userId: ObjectId, role: 'admin', joinedAt: Date }
  ]
}

// Referenced (good for 1:many or many:many)
{
  roomId: ObjectId  // Reference to Room collection
}
```

### Why Messages are Separate from Rooms

- Messages grow unboundedly (millions per room)
- Rooms have fixed-size metadata
- Separate collections allow independent scaling
- Indexes can be optimized per collection

---

## Aggregation Examples

### Message Statistics

```javascript
const stats = await Message.aggregate([
  { $match: { roomId: ObjectId(roomId) } },
  {
    $group: {
      _id: null,
      totalMessages: { $sum: 1 },
      aiMessages: { $sum: { $cond: ['$isAI', 1, 0] } },
      uniqueUsers: { $addToSet: '$userId' },
    }
  },
  {
    $project: {
      totalMessages: 1,
      aiMessages: 1,
      uniqueUserCount: { $size: '$uniqueUsers' },
    }
  }
]);
```

### Popular Rooms

```javascript
const popular = await Room.aggregate([
  { $match: { visibility: 'public' } },
  {
    $project: {
      name: 1,
      memberCount: { $size: '$members' },
    }
  },
  { $sort: { memberCount: -1 } },
  { $limit: 10 },
]);
```

---

## Maintenance

### Check Index Usage

```javascript
// See which indexes are being used
db.messages.aggregate([{ $indexStats: {} }])

// Check for slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

### Compact Collections

```javascript
// Reclaim disk space
db.runCommand({ compact: 'messages' })
```

### Backup

```powershell
# Export database
mongodump --db chatsphere --out ./backup

# Restore
mongorestore --db chatsphere ./backup/chatsphere
```

---

## Scaling Considerations

### Vertical Scaling
- Increase RAM for working set
- Use SSDs for I/O performance
- More CPU cores for concurrent operations

### Horizontal Scaling (Sharding)
- Shard by roomId for messages (data locality)
- Shard by userId for users
- Requires MongoDB Enterprise or Atlas

### Read Replicas
- Offload read queries to replicas
- Use for analytics, search, reporting
- Eventual consistency (acceptable for chat)

---

## Common Pitfalls

### 1. Unbounded Arrays

```javascript
// Bad: Array grows forever
{ messages: [/* millions of messages */] }

// Good: Separate collection with reference
{ roomId: ObjectId }
```

### 2. Missing Indexes

```javascript
// Check explain plans
Message.find({ roomId }).explain('executionStats')
// Look for "stage": "COLLSCAN" (bad)
// Look for "stage": "IXSCAN" (good)
```

### 3. N+1 Queries

```javascript
// Bad: Query in loop
for (const member of room.members) {
  const user = await User.findById(member.userId);
}

// Good: Single query with $in
const userIds = room.members.map(m => m.userId);
const users = await User.find({ _id: { $in: userIds } });
```

### 4. Not Using Transactions

```javascript
// When you need atomicity across collections
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Room.updateOne({ _id: roomId }, { $pull: { members: { userId } } }, { session });
  await Message.deleteMany({ roomId, userId }, { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
}
```
