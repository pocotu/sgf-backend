/**
 * Student Routes
 * Define las rutas para gestión de estudiantes
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de estudiantes
 * @param {Object} studentController - Controlador de estudiantes
 * @param {Object} authService - Servicio de autenticación (para middleware)
 * @returns {Router} Router configurado
 */
const configureStudentRoutes = (studentController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * POST /api/students
   * Crear nuevo estudiante
   * Auth: Admin
   */
  router.post('/', authorizeRole('admin'), studentController.create);

  /**
   * GET /api/students
   * Listar estudiantes con filtros
   * Auth: Admin, Docente
   * Query params: ?modalidad=ORDINARIO&area=A&search=juan&page=1&limit=10
   */
  router.get('/', authorizeRole('admin', 'docente'), studentController.list);

  /**
   * GET /api/students/:id
   * Obtener estudiante por ID
   * Auth: Admin, Docente, Estudiante (solo su propio perfil)
   */
  router.get(
    '/:id',
    async (req, res, next) => {
      const requestedStudentId = parseInt(req.params.id, 10);
      const currentUserRole = req.user.rol;

      // Admin y Docente pueden ver cualquier estudiante
      if (currentUserRole === 'admin' || currentUserRole === 'docente') {
        return next();
      }

      // Estudiante solo puede ver su propio perfil
      if (currentUserRole === 'estudiante') {
        /*
         * Necesitamos verificar que el estudianteId corresponde al usuario actual
         * Esto se puede hacer obteniendo el estudiante y comparando usuarioId
         */
        const { container } = require('../config/dependencies');
        const studentRepository = container.resolve('studentRepository');

        try {
          const student = await studentRepository.findById(requestedStudentId);
          if (student && student.usuarioId === req.user.usuarioId) {
            return next();
          }
        } catch (_error) {
          // Si hay error, continuar al siguiente middleware que manejará el error
        }
      }

      // Si no cumple ninguna condición, denegar acceso
      const { ForbiddenError } = require('../utils/errors');
      throw new ForbiddenError('No tiene permisos para ver este estudiante');
    },
    studentController.getById
  );

  /**
   * PUT /api/students/:id
   * Actualizar estudiante
   * Auth: Admin
   */
  router.put('/:id', authorizeRole('admin'), studentController.update);

  /**
   * DELETE /api/students/:id
   * Eliminar estudiante (soft delete)
   * Auth: Admin
   */
  router.delete('/:id', authorizeRole('admin'), studentController.delete);

  return router;
};

module.exports = configureStudentRoutes;
