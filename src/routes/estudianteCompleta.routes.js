/**
 * Estudiante Completa Routes
 * Define las rutas para la vista estudiantes_completa
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de estudiantes completa
 * @param {Object} estudianteCompletaController - Controlador de estudiantes completa
 * @param {Object} authService - Servicio de autenticación
 * @returns {Router} Router configurado
 */
const configureEstudianteCompletaRoutes = (estudianteCompletaController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  // Middleware de autenticación para todas las rutas
  router.use(authenticateJWT(authService));

  /**
   * GET /api/estudiantes-completa
   * Listar todos los estudiantes con información completa
   * Auth: Admin, Docente
   * Query params: ?modalidad=ORDINARIO&search=juan&estado=activo
   */
  router.get('/', authorizeRole('admin', 'docente'), estudianteCompletaController.list);

  /**
   * GET /api/estudiantes-completa/:id
   * Obtener estudiante completo por ID
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
        const { container } = require('../config/dependencies');
        const estudianteCompletaRepository = container.resolve('estudianteCompletaRepository');

        try {
          const student = await estudianteCompletaRepository.findById(requestedStudentId);
          if (student && student.usuarioId === req.user.usuarioId) {
            return next();
          }
        } catch (_error) {
          // Continuar al siguiente middleware
        }
      }

      // Si no cumple ninguna condición, denegar acceso
      const { ForbiddenError } = require('../utils/errors');
      throw new ForbiddenError('No tiene permisos para ver este estudiante');
    },
    estudianteCompletaController.getById
  );

  /**
   * GET /api/estudiantes-completa/dni/:dni
   * Buscar estudiante completo por DNI
   * Auth: Admin, Docente
   */
  router.get('/dni/:dni', authorizeRole('admin', 'docente'), estudianteCompletaController.getByDni);

  return router;
};

module.exports = configureEstudianteCompletaRoutes;
