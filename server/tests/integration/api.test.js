const request = require('supertest');
const createApp = require('../../src/app');

describe('API Integration Tests', () => {
  let app;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.MOCK_MODE = 'true';
    app = createApp();
  });

  describe('GET /health', () => {
    it('should return 200 with system status and operational mode', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.mode).toBe('simulation');
      expect(res.body.storage).toBeDefined();
    });
  });

  describe('POST /generate-ephemeral-key & /api/session/ephemeral-key', () => {
    it('should return a simulated ephemeral session key in mock mode', async () => {
      const res = await request(app).post('/generate-ephemeral-key');
      expect(res.status).toBe(200);
      expect(res.body.client_secret).toBeDefined();
      expect(res.body.client_secret.value).toContain('eph_mock_');
    });

    it('should return ephemeral key from namespaced route', async () => {
      const res = await request(app).post('/api/session/ephemeral-key');
      expect(res.status).toBe(200);
      expect(res.body.client_secret).toBeDefined();
    });
  });

  describe('POST /translate & /api/translate', () => {
    it('should translate clinical text in mock mode', async () => {
      const res = await request(app)
        .post('/translate')
        .send({
          text: 'I need to check your symptoms',
          source_language: 'english',
          target_language: 'spanish'
        });

      expect(res.status).toBe(200);
      expect(res.body.translatedText).toBe('Necesito revisar sus síntomas');
    });

    it('should reject request without text', async () => {
      const res = await request(app).post('/translate').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /conversations and GET /api/conversations', () => {
    it('should save conversation messages and retrieve them', async () => {
      const payload = {
        messages: [
          { sender: 'doctor', text: 'Hello', timestamp: new Date().toISOString() },
          { sender: 'patient', text: 'Hola', timestamp: new Date().toISOString() }
        ]
      };

      const postRes = await request(app).post('/conversations').send(payload);
      expect(postRes.status).toBe(201);
      expect(postRes.body.id).toBeDefined();

      const getRes = await request(app).get(`/api/conversations/${postRes.body.id}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.messages.length).toBe(2);
    });
  });
});
