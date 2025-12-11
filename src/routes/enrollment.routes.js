/**
 * Enrollment Routes
 * Define las rutas para gestión de matrículas
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de matrículas
 * @param {Object} enrollmentController - Controlador de matrículas
 * @param {Object} authService - Servicio de autenticación (para middleware)
 * @returns {Router} Router configurado
 */
const configureEnrollmentRoutes = (enrollmentController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * POST /api/enrollments
   * Matricular estudiante en un grupo
   * Auth: Admin
   */
  router.post('/', authorizeRole('admin'), enrollmentController.enroll);

  /**
   * GET /api/enrollments
   * Listar matrículas con filtros
   * Auth: Admin, Docente
   * Query params: ?grupoId=1&estudianteId=1&estado=MATRICULADO&page=1&limit=10
   */
  router.get('/', authorizeRole('admin', 'docente'), enrollmentController.list);

  /**
   * PATCH /api/enrollments/:id/withdraw
   * Retirar estudiante de un grupo
   * Auth: Admin
   */
  router.patch(
    '/:id/withdraw',
    authorizeRole('admin'),
    enrollmentController.withdraw
  );

  return router;
};

module.exports = configureEnrollmentRoutes;
