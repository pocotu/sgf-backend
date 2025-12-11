/**
 * Authentication and Authorization Middleware
 * Valida tokens JWT y verifica permisos por rol
 */

const { AuthError, ForbiddenError } = require('../utils/errors');
const { asyncHandler } = require('./errorHandler');

/**
 * Middleware para autenticar JWT token
 * Extrae el token del header Authorization y lo valida
 * Adjunta el usuario decodificado a req.user
 */
const authenticateJWT = (authService) => {
  return asyncHandler((req, res, next) => {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthError(
        'Token de autenticación requerido',
        'AUTH_TOKEN_REQUIRED'
      );
    }

    // Verificar formato: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthError(
        'Formato de token inválido. Use: Bearer <token>',
        'AUTH_TOKEN_INVALID'
      );
    }

    const token = parts[1];

    // Verificar y decodificar token
    const decoded = authService.verifyToken(token);

    // Adjuntar usuario a request
    req.user = decoded;

    next();
  });
};

/**
 * Middleware para autorizar por rol
 * Verifica que el usuario tenga uno de los roles permitidos
 * @param {...string} allowedRoles - Roles permitidos
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      throw new AuthError(
        'Usuario no autenticado',
        'AUTH_TOKEN_REQUIRED'
      );
    }

    // Verificar que el rol del usuario esté en los roles permitidos
    if (!allowedRoles.includes(req.user.rol)) {
      throw new ForbiddenError(
        'No tiene permisos para realizar esta operación'
      );
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRole,
};
