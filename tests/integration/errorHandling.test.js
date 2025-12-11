/**
 * Tests de integración para el sistema de manejo de errores
 * Verifica que los errores se manejen correctamente en el flujo completo de la aplicación
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Error Handling Integration Tests', () => {
  describe('404 Errors', () => {
    it('should return consistent 404 error for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent-endpoint')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: expect.stringContaining('No se encontró la ruta'),
          details: {
            method: 'GET',
            path: '/api/v1/non-existent-endpoint',
          },
        },
      });
    });

    it('should handle 404 for different HTTP methods', async () => {
      const methods = ['get', 'post', 'put', 'delete', 'patch'];

      for (const method of methods) {
        const response = await request(app)
          [method]('/api/v1/test-endpoint')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
        expect(response.body.error.message).toContain(method.toUpperCase());
      }
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format', async () => {
      const response = await request(app)
        .get('/api/v1/invalid')
        .expect(404);

      // Verificar estructura de respuesta de error
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(typeof response.body.error.code).toBe('string');
      expect(typeof response.body.error.message).toBe('string');
    });

    it('should include details when available', async () => {
      const response = await request(app)
        .post('/api/v1/test')
        .expect(404);

      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error.details).toHaveProperty('method');
      expect(response.body.error.details).toHaveProperty('path');
    });
  });

  describe('Health Check', () => {
    it('should not interfere with successful responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).not.toHaveProperty('error');
    });
  });

  describe('API Welcome', () => {
    it('should not interfere with API root endpoint', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).not.toHaveProperty('error');
    });
  });
});
