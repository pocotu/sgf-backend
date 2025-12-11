/**
 * Enrollment Controller
 * Maneja las peticiones HTTP relacionadas con gestión de matrículas
 */

const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class EnrollmentController {
  /**
   * @param {Object} enrollStudentUseCase - Caso de uso para matricular
   * @param {Object} getEnrollmentsUseCase - Caso de uso para listar matrículas
   * @param {Object} withdrawStudentUseCase - Caso de uso para retirar estudiante
   */
  constructor(
    enrollStudentUseCase,
    getEnrollmentsUseCase,
    withdrawStudentUseCase
  ) {
    this.enrollStudentUseCase = enrollStudentUseCase;
    this.getEnrollmentsUseCase = getEnrollmentsUseCase;
    this.withdrawStudentUseCase = withdrawStudentUseCase;
  }

  /**
   * POST /api/enrollments
   * Matricular estudiante en un grupo
   */
  enroll = asyncHandler(async (req, res) => {
    const enrollmentData = req.body;

    const enrollment = await this.enrollStudentUseCase.execute(enrollmentData);

    return res.status(201).json(
      successResponse(enrollment, 'Estudiante matriculado exitosamente')
    );
  });

  /**
   * GET /api/enrollments
   * Listar matrículas con filtros y paginación
   */
  list = asyncHandler(async (req, res) => {
    const { grupoId, estudianteId, estado, search, page, limit } = req.query;

    const filters = { grupoId, estudianteId, estado, search };
    const pagination = { page, limit };

    const result = await this.getEnrollmentsUseCase.execute(
      filters,
      pagination
    );

    return res.status(200).json(
      paginatedResponse({
        data: result.matriculas,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        message: 'Matrículas obtenidas exitosamente',
      })
    );
  });

  /**
   * PATCH /api/enrollments/:id/withdraw
   * Retirar estudiante de un grupo
   */
  withdraw = asyncHandler(async (req, res) => {
    const matriculaId = parseInt(req.params.id, 10);
    const { motivoRetiro } = req.body;

    const enrollment = await this.withdrawStudentUseCase.execute(
      matriculaId,
      motivoRetiro
    );

    return res.status(200).json(
      successResponse(enrollment, 'Estudiante retirado exitosamente')
    );
  });
}

module.exports = EnrollmentController;
