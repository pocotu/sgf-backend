/**
 * Get Groups Use Case
 * Listar grupos con filtros y cálculo de cupos disponibles
 */

class GetGroupsUseCase {
  /**
   * @param {Object} groupRepository - Repositorio de grupos
   */
  constructor(groupRepository) {
    this.groupRepository = groupRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Grupos y paginación
   */
  async execute(filters = {}, pagination = {}) {
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;

    // Obtener grupos con paginación y cupos disponibles
    const { grupos, total } = await this.groupRepository.list(
      filters,
      { page, limit }
    );

    return {
      grupos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = GetGroupsUseCase;
