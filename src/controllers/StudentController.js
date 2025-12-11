/**
 * Student Controller
 * Maneja las peticiones HTTP relacionadas con gestión de estudiantes
 */

const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class StudentController {
  /**
   * @param {Object} createStudentUseCase - Caso de uso para crear estudiante
   * @param {Object} getStudentsUseCase - Caso de uso para listar estudiantes
   * @param {Object} getStudentByIdUseCase - Caso de uso para obtener estudiante
   * @param {Object} updateStudentUseCase - Caso de uso para actualizar estudiante
   * @param {Object} deleteStudentUseCase - Caso de uso para eliminar estudiante
   */
  constructor(
    createStudentUseCase,
    getStudentsUseCase,
    getStudentByIdUseCase,
    updateStudentUseCase,
    deleteStudentUseCase
  ) {
    this.createStudentUseCase = createStudentUseCase;
    this.getStudentsUseCase = getStudentsUseCase;
    this.getStudentByIdUseCase = getStudentByIdUseCase;
    this.updateStudentUseCase = updateStudentUseCase;
    this.deleteStudentUseCase = deleteStudentUseCase;
  }

  /**
   * POST /api/students
   * Crear nuevo estudiante
   */
  create = asyncHandler(async (req, res) => {
    const studentData = req.body;

    const student = await this.createStudentUseCase.execute(studentData);

    return res.status(201).json(successResponse(student, 'Estudiante creado exitosamente'));
  });

  /**
   * GET /api/students
   * Listar estudiantes con filtros y paginación
   */
  list = asyncHandler(async (req, res) => {
    const { modalidad, area, search, page, limit } = req.query;

    const filters = { modalidad, area, search };
    const pagination = { page, limit };

    const result = await this.getStudentsUseCase.execute(filters, pagination);

    return res.status(200).json(
      paginatedResponse({
        data: result.estudiantes,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        message: 'Estudiantes obtenidos exitosamente',
      })
    );
  });

  /**
   * GET /api/students/:id
   * Obtener estudiante por ID
   */
  getById = asyncHandler(async (req, res) => {
    const estudianteId = parseInt(req.params.id, 10);

    const student = await this.getStudentByIdUseCase.execute(estudianteId);

    return res.status(200).json(successResponse(student, 'Estudiante obtenido exitosamente'));
  });

  /**
   * PUT /api/students/:id
   * Actualizar estudiante
   */
  update = asyncHandler(async (req, res) => {
    const estudianteId = parseInt(req.params.id, 10);
    const updateData = req.body;

    const student = await this.updateStudentUseCase.execute(estudianteId, updateData);

    return res.status(200).json(successResponse(student, 'Estudiante actualizado exitosamente'));
  });

  /**
   * DELETE /api/students/:id
   * Eliminar estudiante (soft delete)
   */
  delete = asyncHandler(async (req, res) => {
    const estudianteId = parseInt(req.params.id, 10);

    const student = await this.deleteStudentUseCase.execute(estudianteId);

    return res.status(200).json(successResponse(student, 'Estudiante eliminado exitosamente'));
  });
}

module.exports = StudentController;
