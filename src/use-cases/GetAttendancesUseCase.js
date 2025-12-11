/**
 * Get Attendances Use Case
 * Listar asistencias con filtros
 */

class GetAttendancesUseCase {
  /**
   * @param {Object} attendanceRepository - Repositorio de asistencias
   */
  constructor(attendanceRepository) {
    this.attendanceRepository = attendanceRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Asistencias y paginación
   */
  async execute(filters, pagination) {
    const { asistencias, total } = await this.attendanceRepository.list(filters, pagination);

    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      asistencias,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

module.exports = GetAttendancesUseCase;
