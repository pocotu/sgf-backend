/**
 * Tests unitarios para clases de error personalizadas
 */

const {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  BusinessLogicError,
  DatabaseError,
  InternalServerError,
} = require('../../../src/utils/errors');

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR', { field: 'test' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'test' });
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
      expect(error.stack).toBeDefined();
    });

    it('should create error without details', () => {
      const error = new AppError('Test error', 500, 'TEST_ERROR');

      expect(error.details).toBeNull();
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with correct defaults', () => {
      const error = new ValidationError('DNI debe tener 8 dígitos');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('DNI debe tener 8 dígitos');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_FAILED');
      expect(error.isOperational).toBe(true);
    });

    it('should include validation details', () => {
      const details = {
        dni: 'DNI debe tener 8 dígitos',
        correo: 'Correo inválido',
      };
      const error = new ValidationError('Error de validación', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('AuthError', () => {
    it('should create auth error with default code', () => {
      const error = new AuthError('Credenciales inválidas');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Credenciales inválidas');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTH_FAILED');
    });

    it('should create auth error with custom code', () => {
      const error = new AuthError('Token expirado', 'AUTH_TOKEN_EXPIRED');

      expect(error.code).toBe('AUTH_TOKEN_EXPIRED');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error with default message', () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Acceso denegado');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTH_ACCESS_DENIED');
    });

    it('should create forbidden error with custom message', () => {
      const error = new ForbiddenError('No tiene permisos de administrador');

      expect(error.message).toBe('No tiene permisos de administrador');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default message', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Recurso no encontrado');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('should create not found error with custom message', () => {
      const error = new NotFoundError('Usuario no encontrado');

      expect(error.message).toBe('Usuario no encontrado');
    });
  });

  describe('BusinessLogicError', () => {
    it('should create business logic error with default code', () => {
      const error = new BusinessLogicError('Grupo sin cupos disponibles');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Grupo sin cupos disponibles');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('BUSINESS_LOGIC_ERROR');
    });

    it('should create business logic error with custom code', () => {
      const error = new BusinessLogicError(
        'Grupo sin cupos',
        'ENROLLMENT_NO_CAPACITY',
        { available: 0, required: 1 }
      );

      expect(error.code).toBe('ENROLLMENT_NO_CAPACITY');
      expect(error.details).toEqual({ available: 0, required: 1 });
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with default message', () => {
      const error = new DatabaseError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Error en la base de datos');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });

    it('should create database error with custom message and details', () => {
      const error = new DatabaseError('Error al conectar', { host: 'localhost' });

      expect(error.message).toBe('Error al conectar');
      expect(error.details).toEqual({ host: 'localhost' });
    });
  });

  describe('InternalServerError', () => {
    it('should create internal server error with default message', () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Error interno del servidor');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should create internal server error with custom message', () => {
      const error = new InternalServerError('Error inesperado', { trace: 'xyz' });

      expect(error.message).toBe('Error inesperado');
      expect(error.details).toEqual({ trace: 'xyz' });
    });
  });

  describe('Error inheritance', () => {
    it('should maintain proper prototype chain', () => {
      const errors = [
        new ValidationError('test'),
        new AuthError('test'),
        new ForbiddenError('test'),
        new NotFoundError('test'),
        new BusinessLogicError('test'),
        new DatabaseError('test'),
        new InternalServerError('test'),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.isOperational).toBe(true);
        expect(error.stack).toBeDefined();
      });
    });
  });
});
