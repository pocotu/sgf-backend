/**
 * Get Evaluations Use Case
 * Listar evaluaciones con filtros
 */

class GetEvaluationsUseCase {
  /**
   * @param {Object} evaluationRepository - Repositorio de evaluaciones
   */
  constructor(evaluationRepository) {
    this.evaluationRepository = evaluationRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Evaluaciones y paginación
   */
  async execute(filters = {}, pagination = {}) {
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;

    const result = await this.evaluationRepository.list(filters, { page, limit });

    const totalPages = Math.ceil(result.total / limit);

    return {
      evaluaciones: result.evaluaciones,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    };
  }
}

module.exports = GetEvaluationsUseCase;
