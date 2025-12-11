/**
 * Get Attendance Summary Use Case
 * Obtener resumen de asistencia con cálculo de porcentajes
 */

class GetAttendanceSummaryUseCase {
  /**
   * @param {Object} attendanceRepository - Repositorio de asistencias
   */
  constructor(attendanceRepository) {
    this.attendanceRepository = attendanceRepository;
  }

  /**
   * Ejecutar caso de uso para resumen por estudiante
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo
   * @param {Object} dateRange - Rango de fechas
   * @returns {Promise<Object>} Resumen de asistencia
   */
  async executeByStudent(estudianteId, grupoId, dateRange = {}) {
    const summary = await this.attendanceRepository.getSummaryByStudent(
      estudianteId,
      grupoId,
      dateRange
    );

    return summary;
  }

  /**
   * Ejecutar caso de uso para resumen por grupo
   * @param {number} grupoId - ID del grupo
   * @param {Object} dateRange - Rango de fechas
   * @returns {Promise<Array>} Resumen de asistencia por estudiante
   */
  async executeByGroup(grupoId, dateRange = {}) {
    const summary = await this.attendanceRepository.getSummaryByGroup(grupoId, dateRange);

    return summary;
  }
}

module.exports = GetAttendanceSummaryUseCase;
