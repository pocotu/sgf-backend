/**
 * User Routes
 * Define las rutas para gestión de usuarios
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de usuarios
 * @param {Object} userController - Controlador de usuarios
 * @param {Object} authService - Servicio de autenticación (para middleware)
 * @returns {Router} Router configurado
 */
const configureUserRoutes = (userController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * POST /api/users
   * Crear nuevo usuario
   * Auth: Admin
   */
  router.post('/', authorizeRole('admin'), userController.create);

  /**
   * GET /api/users
   * Listar usuarios con filtros
   * Auth: Admin
   * Query params: ?rol=estudiante&estado=activo&search=juan&page=1&limit=10
   */
  router.get('/', authorizeRole('admin'), userController.list);

  /**
   * GET /api/users/:id
   * Obtener usuario por ID
   * Auth: Admin, Docente (solo su propio perfil), Estudiante (solo su propio perfil)
   */
  router.get(
    '/:id',
    (req, res, next) => {
      const requestedUserId = parseInt(req.params.id, 10);
      const currentUserId = req.user.usuarioId;
      const currentUserRole = req.user.rol;

      // Admin puede ver cualquier usuario
      if (currentUserRole === 'admin') {
        return next();
      }

      // Docente y Estudiante solo pueden ver su propio perfil
      if (requestedUserId === currentUserId) {
        return next();
      }

      // Si no cumple ninguna condición, denegar acceso
      const { ForbiddenError } = require('../utils/errors');
      throw new ForbiddenError('No tiene permisos para ver este usuario');
    },
    userController.getById
  );

  /**
   * PUT /api/users/:id
   * Actualizar usuario
   * Auth: Admin, Usuario (solo su propio perfil)
   */
  router.put(
    '/:id',
    (req, res, next) => {
      const requestedUserId = parseInt(req.params.id, 10);
      const currentUserId = req.user.usuarioId;
      const currentUserRole = req.user.rol;

      // Admin puede actualizar cualquier usuario
      if (currentUserRole === 'admin') {
        return next();
      }

      // Usuario solo puede actualizar su propio perfil
      if (requestedUserId === currentUserId) {
        return next();
      }

      // Si no cumple ninguna condición, denegar acceso
      const { ForbiddenError } = require('../utils/errors');
      throw new ForbiddenError('No tiene permisos para actualizar este usuario');
    },
    userController.update
  );

  /**
   * DELETE /api/users/:id
   * Eliminar usuario (soft delete)
   * Auth: Admin
   */
  router.delete('/:id', authorizeRole('admin'), userController.delete);

  return router;
};

module.exports = configureUserRoutes;
