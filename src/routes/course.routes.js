/**
 * Course Routes
 * Define las rutas para gestión de cursos
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de cursos
 * @param {Object} courseController - Controlador de cursos
 * @param {Object} authService - Servicio de autenticación (para middleware)
 * @returns {Router} Router configurado
 */
const configureCourseRoutes = (courseController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * POST /api/courses
   * Crear nuevo curso
   * Auth: Admin
   */
  router.post('/', authorizeRole('admin'), courseController.create);

  /**
   * GET /api/courses
   * Listar cursos con filtros
   * Auth: Admin, Docente
   * Query params: ?area=A&estado=activo&search=matematica&page=1&limit=10
   */
  router.get(
    '/',
    authorizeRole('admin', 'docente'),
    courseController.list
  );

  /**
   * GET /api/courses/:id
   * Obtener curso por ID
   * Auth: Admin, Docente
   */
  router.get(
    '/:id',
    authorizeRole('admin', 'docente'),
    courseController.getById
  );

  /**
   * PUT /api/courses/:id
   * Actualizar curso
   * Auth: Admin
   */
  router.put('/:id', authorizeRole('admin'), courseController.update);

  /**
   * DELETE /api/courses/:id
   * Eliminar curso (soft delete)
   * Auth: Admin
   */
  router.delete('/:id', authorizeRole('admin'), courseController.delete);

  return router;
};

module.exports = configureCourseRoutes;
