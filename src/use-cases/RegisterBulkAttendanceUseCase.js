/**
 * Register Bulk Attendance Use Case
 * Registrar asistencias masivas con transacciones
 */

class RegisterBulkAttendanceUseCase {
  /**
   * @param {Object} attendanceRepository - Repositorio de asistencias
   * @param {Object} attendanceService - Servicio de asistencias
   */
  constructor(attendanceRepository, attendanceService) {
    this.attendanceRepository = attendanceRepository;
    this.attendanceService = attendanceService;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} bulkData - Datos de asistencia masiva
   * @returns {Promise<Object>} Resultado del registro masivo
   */
  async execute(bulkData) {
    // Validar datos básicos
    this.attendanceService.validateBulkAttendanceData(bulkData);

    // Validar que cada estudiante esté matriculado en el grupo
    const validationPromises = bulkData.asistencias.map(asistencia =>
      this.attendanceService.validateStudentEnrolled(asistencia.estudianteId, bulkData.grupoId)
    );

    await Promise.all(validationPromises);

    // Registrar asistencias en lote (con skipDuplicates)
    const result = await this.attendanceRepository.registerBulk(
      bulkData.grupoId,
      bulkData.fechaClase,
      bulkData.asistencias
    );

    return {
      grupoId: bulkData.grupoId,
      fechaClase: bulkData.fechaClase,
      registradas: result.count,
      total: bulkData.asistencias.length,
    };
  }
}

module.exports = RegisterBulkAttendanceUseCase;
