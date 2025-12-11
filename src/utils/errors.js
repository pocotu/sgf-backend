/**
 * Clases de error personalizadas para el sistema
 * Todas las clases extienden Error y siguen el patrón estándar de JavaScript
 */

/**
 * Error base para todos los errores personalizados del sistema
 */
class AppError extends Error {
  /**
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código HTTP
   * @param {string} code - Código de error interno
   * @param {Object} details - Detalles adicionales opcionales
   */
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación (400)
 * Se usa cuando los datos de entrada no cumplen con las reglas de validación
 */
class ValidationError extends AppError {
  /**
   * @param {string} message - Mensaje descriptivo del error de validación
   * @param {Object} details - Detalles de los campos inválidos
   */
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_FAILED', details);
  }
}

/**
 * Error de autenticación (401)
 * Se usa cuando las credenciales son inválidas o el token es inválido/expirado
 */
class AuthError extends AppError {
  /**
   * @param {string} message - Mensaje descriptivo del error de autenticación
   * @param {string} code - Código específico de error de autenticación
   */
  constructor(message, code = 'AUTH_FAILED') {
    super(message, 401, code);
  }
}

/**
 * Error de autorización (403)
 * Se usa cuando el usuario no tiene permisos para realizar la operación
 */
class ForbiddenError extends AppError {
  /**
   * @param {string} message - Mensaje descriptivo del error de autorización
   */
  constructor(message = 'Acceso denegado') {
    super(message, 403, 'AUTH_ACCESS_DENIED');
  }
}

/**
 * Error de recurso no encontrado (404)
 * Se usa cuando un recurso solicitado no existe
 */
class NotFoundError extends AppError {
  /**
   * @param {string} message - Mensaje descriptivo del recurso no encontrado
   */
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'RESOURCE_NOT_FOUND');
  }
}

/**
 * Error de lógica de negocio (422)
 * Se usa cuando la operación no puede completarse por reglas de negocio
 */
class BusinessLogicError extends AppError {
  /**
   * @param {string} message - Mensaje descriptivo del error de negocio
   * @param {string} code - Código específico de error de negocio
   * @param {Object} details - Detalles adicionales
   */
  constructor(message, code = 'BUSINESS_LOGIC_ERROR', details = null) {
    super(message, 422, code, details);
  }
}

/**
 * Error de base de datos (500)
 * Se usa cuando ocurre un error en operaciones de base de datos
 */
class DatabaseError extends AppError {
  /**
   * @param {string} message - Mensaje descriptivo del error
   * @param {Object} details - Detalles del error (no se exponen al cliente)
   */
  constructor(message = 'Error en la base de datos', details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

/**
 * Error interno del servidor (500)
 * Se usa para errores inesperados del sistema
 */
class InternalServerError extends AppError {
  /**
   * @param {string} message - Mensaje descriptivo del error
   * @param {Object} details - Detalles del error (no se exponen al cliente)
   */
  constructor(message = 'Error interno del servidor', details = null) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  BusinessLogicError,
  DatabaseError,
  InternalServerError,
};
