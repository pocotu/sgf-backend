/**
 * Group Routes
 * Define las rutas para gestión de grupos
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de grupos
 * @param {Object} groupController - Controlador de grupos
 * @param {Object} authService - Servicio de autenticación (para middleware)
 * @returns {Router} Router configurado
 */
const configureGroupRoutes = (groupController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * POST /api/groups
   * Crear nuevo grupo
   * Auth: Admin
   */
  router.post('/', authorizeRole('admin'), groupController.create);

  /**
   * GET /api/groups
   * Listar grupos con filtros
   * Auth: Admin, Docente
   * Query params: ?modalidad=ORDINARIO&area=A&estado=ACTIVO&page=1&limit=10
   */
  router.get('/', authorizeRole('admin', 'docente'), groupController.list);

  /**
   * GET /api/groups/:id
   * Obtener grupo por ID
   * Auth: Admin, Docente
   */
  router.get(
    '/:id',
    authorizeRole('admin', 'docente'),
    groupController.getById
  );

  /**
   * PUT /api/groups/:id
   * Actualizar grupo
   * Auth: Admin
   */
  router.put('/:id', authorizeRole('admin'), groupController.update);

  /**
   * PATCH /api/groups/:id/status
   * Cambiar estado del grupo (ACTIVO/INACTIVO)
   * Auth: Admin
   */
  router.patch(
    '/:id/status',
    authorizeRole('admin'),
    groupController.changeStatus
  );

  return router;
};

module.exports = configureGroupRoutes;
