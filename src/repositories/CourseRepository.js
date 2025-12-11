/**
 * Course Repository
 * Operaciones de base de datos para cursos
 */

const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class CourseRepository extends BaseRepository {
  constructor() {
    super(prisma.curso);
  }

  /**
   * Override: Campo ID personalizado
   */
  getIdField() {
    return 'cursoId';
  }

  /**
   * Listar cursos por área académica
   * @param {string} area - Área académica (A, B, C, D)
   * @param {string} estado - Estado del curso (activo, inactivo)
   * @returns {Promise<Array>} Lista de cursos
   */
  listByArea(area, estado = 'activo') {
    return this.model.findMany({
      where: { area, estado },
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Listar cursos con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Cursos y total
   */
  async list(filters = {}, pagination = {}) {
    const { area, estado, search } = filters;
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (area) {
      where.area = area;
    }

    if (estado) {
      where.estado = estado;
    }

    // Búsqueda por nombre
    if (search) {
      where.nombre = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [cursos, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
      }),
      this.model.count({ where }),
    ]);

    return { cursos, total };
  }

  /**
   * Verificar si un curso tiene relaciones activas
   * @param {number} cursoId - ID del curso
   * @returns {Promise<boolean>} True si tiene relaciones activas
   */
  async hasActiveRelations(cursoId) {
    const notasCount = await prisma.nota.count({
      where: { cursoId },
    });

    return notasCount > 0;
  }
}

module.exports = CourseRepository;
