/**
 * Grade Controller
 * Maneja las peticiones HTTP relacionadas con gestión de notas
 */

const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class GradeController {
  /**
   * @param {Object} registerGradeUseCase - Caso de uso para registrar nota
   * @param {Object} registerBulkGradesUseCase - Caso de uso para registro masivo
   * @param {Object} getGradesUseCase - Caso de uso para listar notas
   * @param {Object} getStudentGradesUseCase - Caso de uso para obtener notas de estudiante
   */
  constructor(
    registerGradeUseCase,
    registerBulkGradesUseCase,
    getGradesUseCase,
    getStudentGradesUseCase
  ) {
    this.registerGradeUseCase = registerGradeUseCase;
    this.registerBulkGradesUseCase = registerBulkGradesUseCase;
    this.getGradesUseCase = getGradesUseCase;
    this.getStudentGradesUseCase = getStudentGradesUseCase;
  }

  /**
   * POST /api/grades
   * Registrar nota individual
   */
  create = asyncHandler(async (req, res) => {
    const gradeData = req.body;

    const grade = await this.registerGradeUseCase.execute(gradeData);

    return res.status(201).json(successResponse(grade, 'Nota registrada exitosamente'));
  });

  /**
   * POST /api/grades/bulk
   * Registrar notas en lote
   */
  createBulk = asyncHandler(async (req, res) => {
    const bulkData = req.body;

    const grades = await this.registerBulkGradesUseCase.execute(bulkData);

    return res
      .status(201)
      .json(
        successResponse({ notas: grades, total: grades.length }, 'Notas registradas exitosamente')
      );
  });

  /**
   * GET /api/grades
   * Listar notas con filtros y paginación
   */
  list = asyncHandler(async (req, res) => {
    const { evaluacionId, estudianteId, cursoId, grupoId, page, limit } = req.query;

    const filters = { evaluacionId, estudianteId, cursoId, grupoId };
    const pagination = { page, limit };

    const result = await this.getGradesUseCase.execute(filters, pagination);

    return res.status(200).json(
      paginatedResponse({
        data: result.notas,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        message: 'Notas obtenidas exitosamente',
      })
    );
  });

  /**
   * GET /api/grades/student/:estudianteId
   * Obtener notas de un estudiante con promedios
   */
  getByStudent = asyncHandler(async (req, res) => {
    const estudianteId = parseInt(req.params.estudianteId, 10);
    const { grupoId, evaluacionId } = req.query;

    const filters = { grupoId, evaluacionId };

    const result = await this.getStudentGradesUseCase.execute(estudianteId, filters);

    return res
      .status(200)
      .json(successResponse(result, 'Notas del estudiante obtenidas exitosamente'));
  });
}

module.exports = GradeController;
