/**
 * Get Enrollments Use Case
 * Listar matrículas con filtros y paginación
 */

class GetEnrollmentsUseCase {
  /**
   * @param {Object} enrollmentRepository - Repositorio de matrículas
   */
  constructor(enrollmentRepository) {
    this.enrollmentRepository = enrollmentRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Matrículas y paginación
   */
  async execute(filters = {}, pagination = {}) {
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;

    const result = await this.enrollmentRepository.list(filters, {
      page,
      limit,
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      matriculas: result.matriculas,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    };
  }
}

module.exports = GetEnrollmentsUseCase;
