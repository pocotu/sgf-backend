/**
 * Get Users Use Case
 * Listar usuarios con filtros y paginación
 */

class GetUsersUseCase {
  /**
   * @param {Object} userRepository - Repositorio de usuarios
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.rol - Filtrar por rol
   * @param {string} filters.estado - Filtrar por estado
   * @param {string} filters.search - Búsqueda por DNI, nombre o correo
   * @param {Object} pagination - Opciones de paginación
   * @param {number} pagination.page - Página actual
   * @param {number} pagination.limit - Límite por página
   * @returns {Promise<Object>} Usuarios y paginación
   */
  async execute(filters = {}, pagination = {}) {
    const { rol, estado, search } = filters;
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Construir where clause
    const where = {};

    if (rol) {
      where.rol = rol;
    }

    if (estado) {
      where.estado = estado;
    }

    // Búsqueda por DNI, nombre o correo
    if (search) {
      where.OR = [
        { dni: { contains: search } },
        { nombres: { contains: search, mode: 'insensitive' } },
        { apellidos: { contains: search, mode: 'insensitive' } },
        { correo: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Obtener usuarios con paginación
    const [usuarios, total] = await Promise.all([
      this.userRepository.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaCreacion: 'desc' },
        select: {
          usuarioId: true,
          dni: true,
          correo: true,
          rol: true,
          nombres: true,
          apellidos: true,
          telefono: true,
          estado: true,
          requiereCambioPassword: true,
          fechaCreacion: true,
          fechaActualizacion: true,
        },
      }),
      this.userRepository.model.count({ where }),
    ]);

    return {
      usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = GetUsersUseCase;
