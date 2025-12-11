/**
 * Get Grades Use Case
 * Listar notas con filtros y paginación
 */

class GetGradesUseCase {
  /**
   * @param {Object} gradeRepository - Repositorio de notas
   */
  constructor(gradeRepository) {
    this.gradeRepository = gradeRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Notas y paginación
   */
  async execute(filters = {}, pagination = {}) {
    const { notas, total } = await this.gradeRepository.list(filters, pagination);

    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      notas,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

module.exports = GetGradesUseCase;
