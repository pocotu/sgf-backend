/**
 * Group Repository
 * Operaciones de base de datos para grupos
 */

const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class GroupRepository extends BaseRepository {
  constructor() {
    super(prisma.grupo);
  }

  /**
   * Override: Campo ID personalizado
   */
  getIdField() {
    return 'grupoId';
  }

  /**
   * Buscar grupo con conteo de matrículas activas
   * @param {number} grupoId - ID del grupo
   * @returns {Promise<Object>} Grupo con conteo de matrículas
   */
  async findWithEnrollmentCount(grupoId) {
    const grupo = await this.model.findUnique({
      where: { grupoId },
      include: {
        _count: {
          select: {
            matriculas: {
              where: { estado: 'MATRICULADO' },
            },
          },
        },
      },
    });

    if (!grupo) {
      return null;
    }

    // Calcular cupos disponibles
    const matriculasActivas = grupo._count.matriculas;
    const cuposDisponibles = grupo.capacidad - matriculasActivas;

    return {
      ...grupo,
      matriculasActivas,
      cuposDisponibles,
    };
  }

  /**
   * Validar horarios del grupo
   * @param {string} horaInicio - Hora de inicio (HH:mm)
   * @param {string} horaFin - Hora de fin (HH:mm)
   * @returns {boolean} True si el horario es válido
   */
  validateSchedule(horaInicio, horaFin) {
    // Convertir strings de hora a objetos Date para comparación
    const inicio = new Date(`1970-01-01T${horaInicio}:00`);
    const fin = new Date(`1970-01-01T${horaFin}:00`);

    return fin > inicio;
  }

  /**
   * Listar grupos con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Grupos y total
   */
  async list(filters = {}, pagination = {}) {
    const { modalidad, area, estado, search } = filters;
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (modalidad) {
      where.modalidad = modalidad;
    }

    if (area) {
      where.area = area;
    }

    if (estado) {
      where.estado = estado;
    }

    // Búsqueda por nombre de grupo
    if (search) {
      where.nombreGrupo = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [grupos, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ area: 'asc' }, { nombreGrupo: 'asc' }],
        include: {
          _count: {
            select: {
              matriculas: {
                where: { estado: 'MATRICULADO' },
              },
            },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    // Agregar cupos disponibles a cada grupo
    const gruposConCupos = grupos.map(grupo => ({
      ...grupo,
      matriculasActivas: grupo._count.matriculas,
      cuposDisponibles: grupo.capacidad - grupo._count.matriculas,
    }));

    return { grupos: gruposConCupos, total };
  }

  /**
   * Verificar si existe un grupo con la misma combinación
   * área-modalidad-nombreGrupo
   * @param {string} area - Área académica
   * @param {string} modalidad - Modalidad
   * @param {string} nombreGrupo - Nombre del grupo
   * @param {number} excludeId - ID a excluir (para actualizaciones)
   * @returns {Promise<boolean>} True si existe
   */
  async existsUniqueCombination(area, modalidad, nombreGrupo, excludeId) {
    const where = { area, modalidad, nombreGrupo };

    if (excludeId) {
      where.grupoId = { not: excludeId };
    }

    return this.exists(where);
  }
}

module.exports = GroupRepository;
