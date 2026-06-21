describe('auth.routes.js module', () => {
  test('exports an Express router', () => {
    const router = require('../routes/auth.routes');
    expect(router).toBeDefined();
    expect(typeof router).toBe('function');
  });

  test('router has stack with routes', () => {
    const router = require('../routes/auth.routes');
    expect(router.stack).toBeDefined();
    expect(Array.isArray(router.stack)).toBe(true);
    expect(router.stack.length).toBeGreaterThan(0);
  });

  test('router has register route', () => {
    const router = require('../routes/auth.routes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

    const register = routes.find((r) => r.path === '/register');
    expect(register).toBeDefined();
    expect(register.methods).toContain('post');
  });

  test('router has login route', () => {
    const router = require('../routes/auth.routes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

    const login = routes.find((r) => r.path === '/login');
    expect(login).toBeDefined();
    expect(login.methods).toContain('post');
  });

  test('router has refresh route', () => {
    const router = require('../routes/auth.routes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

    const refresh = routes.find((r) => r.path === '/refresh');
    expect(refresh).toBeDefined();
    expect(refresh.methods).toContain('post');
  });

  test('router has logout route', () => {
    const router = require('../routes/auth.routes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

    const logout = routes.find((r) => r.path === '/logout');
    expect(logout).toBeDefined();
    expect(logout.methods).toContain('post');
  });

  test('router has me route', () => {
    const router = require('../routes/auth.routes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

    const me = routes.find((r) => r.path === '/me');
    expect(me).toBeDefined();
    expect(me.methods).toContain('get');
  });

  test('router has forgot-password route', () => {
    const router = require('../routes/auth.routes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

    const forgot = routes.find((r) => r.path === '/forgot-password');
    expect(forgot).toBeDefined();
    expect(forgot.methods).toContain('post');
  });

  test('router has reset-password route', () => {
    const router = require('../routes/auth.routes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

    const reset = routes.find((r) => r.path === '/reset-password');
    expect(reset).toBeDefined();
    expect(reset.methods).toContain('post');
  });

  test('router has google routes', () => {
    const router = require('../routes/auth.routes');
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({ path: layer.route.path, methods: Object.keys(layer.route.methods) }));

    const google = routes.find((r) => r.path === '/google');
    expect(google).toBeDefined();
    expect(google.methods).toContain('get');

    const googleCallback = routes.find((r) => r.path === '/google/callback');
    expect(googleCallback).toBeDefined();

    const googleExchange = routes.find((r) => r.path === '/google/exchange');
    expect(googleExchange).toBeDefined();
    expect(googleExchange.methods).toContain('post');
  });

  test('router has expected number of routes', () => {
    const router = require('../routes/auth.routes');
    const routes = router.stack.filter((layer) => layer.route);
    expect(routes.length).toBe(10);
  });
});
