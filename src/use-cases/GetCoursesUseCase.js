/**
 * Get Courses Use Case
 * Listar cursos con filtros y paginación
 */

class GetCoursesUseCase {
  /**
   * @param {Object} courseRepository - Repositorio de cursos
   */
  constructor(courseRepository) {
    this.courseRepository = courseRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.area - Filtrar por área académica
   * @param {string} filters.estado - Filtrar por estado
   * @param {string} filters.search - Búsqueda por nombre
   * @param {Object} pagination - Opciones de paginación
   * @param {number} pagination.page - Página actual
   * @param {number} pagination.limit - Límite por página
   * @returns {Promise<Object>} Cursos y paginación
   */
  async execute(filters = {}, pagination = {}) {
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;

    // Obtener cursos con paginación
    const { cursos, total } = await this.courseRepository.list(filters, { page, limit });

    return {
      cursos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = GetCoursesUseCase;
