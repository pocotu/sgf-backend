/**
 * Integration tests for Health Check endpoints
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Health Check Endpoints - Integration', () => {
  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return detailed health check with all components', async () => {
      const response = await request(app).get('/api/v1/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('responseTime');

      // Verify checks structure
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('memory');
      expect(response.body.checks).toHaveProperty('process');

      // Verify database check
      expect(response.body.checks.database).toHaveProperty('status');
      expect(response.body.checks.database).toHaveProperty('responseTime');

      // Verify memory check
      expect(response.body.checks.memory).toHaveProperty('status', 'OK');
      expect(response.body.checks.memory).toHaveProperty('heapUsed');
      expect(response.body.checks.memory).toHaveProperty('heapTotal');
      expect(response.body.checks.memory).toHaveProperty('rss');

      // Verify process check
      expect(response.body.checks.process).toHaveProperty('status', 'OK');
      expect(response.body.checks.process).toHaveProperty('pid');
      expect(response.body.checks.process).toHaveProperty('nodeVersion');
      expect(response.body.checks.process).toHaveProperty('platform');
    });
  });

  describe('GET /api/v1/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/api/v1/health/ready').expect(200);

      expect(response.body).toHaveProperty('status', 'READY');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app).get('/api/v1/health/live').expect(200);

      expect(response.body).toHaveProperty('status', 'ALIVE');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });
});
