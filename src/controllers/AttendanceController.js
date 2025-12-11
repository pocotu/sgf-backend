/**
 * Attendance Controller
 * Maneja las peticiones HTTP relacionadas con gestión de asistencias
 */

const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class AttendanceController {
  /**
   * @param {Object} registerAttendanceUseCase - Caso de uso para registrar
   * @param {Object} registerBulkAttendanceUseCase - Caso de uso para registro masivo
   * @param {Object} getAttendancesUseCase - Caso de uso para listar
   * @param {Object} getAttendanceSummaryUseCase - Caso de uso para resumen
   */
  constructor(
    registerAttendanceUseCase,
    registerBulkAttendanceUseCase,
    getAttendancesUseCase,
    getAttendanceSummaryUseCase
  ) {
    this.registerAttendanceUseCase = registerAttendanceUseCase;
    this.registerBulkAttendanceUseCase = registerBulkAttendanceUseCase;
    this.getAttendancesUseCase = getAttendancesUseCase;
    this.getAttendanceSummaryUseCase = getAttendanceSummaryUseCase;
  }

  /**
   * POST /api/attendances
   * Registrar asistencia individual
   */
  register = asyncHandler(async (req, res) => {
    const attendanceData = req.body;

    const attendance = await this.registerAttendanceUseCase.execute(attendanceData);

    return res.status(201).json(successResponse(attendance, 'Asistencia registrada exitosamente'));
  });

  /**
   * POST /api/attendances/bulk
   * Registrar asistencias masivas
   */
  registerBulk = asyncHandler(async (req, res) => {
    const bulkData = req.body;

    const result = await this.registerBulkAttendanceUseCase.execute(bulkData);

    return res.status(201).json(successResponse(result, 'Asistencias registradas exitosamente'));
  });

  /**
   * GET /api/attendances
   * Listar asistencias con filtros y paginación
   */
  list = asyncHandler(async (req, res) => {
    const { grupoId, estudianteId, fechaDesde, fechaHasta, estado, page, limit } = req.query;

    const filters = { grupoId, estudianteId, fechaDesde, fechaHasta, estado };
    const pagination = { page, limit };

    const result = await this.getAttendancesUseCase.execute(filters, pagination);

    return res.status(200).json(
      paginatedResponse({
        data: result.asistencias,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        message: 'Asistencias obtenidas exitosamente',
      })
    );
  });

  /**
   * GET /api/attendances/summary/student/:estudianteId
   * Obtener resumen de asistencia por estudiante
   */
  getSummaryByStudent = asyncHandler(async (req, res) => {
    const estudianteId = parseInt(req.params.estudianteId, 10);
    const { grupoId, fechaDesde, fechaHasta } = req.query;

    if (!grupoId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'ID del grupo es requerido',
        },
      });
    }

    const dateRange = { fechaDesde, fechaHasta };

    const summary = await this.getAttendanceSummaryUseCase.executeByStudent(
      estudianteId,
      parseInt(grupoId, 10),
      dateRange
    );

    return res
      .status(200)
      .json(successResponse(summary, 'Resumen de asistencia obtenido exitosamente'));
  });

  /**
   * GET /api/attendances/summary/group/:grupoId
   * Obtener resumen de asistencia por grupo
   */
  getSummaryByGroup = asyncHandler(async (req, res) => {
    const grupoId = parseInt(req.params.grupoId, 10);
    const { fechaDesde, fechaHasta } = req.query;

    const dateRange = { fechaDesde, fechaHasta };

    const summary = await this.getAttendanceSummaryUseCase.executeByGroup(grupoId, dateRange);

    return res
      .status(200)
      .json(successResponse(summary, 'Resumen de asistencia obtenido exitosamente'));
  });
}

module.exports = AttendanceController;
