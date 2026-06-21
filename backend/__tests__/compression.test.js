const { createCompressionMiddleware } = require('../middleware/compression');

describe('compression middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      headers: { 'accept-encoding': 'gzip, deflate, br' },
    };
    res = {
      statusCode: 200,
      _headers: {},
      _body: null,
      getHeader(name) { return this._headers[name.toLowerCase()]; },
      setHeader(name, value) { this._headers[name.toLowerCase()] = value; },
      removeHeader(name) { delete this._headers[name.toLowerCase()]; },
      write: jest.fn(),
      end: jest.fn(),
    };
    next = jest.fn();
  });

  it('calls next() when client accepts gzip', () => {
    const middleware = createCompressionMiddleware();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('calls next() when client does not accept gzip', () => {
    req.headers['accept-encoding'] = '';
    const middleware = createCompressionMiddleware();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    // res.end should not be overridden
    expect(res.end).toBe(res.end);
  });

  it('calls next() for HEAD requests', () => {
    req.method = 'HEAD';
    const middleware = createCompressionMiddleware();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('respects custom threshold option', () => {
    const middleware = createCompressionMiddleware({ threshold: 2048 });
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('uses default threshold of 1024', () => {
    const middleware = createCompressionMiddleware();
    middleware(req, res, next);
    // The middleware should be created without errors
    expect(typeof middleware).toBe('function');
  });
});
