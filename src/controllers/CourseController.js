/**
 * Course Controller
 * Maneja las peticiones HTTP relacionadas con gestión de cursos
 */

const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class CourseController {
  /**
   * @param {Object} createCourseUseCase - Caso de uso para crear curso
   * @param {Object} getCoursesUseCase - Caso de uso para listar cursos
   * @param {Object} getCourseByIdUseCase - Caso de uso para obtener curso
   * @param {Object} updateCourseUseCase - Caso de uso para actualizar curso
   * @param {Object} deleteCourseUseCase - Caso de uso para eliminar curso
   */
  constructor(
    createCourseUseCase,
    getCoursesUseCase,
    getCourseByIdUseCase,
    updateCourseUseCase,
    deleteCourseUseCase
  ) {
    this.createCourseUseCase = createCourseUseCase;
    this.getCoursesUseCase = getCoursesUseCase;
    this.getCourseByIdUseCase = getCourseByIdUseCase;
    this.updateCourseUseCase = updateCourseUseCase;
    this.deleteCourseUseCase = deleteCourseUseCase;
  }

  /**
   * POST /api/courses
   * Crear nuevo curso
   */
  create = asyncHandler(async (req, res) => {
    const courseData = req.body;

    const course = await this.createCourseUseCase.execute(courseData);

    return res.status(201).json(
      successResponse(course, 'Curso creado exitosamente')
    );
  });

  /**
   * GET /api/courses
   * Listar cursos con filtros y paginación
   */
  list = asyncHandler(async (req, res) => {
    const { area, estado, search, page, limit } = req.query;

    const filters = { area, estado, search };
    const pagination = { page, limit };

    const result = await this.getCoursesUseCase.execute(filters, pagination);

    return res.status(200).json(
      paginatedResponse({
        data: result.cursos,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        message: 'Cursos obtenidos exitosamente',
      })
    );
  });

  /**
   * GET /api/courses/:id
   * Obtener curso por ID
   */
  getById = asyncHandler(async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);

    const course = await this.getCourseByIdUseCase.execute(cursoId);

    return res.status(200).json(
      successResponse(course, 'Curso obtenido exitosamente')
    );
  });

  /**
   * PUT /api/courses/:id
   * Actualizar curso
   */
  update = asyncHandler(async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);
    const updateData = req.body;

    const course = await this.updateCourseUseCase.execute(
      cursoId,
      updateData
    );

    return res.status(200).json(
      successResponse(course, 'Curso actualizado exitosamente')
    );
  });

  /**
   * DELETE /api/courses/:id
   * Eliminar curso (soft delete)
   */
  delete = asyncHandler(async (req, res) => {
    const cursoId = parseInt(req.params.id, 10);

    const course = await this.deleteCourseUseCase.execute(cursoId);

    return res.status(200).json(
      successResponse(course, 'Curso eliminado exitosamente')
    );
  });
}

module.exports = CourseController;
