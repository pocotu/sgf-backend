/**
 * Attendance Routes
 * Define las rutas para gestión de asistencias
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de asistencias
 * @param {Object} attendanceController - Controlador de asistencias
 * @param {Object} authService - Servicio de autenticación
 * @returns {Router} Router configurado
 */
const configureAttendanceRoutes = (attendanceController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * POST /api/attendances
   * Registrar asistencia individual
   * Auth: Admin, Docente
   */
  router.post('/', authorizeRole('admin', 'docente'), attendanceController.register);

  /**
   * POST /api/attendances/bulk
   * Registrar asistencias masivas
   * Auth: Admin, Docente
   */
  router.post('/bulk', authorizeRole('admin', 'docente'), attendanceController.registerBulk);

  /**
   * GET /api/attendances
   * Listar asistencias con filtros
   * Auth: Admin, Docente
   * Query params: ?grupoId=1&estudianteId=1&fechaDesde=2025-01-01&fechaHasta=2025-01-31&estado=PRESENTE&page=1&limit=10
   */
  router.get('/', authorizeRole('admin', 'docente'), attendanceController.list);

  /**
   * GET /api/attendances/summary/student/:estudianteId
   * Obtener resumen de asistencia por estudiante
   * Auth: Admin, Docente, Estudiante (solo su propio resumen)
   * Query params: ?grupoId=1&fechaDesde=2025-01-01&fechaHasta=2025-01-31
   */
  router.get(
    '/summary/student/:estudianteId',
    authorizeRole('admin', 'docente', 'estudiante'),
    attendanceController.getSummaryByStudent
  );

  /**
   * GET /api/attendances/summary/group/:grupoId
   * Obtener resumen de asistencia por grupo
   * Auth: Admin, Docente
   * Query params: ?fechaDesde=2025-01-01&fechaHasta=2025-01-31
   */
  router.get(
    '/summary/group/:grupoId',
    authorizeRole('admin', 'docente'),
    attendanceController.getSummaryByGroup
  );

  return router;
};

module.exports = configureAttendanceRoutes;
