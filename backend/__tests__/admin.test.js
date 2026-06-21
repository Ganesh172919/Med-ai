jest.mock('../models/User', () => ({
  findById: jest.fn(),
}));

const User = require('../models/User');
const adminCheck = require('../middleware/admin');

function createRes() {
  const res = { statusCode: null, body: null };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn((data) => { res.body = data; return res; });
  return res;
}

describe('admin middleware', () => {
  const next = jest.fn();

  beforeEach(() => {
    next.mockClear();
    User.findById.mockReset();
  });

  test('calls next when user is admin', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'u1', isAdmin: true }),
      }),
    });
    const req = { user: { id: 'u1' } };
    const res = createRes();
    await adminCheck(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 403 when user is not admin', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'u1', isAdmin: false }),
      }),
    });
    const req = { user: { id: 'u1' } };
    const res = createRes();
    await adminCheck(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Admin access required');
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when user not found', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });
    const req = { user: { id: 'nonexistent' } };
    const res = createRes();
    await adminCheck(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Admin access required');
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 500 when database query fails', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('DB connection failed')),
      }),
    });
    const req = { user: { id: 'u1' } };
    const res = createRes();
    await adminCheck(req, res, next);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Auth check failed');
    expect(next).not.toHaveBeenCalled();
  });

  test('queries User with correct id', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ isAdmin: true }),
      }),
    });
    const req = { user: { id: 'specific-user-id' } };
    const res = createRes();
    await adminCheck(req, res, next);
    expect(User.findById).toHaveBeenCalledWith('specific-user-id');
  });

  test('selects only isAdmin field', async () => {
    const selectMock = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ isAdmin: true }),
    });
    User.findById.mockReturnValue({ select: selectMock });
    const req = { user: { id: 'u1' } };
    const res = createRes();
    await adminCheck(req, res, next);
    expect(selectMock).toHaveBeenCalledWith('isAdmin');
  });
});
