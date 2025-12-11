/**
 * Get Students Use Case
 * Listar estudiantes con filtros y paginación
 */

class GetStudentsUseCase {
  /**
   * @param {Object} studentRepository - Repositorio de estudiantes
   */
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.modalidad - Filtrar por modalidad
   * @param {string} filters.area - Filtrar por área académica
   * @param {string} filters.search - Búsqueda por código, DNI o nombre
   * @param {Object} pagination - Opciones de paginación
   * @param {number} pagination.page - Página actual
   * @param {number} pagination.limit - Límite por página
   * @returns {Promise<Object>} Estudiantes y paginación
   */
  async execute(filters = {}, pagination = {}) {
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;

    // Obtener estudiantes con paginación
    const { estudiantes, total } = await this.studentRepository.list(
      filters,
      { page, limit }
    );

    return {
      estudiantes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = GetStudentsUseCase;
