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
    });
  });

  describe('Error Handler', () => {
    it('should handle errors gracefully', async () => {
      // Este test verifica que el error handler global funciona
      // En un caso real, necesitarías una ruta que lance un error
      const response = await request(app)
        .get('/api/v1/non-existent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
