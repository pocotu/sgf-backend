/**
 * Evaluation Controller
 * Maneja las peticiones HTTP relacionadas con gestión de evaluaciones
 */

const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class EvaluationController {
  /**
   * @param {Object} scheduleEvaluationUseCase - Caso de uso para programar evaluación
   * @param {Object} getEvaluationsUseCase - Caso de uso para listar evaluaciones
   * @param {Object} getEvaluationByIdUseCase - Caso de uso para obtener evaluación
   * @param {Object} updateEvaluationUseCase - Caso de uso para actualizar evaluación
   * @param {Object} cancelEvaluationUseCase - Caso de uso para cancelar evaluación
   */
  constructor(
    scheduleEvaluationUseCase,
    getEvaluationsUseCase,
    getEvaluationByIdUseCase,
    updateEvaluationUseCase,
    cancelEvaluationUseCase
  ) {
    this.scheduleEvaluationUseCase = scheduleEvaluationUseCase;
    this.getEvaluationsUseCase = getEvaluationsUseCase;
    this.getEvaluationByIdUseCase = getEvaluationByIdUseCase;
    this.updateEvaluationUseCase = updateEvaluationUseCase;
    this.cancelEvaluationUseCase = cancelEvaluationUseCase;
  }

  /**
   * POST /api/evaluations
   * Programar nueva evaluación
   */
  create = asyncHandler(async (req, res) => {
    const evaluationData = req.body;

    const evaluation = await this.scheduleEvaluationUseCase.execute(evaluationData);

    return res.status(201).json(successResponse(evaluation, 'Evaluación programada exitosamente'));
  });

  /**
   * GET /api/evaluations
   * Listar evaluaciones con filtros y paginación
   */
  list = asyncHandler(async (req, res) => {
    const { grupoId, estado, fechaDesde, fechaHasta, numeroSemana, page, limit } = req.query;

    const filters = { grupoId, estado, fechaDesde, fechaHasta, numeroSemana };
    const pagination = { page, limit };

    const result = await this.getEvaluationsUseCase.execute(filters, pagination);

    return res.status(200).json(
      paginatedResponse({
        data: result.evaluaciones,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        message: 'Evaluaciones obtenidas exitosamente',
      })
    );
  });

  /**
   * GET /api/evaluations/:id
   * Obtener evaluación por ID
   */
  getById = asyncHandler(async (req, res) => {
    const evaluacionId = parseInt(req.params.id, 10);

    const evaluation = await this.getEvaluationByIdUseCase.execute(evaluacionId);

    return res.status(200).json(successResponse(evaluation, 'Evaluación obtenida exitosamente'));
  });

  /**
   * PUT /api/evaluations/:id
   * Actualizar evaluación
   */
  update = asyncHandler(async (req, res) => {
    const evaluacionId = parseInt(req.params.id, 10);
    const updateData = req.body;

    const evaluation = await this.updateEvaluationUseCase.execute(evaluacionId, updateData);

    return res.status(200).json(successResponse(evaluation, 'Evaluación actualizada exitosamente'));
  });

  /**
   * PATCH /api/evaluations/:id/cancel
   * Cancelar evaluación
   */
  cancel = asyncHandler(async (req, res) => {
    const evaluacionId = parseInt(req.params.id, 10);

    const evaluation = await this.cancelEvaluationUseCase.execute(evaluacionId);

    return res.status(200).json(successResponse(evaluation, 'Evaluación cancelada exitosamente'));
  });
}

module.exports = EvaluationController;
