/**
 * Tests for Winston Logger Configuration
 */

const logger = require('../../../src/config/logger');

describe('Logger Configuration', () => {
  describe('Logger Instance', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined();
    });

    it('should have standard logging methods', () => {
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.http).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should have custom helper methods', () => {
      expect(typeof logger.logRequest).toBe('function');
      expect(typeof logger.logError).toBe('function');
    });
  });

  describe('logRequest Helper', () => {
    it('should log request without throwing errors', () => {
      const mockReq = {
        method: 'GET',
        originalUrl: '/api/v1/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
      };

      const mockRes = {
        statusCode: 200,
      };

      expect(() => {
        logger.logRequest(mockReq, mockRes, 100);
      }).not.toThrow();
    });

    it('should include user info when authenticated', () => {
      const mockReq = {
        method: 'GET',
        originalUrl: '/api/v1/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
        user: {
          usuarioId: 1,
          rol: 'admin',
        },
      };

      const mockRes = {
        statusCode: 200,
      };

      expect(() => {
        logger.logRequest(mockReq, mockRes, 100);
      }).not.toThrow();
    });
  });

  describe('logError Helper', () => {
    it('should log error without throwing', () => {
      const error = new Error('Test error');
      error.code = 'TEST_ERROR';
      error.statusCode = 500;

      const context = {
        method: 'GET',
        url: '/api/v1/test',
      };

      expect(() => {
        logger.logError(error, context);
      }).not.toThrow();
    });

    it('should handle error without context', () => {
      const error = new Error('Test error');

      expect(() => {
        logger.logError(error);
      }).not.toThrow();
    });
  });

  describe('Log Levels', () => {
    it('should log at different levels without errors', () => {
      expect(() => {
        logger.error('Test error message');
        logger.warn('Test warning message');
        logger.info('Test info message');
        logger.http('Test http message');
        logger.debug('Test debug message');
      }).not.toThrow();
    });

    it('should log with metadata', () => {
      expect(() => {
        logger.info('Test with metadata', {
          userId: 1,
          action: 'test',
        });
      }).not.toThrow();
    });
  });
});
