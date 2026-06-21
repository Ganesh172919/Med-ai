/**
 * Tests for socket event handler registration and basic validation logic.
 *
 * These tests capture the event handlers registered via socket.on() and
 * invoke them directly with mock socket/io/callback objects.
 */

const { typingUsers, roomUsers, socketFlood, ALLOWED_REACTIONS } = require('../socket/state');

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../models/Room', () => ({ findById: jest.fn() }));
jest.mock('../models/Message', () => ({
  findById: jest.fn(),
  updateMany: jest.fn(),
}));
jest.mock('../models/User', () => ({ findById: jest.fn() }));

const Room = require('../models/Room');
const Message = require('../models/Message');

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Create a mock socket that captures .on() handlers for later invocation.
 */
function createMockSocket(user = { id: 'u1', username: 'alice', email: 'alice@test.com' }) {
  const handlers = {};
  const socket = {
    id: 'socket-1',
    user,
    rooms: new Set(),
    on: jest.fn((event, fn) => { handlers[event] = fn; }),
    join: jest.fn(),
    leave: jest.fn(),
    to: jest.fn(() => ({ emit: jest.fn() })),
    emit: jest.fn(),
  };
  return { socket, handlers };
}

function createMockIo() {
  return {
    to: jest.fn(() => ({ emit: jest.fn() })),
  };
}

function createAck() {
  return jest.fn();
}

// ── Typing Handler Tests ───────────────────────────────────────────────────

describe('socket typing handlers', () => {
  let handlers;
  let socket;
  let io;

  beforeEach(() => {
    jest.useFakeTimers();
    typingUsers.clear();
    socketFlood.clear();
    roomUsers.clear();

    const mock = createMockSocket();
    socket = mock.socket;
    handlers = mock.handlers;
    io = createMockIo();

    // Manually register typing handlers by capturing socket.on calls
    // We need to call the actual register function
    const { registerTypingHandlers } = require('../socket/handlers/typing');
    registerTypingHandlers(socket, io);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('typing_start validates room membership', () => {
    const ack = createAck();
    // socket is NOT in any room, so isSocketInRoom should fail
    handlers.typing_start({ roomId: '507f1f77bcf86cd799439011' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  test('typing_start requires roomId', () => {
    const ack = createAck();
    handlers.typing_start({}, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  test('typing_stop requires roomId', () => {
    const ack = createAck();
    handlers.typing_stop({}, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  test('typing_stop validates room membership', () => {
    const ack = createAck();
    handlers.typing_stop({ roomId: '507f1f77bcf86cd799439011' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});

// ── Room Handler Tests ─────────────────────────────────────────────────────

describe('socket room handlers', () => {
  let handlers;
  let socket;
  let io;

  beforeEach(() => {
    socketFlood.clear();
    roomUsers.clear();
    typingUsers.clear();

    const mock = createMockSocket();
    socket = mock.socket;
    handlers = mock.handlers;
    io = createMockIo();

    const { registerRoomHandlers } = require('../socket/handlers/room');
    registerRoomHandlers(socket, io);
  });

  test('join_room rejects invalid room ID', async () => {
    const ack = createAck();
    await handlers.join_room('invalid-id', ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid room ID' }));
  });

  test('join_room rejects when room not found', async () => {
    Room.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });
    const ack = createAck();
    await handlers.join_room('507f1f77bcf86cd799439011', ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Room not found' }));
  });

  test('join_room rejects non-members', async () => {
    Room.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'room1',
        members: [{ userId: 'other-user', role: 'member' }],
      }),
    });
    const ack = createAck();
    await handlers.join_room('507f1f77bcf86cd799439011', ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Join this room before connecting to chat' }));
  });

  test('leave_room rejects when not in room', () => {
    const ack = createAck();
    handlers.leave_room('507f1f77bcf86cd799439011', ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'You are not connected to that room' }));
  });
});

// ── Reaction Handler Tests ─────────────────────────────────────────────────

describe('socket reaction handlers', () => {
  let handlers;
  let socket;
  let io;

  beforeEach(() => {
    socketFlood.clear();
    roomUsers.clear();

    const mock = createMockSocket();
    socket = mock.socket;
    handlers = mock.handlers;
    io = createMockIo();

    const { registerReactionHandlers } = require('../socket/handlers/reaction');
    registerReactionHandlers(socket, io);
  });

  test('add_reaction rejects invalid room ID', async () => {
    const ack = createAck();
    await handlers.add_reaction({ roomId: 'bad', messageId: '507f1f77bcf86cd799439011', emoji: '👍' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid room or message ID' }));
  });

  test('add_reaction rejects invalid message ID', async () => {
    const ack = createAck();
    await handlers.add_reaction({ roomId: '507f1f77bcf86cd799439011', messageId: 'bad', emoji: '👍' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid room or message ID' }));
  });

  test('add_reaction rejects unsupported emoji', async () => {
    const ack = createAck();
    await handlers.add_reaction(
      { roomId: '507f1f77bcf86cd799439011', messageId: '507f1f77bcf86cd799439012', emoji: '🎃' },
      ack
    );
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unsupported reaction' }));
  });

  test('add_reaction rejects when not a room member', async () => {
    Room.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'room1',
        members: [{ userId: 'other-user', role: 'member' }],
      }),
    });
    const ack = createAck();
    await handlers.add_reaction(
      { roomId: '507f1f77bcf86cd799439011', messageId: '507f1f77bcf86cd799439012', emoji: '👍' },
      ack
    );
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Join this room before reacting' }));
  });
});

// ── Pin Handler Tests ──────────────────────────────────────────────────────

describe('socket pin handlers', () => {
  let handlers;
  let socket;
  let io;

  beforeEach(() => {
    socketFlood.clear();
    roomUsers.clear();

    const mock = createMockSocket();
    socket = mock.socket;
    handlers = mock.handlers;
    io = createMockIo();

    const { registerPinHandlers } = require('../socket/handlers/pin');
    registerPinHandlers(socket, io);
  });

  test('pin_message rejects invalid IDs', async () => {
    const ack = createAck();
    await handlers.pin_message({ roomId: 'bad', messageId: 'bad' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid room or message ID' }));
  });

  test('pin_message rejects non-members', async () => {
    Room.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'room1',
        members: [{ userId: 'other-user', role: 'admin' }],
        creatorId: 'other-user',
        pinnedMessages: [],
      }),
    });
    const ack = createAck();
    await handlers.pin_message(
      { roomId: '507f1f77bcf86cd799439011', messageId: '507f1f77bcf86cd799439012' },
      ack
    );
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Join this room before pinning messages' }));
  });

  test('unpin_message rejects invalid IDs', async () => {
    const ack = createAck();
    await handlers.unpin_message({ roomId: 'bad', messageId: 'bad' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid room or message ID' }));
  });
});

// ── Message Handler Tests ──────────────────────────────────────────────────

describe('socket message handlers', () => {
  let handlers;
  let socket;
  let io;

  beforeEach(() => {
    socketFlood.clear();
    roomUsers.clear();
    typingUsers.clear();

    const mock = createMockSocket();
    socket = mock.socket;
    handlers = mock.handlers;
    io = createMockIo();

    const { registerMessageHandlers } = require('../socket/handlers/message');
    registerMessageHandlers(socket, io);
  });

  test('send_message rejects empty content without file', async () => {
    const ack = createAck();
    await handlers.send_message({ roomId: '507f1f77bcf86cd799439011' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Message content or a file is required' }));
  });

  test('send_message rejects content over 4000 chars', async () => {
    const ack = createAck();
    await handlers.send_message(
      { roomId: '507f1f77bcf86cd799439011', content: 'x'.repeat(4001) },
      ack
    );
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Messages must be under 4000 characters' }));
  });

  test('send_message rejects invalid room ID', async () => {
    const ack = createAck();
    await handlers.send_message({ roomId: 'invalid', content: 'hello' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid room ID' }));
  });

  test('reply_message rejects empty content', async () => {
    const ack = createAck();
    await handlers.reply_message({ roomId: '507f1f77bcf86cd799439011', content: '' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Content is required' }));
  });

  test('reply_message rejects content over 4000 chars', async () => {
    const ack = createAck();
    await handlers.reply_message(
      { roomId: '507f1f77bcf86cd799439011', content: 'x'.repeat(4001) },
      ack
    );
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Replies must be under 4000 characters' }));
  });

  test('edit_message rejects empty content', async () => {
    const ack = createAck();
    await handlers.edit_message(
      { roomId: '507f1f77bcf86cd799439011', messageId: '507f1f77bcf86cd799439012', newContent: '' },
      ack
    );
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Content is required' }));
  });

  test('edit_message rejects content over 4000 chars', async () => {
    const ack = createAck();
    await handlers.edit_message(
      { roomId: '507f1f77bcf86cd799439011', messageId: '507f1f77bcf86cd799439012', newContent: 'x'.repeat(4001) },
      ack
    );
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Messages must be under 4000 characters' }));
  });

  test('delete_message rejects invalid IDs', async () => {
    const ack = createAck();
    await handlers.delete_message({ roomId: 'bad', messageId: 'bad' }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid room or message ID' }));
  });

  test('mark_read rejects missing params', async () => {
    const ack = createAck();
    await handlers.mark_read({}, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Room ID and message IDs are required' }));
  });

  test('mark_read rejects empty messageIds', async () => {
    const ack = createAck();
    await handlers.mark_read({ roomId: '507f1f77bcf86cd799439011', messageIds: [] }, ack);
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Room ID and message IDs are required' }));
  });

  test('mark_read rejects when not in room', async () => {
    const ack = createAck();
    await handlers.mark_read(
      { roomId: '507f1f77bcf86cd799439011', messageIds: ['507f1f77bcf86cd799439012'] },
      ack
    );
    expect(ack).toHaveBeenCalledWith(expect.objectContaining({ error: 'Join the room before marking messages as read' }));
  });
});
