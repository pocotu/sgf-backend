/**
 * Ranking Routes
 * Define las rutas para rankings
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de rankings
 * @param {Object} rankingController - Controlador de rankings
 * @param {Object} authService - Servicio de autenticación (para middleware)
 * @returns {Router} Router configurado
 */
const configureRankingRoutes = (rankingController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * GET /api/rankings/group/:grupoId
   * Obtener ranking de un grupo
   * Auth: Admin, Docente, Estudiante
   * Query params: ?evaluacionId=1
   */
  router.get(
    '/group/:grupoId',
    authorizeRole('admin', 'docente', 'estudiante'),
    rankingController.getGroupRanking
  );

  /**
   * GET /api/rankings/student/:estudianteId
   * Obtener posición de un estudiante en el ranking
   * Auth: Admin, Docente, Estudiante (solo su propia posición)
   * Query params: ?evaluacionId=1
   */
  router.get(
    '/student/:estudianteId',
    authorizeRole('admin', 'docente', 'estudiante'),
    rankingController.getStudentPosition
  );

  return router;
};

module.exports = configureRankingRoutes;
