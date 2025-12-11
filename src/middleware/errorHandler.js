/**
 * Middleware global de manejo de errores
 * Procesa todos los errores de la aplicación y retorna respuestas consistentes
 */

const { AppError } = require('../utils/errors');
const { errorResponse } = require('../utils/response');

/**
 * Logger de errores
 * En producción, esto debería usar Winston u otro sistema de logging
 * @param {Error} error - Error a registrar
 * @param {Object} req - Request de Express
 */
const logError = (error, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
  };

  // En desarrollo, mostrar stack trace
  if (process.env.NODE_ENV === 'development') {
    errorLog.stack = error.stack;
  }

  // Log según severidad
  if (error.statusCode >= 500) {
    console.error('ERROR:', JSON.stringify(errorLog, null, 2));
  } else if (error.statusCode >= 400) {
    console.warn('WARNING:', JSON.stringify(errorLog, null, 2));
  } else {
    console.log('INFO:', JSON.stringify(errorLog, null, 2));
  }
};

/**
 * Determina si el error es operacional (esperado) o de programación
 * @param {Error} error - Error a evaluar
 * @returns {boolean} True si es error operacional
 */
const isOperationalError = error => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Maneja errores específicos de Prisma ORM
 * @param {Error} err - Error de Prisma
 * @param {Object} res - Response de Express
 */
const handlePrismaError = (err, res) => {
  let statusCode = 500;
  let code = 'DATABASE_ERROR';
  let message = 'Error en la base de datos';

  // P2002: Unique constraint violation
  if (err.code === 'P2002') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    const field = err.meta?.target?.[0] || 'campo';
    message = `Ya existe un registro con ese ${field}`;
  }

  // P2025: Record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    code = 'RESOURCE_NOT_FOUND';
    message = 'Recurso no encontrado';
  }

  // P2003: Foreign key constraint violation
  if (err.code === 'P2003') {
    statusCode = 400;
    code = 'INVALID_REFERENCE';
    message = 'Referencia inválida a otro recurso';
  }

  // P2014: Relation violation
  if (err.code === 'P2014') {
    statusCode = 400;
    code = 'RELATION_VIOLATION';
    message = 'No se puede eliminar el registro porque tiene relaciones activas';
  }

  const response = errorResponse(code, message);
  return res.status(statusCode).json(response);
};

/**
 * Middleware de manejo de errores global
 * Debe ser el último middleware en la cadena
 * @param {Error} err - Error capturado
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} _next - Next middleware (no usado, pero requerido por Express)
 */
const errorHandler = (err, req, res, _next) => {
  // Log del error
  logError(err, req);

  // Si es un error operacional conocido
  if (isOperationalError(err)) {
    const statusCode = err.statusCode || 500;
    const response = errorResponse(err.code, err.message, err.details);
    return res.status(statusCode).json(response);
  }

  // Manejo de errores específicos de Prisma
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // Manejo de errores de validación de Express
  if (err.name === 'ValidationError') {
    const response = errorResponse('VALIDATION_FAILED', 'Error de validación', err.errors);
    return res.status(400).json(response);
  }

  /*
   * Error inesperado (de programación)
   * En producción, no exponer detalles internos
   */
  const message =
    process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message;

  const response = errorResponse(
    'INTERNAL_SERVER_ERROR',
    message,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );

  return res.status(500).json(response);
};

/**
 * Middleware para capturar errores asíncronos
 * Envuelve funciones async para capturar errores automáticamente
 * @param {Function} fn - Función async a envolver
 * @returns {Function} Función envuelta con manejo de errores
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para manejar rutas no encontradas (404)
 * Debe colocarse antes del errorHandler
 */
const notFoundHandler = (req, res, _next) => {
  const response = errorResponse(
    'ROUTE_NOT_FOUND',
    `No se encontró la ruta: ${req.method} ${req.originalUrl}`,
    {
      method: req.method,
      path: req.originalUrl,
    }
  );
  res.status(404).json(response);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  isOperationalError,
};
