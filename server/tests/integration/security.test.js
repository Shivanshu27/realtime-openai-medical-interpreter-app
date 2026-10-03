const request = require('supertest');
const createApp = require('../../src/app');
const baseConfig = require('../../src/config');
const { validateConfig } = require('../../src/config');

const TOKEN = 'test-access-token-123';

function makeApp(overrides = {}) {
  return createApp({
    config: {
      ...baseConfig,
      mockMode: true,
      accessToken: TOKEN,
      corsOrigins: ['http://localhost:3000'],
      rateLimitWindowMs: 60000,
      sessionRateLimitMax: 100,
      apiRateLimitMax: 100,
      ...overrides,
    },
  });
}

const auth = { Authorization: `Bearer ${TOKEN}` };

describe('access token', () => {
  const app = makeApp();

  it.each([
    ['post', '/api/session/ephemeral-key'],
    ['post', '/generate-ephemeral-key'],
    ['post', '/api/translate'],
    ['post', '/translate'],
    ['get', '/api/conversations'],
    ['post', '/api/conversations'],
    ['post', '/conversations'],
  ])('%s %s rejects a request with no token', async (method, path) => {
    const res = await request(app)[method](path).send({});
    expect(res.status).toBe(401);
    expect(res.headers['www-authenticate']).toMatch(/^Bearer/);
  });

  it('rejects a wrong token', async () => {
    const res = await request(app)
      .post('/api/session/ephemeral-key')
      .set('Authorization', 'Bearer not-the-token');
    expect(res.status).toBe(401);
  });

  it('accepts the right token', async () => {
    const res = await request(app).post('/api/session/ephemeral-key').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.client_secret.value).toContain('eph_mock_');
  });

  it('protects transcripts: listing needs the token', async () => {
    const denied = await request(app).get('/api/conversations');
    expect(denied.status).toBe(401);
    const allowed = await request(app).get('/api/conversations').set(auth);
    expect(allowed.status).toBe(200);
  });

  it('keeps /health public for load balancers', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});

describe('fail closed in live mode', () => {
  it('refuses to start live (billable) mode without an access token', () => {
    expect(() => validateConfig({ ...baseConfig, mockMode: false, accessToken: '' })).toThrow(
      /APP_ACCESS_TOKEN is required/
    );
  });

  it('allows live mode with a token, and simulation mode without one', () => {
    expect(() => validateConfig({ ...baseConfig, mockMode: false, accessToken: 'x' })).not.toThrow();
    expect(() => validateConfig({ ...baseConfig, mockMode: true, accessToken: '' })).not.toThrow();
  });
});

describe('CORS allow-list', () => {
  const app = makeApp();

  it('grants an allowed origin', async () => {
    const res = await request(app).get('/health').set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('gives a foreign origin no CORS grant', async () => {
    const res = await request(app).get('/health').set('Origin', 'https://evil.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('does not grant a foreign origin on preflight either', async () => {
    const res = await request(app)
      .options('/api/conversations')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('allows Authorization on preflight for an allowed origin', async () => {
    const res = await request(app)
      .options('/api/session/ephemeral-key')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-headers']).toMatch(/Authorization/i);
  });
});

describe('rate limiting', () => {
  it('returns 429 with Retry-After once the session budget is spent', async () => {
    const app = makeApp({ sessionRateLimitMax: 2 });
    const codes = [];
    for (let i = 0; i < 3; i += 1) {
      const res = await request(app).post('/api/session/ephemeral-key').set(auth);
      codes.push(res.status);
      if (res.status === 429) {
        expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
      }
    }
    expect(codes).toEqual([200, 200, 429]);
  });

  it('throttles token guessing too (limit applies before auth)', async () => {
    const app = makeApp({ sessionRateLimitMax: 2 });
    const codes = [];
    for (let i = 0; i < 3; i += 1) {
      const res = await request(app)
        .post('/api/session/ephemeral-key')
        .set('Authorization', `Bearer guess-${i}`);
      codes.push(res.status);
    }
    expect(codes).toEqual([401, 401, 429]);
  });
});
