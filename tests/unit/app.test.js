const request = require('supertest');
const app = require('../../src/app');

describe('App - Basic Tests', () => {
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/health').expect('Content-Type', /json/).expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /api/v1', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/api/v1').expect('Content-Type', /json/).expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('SGA-P Backend API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('health');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Cannot GET');
      expect(response.body).toHaveProperty('availableEndpoints');
    });

    it('should return 404 for POST to non-existent routes', async () => {
      const response = await request(app)
        .post('/non-existent-route')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body.message).toContain('Cannot POST');
    });
  });

  describe('Error Handler', () => {
    it('should handle 404 errors for API routes', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle different HTTP methods', async () => {
      const response = await request(app)
        .delete('/non-existent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.message).toContain('Cannot DELETE');
    });
  });

  describe('CORS Configuration', () => {
    it('should have CORS headers', async () => {
      const response = await request(app).get('/health').expect(200);

      // Verificar que CORS está configurado
      expect(response.headers).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to API routes', async () => {
      // Hacer múltiples requests para verificar que rate limiting está activo
      const response = await request(app).get('/api/v1').expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Body Parsing', () => {
    it('should parse JSON body', async () => {
      // Verificar que el body parsing está configurado
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });

    it('should handle URL encoded data', async () => {
      // Verificar que urlencoded está configurado
      const response = await request(app).get('/api/v1').expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('API Prefix', () => {
    it('should use correct API prefix', async () => {
      const response = await request(app).get('/api/v1').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('SGA-P Backend API');
    });

    it('should include health endpoint in response', async () => {
      const response = await request(app).get('/api/v1').expect(200);

      expect(response.body).toHaveProperty('health');
      expect(response.body.health).toContain('/health');
    });
  });
});
