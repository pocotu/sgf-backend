/**
 * Grade Routes
 * Define las rutas para gestión de notas
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de notas
 * @param {Object} gradeController - Controlador de notas
 * @param {Object} authService - Servicio de autenticación (para middleware)
 * @returns {Router} Router configurado
 */
const configureGradeRoutes = (gradeController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * POST /api/grades
   * Registrar nota individual
   * Auth: Admin, Docente
   */
  router.post('/', authorizeRole('admin', 'docente'), gradeController.create);

  /**
   * POST /api/grades/bulk
   * Registrar notas en lote
   * Auth: Admin, Docente
   */
  router.post('/bulk', authorizeRole('admin', 'docente'), gradeController.createBulk);

  /**
   * GET /api/grades
   * Listar notas con filtros
   * Auth: Admin, Docente
   * Query params: ?evaluacionId=1&estudianteId=1&cursoId=1&grupoId=1&page=1&limit=10
   */
  router.get('/', authorizeRole('admin', 'docente'), gradeController.list);

  /**
   * GET /api/grades/student/:estudianteId
   * Obtener notas de un estudiante con promedios
   * Auth: Admin, Docente, Estudiante (solo sus propias notas)
   * Query params: ?grupoId=1&evaluacionId=1
   */
  router.get('/student/:estudianteId', gradeController.getByStudent);

  return router;
};

module.exports = configureGradeRoutes;
