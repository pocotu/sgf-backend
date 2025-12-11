/**
 * Tests unitarios para middleware de manejo de errores
 */

const {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  isOperationalError,
} = require('../../../src/middleware/errorHandler');
const {
  ValidationError,
  AuthError,
  NotFoundError,
  AppError: _AppError,
} = require('../../../src/utils/errors');

describe('Error Handler Middleware', () => {
  let req;
  let res;
  let next;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();

    // Silenciar logs durante tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('isOperationalError', () => {
    it('should return true for AppError instances', () => {
      const error = new ValidationError('Test error');
      expect(isOperationalError(error)).toBe(true);
    });

    it('should return false for generic Error instances', () => {
      const error = new Error('Generic error');
      expect(isOperationalError(error)).toBe(false);
    });
  });

  describe('errorHandler', () => {
    it('should handle ValidationError correctly', () => {
      const error = new ValidationError('DNI inválido', { dni: 'Debe tener 8 dígitos' });

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'DNI inválido',
          details: { dni: 'Debe tener 8 dígitos' },
        },
      });
    });

    it('should handle AuthError correctly', () => {
      const error = new AuthError('Token inválido', 'AUTH_TOKEN_INVALID');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Token inválido',
        },
      });
    });

    it('should handle NotFoundError correctly', () => {
      const error = new NotFoundError('Usuario no encontrado');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Usuario no encontrado',
        },
      });
    });

    it('should handle Prisma unique constraint error (P2002)', () => {
      const error = {
        code: 'P2002',
        meta: { target: ['dni'] },
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Ya existe un registro con ese dni',
        },
      });
    });

    it('should handle Prisma record not found error (P2025)', () => {
      const error = {
        code: 'P2025',
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Recurso no encontrado',
        },
      });
    });

    it('should handle Prisma foreign key error (P2003)', () => {
      const error = {
        code: 'P2003',
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_REFERENCE',
          message: 'Referencia inválida a otro recurso',
        },
      });
    });

    it('should handle generic errors in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Unexpected error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error interno del servidor',
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should include error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Unexpected error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      const response = res.json.mock.calls[0][0];
      expect(response.error.message).toBe('Unexpected error');
      expect(response.error.details).toBeDefined();
      expect(response.error.details.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async function', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch and forward async errors', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous errors thrown in function', async () => {
      const error = new ValidationError('Sync error');
      // eslint-disable-next-line require-await
      const asyncFn = async () => {
        throw error;
      };
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with route information', () => {
      req.method = 'POST';
      req.originalUrl = '/api/nonexistent';

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: 'No se encontró la ruta: POST /api/nonexistent',
          details: {
            method: 'POST',
            path: '/api/nonexistent',
          },
        },
      });
    });
  });
});
