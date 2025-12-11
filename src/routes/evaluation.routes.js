/**
 * Evaluation Routes
 * Define las rutas para gestión de evaluaciones
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de evaluaciones
 * @param {Object} evaluationController - Controlador de evaluaciones
 * @param {Object} authService - Servicio de autenticación (para middleware)
 * @returns {Router} Router configurado
 */
const configureEvaluationRoutes = (evaluationController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * POST /api/evaluations
   * Programar nueva evaluación
   * Auth: Admin, Docente
   */
  router.post('/', authorizeRole('admin', 'docente'), evaluationController.create);

  /**
   * GET /api/evaluations
   * Listar evaluaciones con filtros
   * Auth: Admin, Docente
   * Query params: ?grupoId=1&estado=PROGRAMADA&fechaDesde=2025-01-01&page=1&limit=10
   */
  router.get('/', authorizeRole('admin', 'docente'), evaluationController.list);

  /**
   * GET /api/evaluations/:id
   * Obtener evaluación por ID
   * Auth: Admin, Docente
   */
  router.get('/:id', authorizeRole('admin', 'docente'), evaluationController.getById);

  /**
   * PUT /api/evaluations/:id
   * Actualizar evaluación
   * Auth: Admin, Docente
   */
  router.put('/:id', authorizeRole('admin', 'docente'), evaluationController.update);

  /**
   * PATCH /api/evaluations/:id/cancel
   * Cancelar evaluación
   * Auth: Admin, Docente
   */
  router.patch('/:id/cancel', authorizeRole('admin', 'docente'), evaluationController.cancel);

  return router;
};

module.exports = configureEvaluationRoutes;
