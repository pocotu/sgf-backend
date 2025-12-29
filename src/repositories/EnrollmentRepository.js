/**
 * Enrollment Repository
 * Operaciones de base de datos para matrículas
 */

const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');
const { BusinessLogicError } = require('../utils/errors');

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(prisma.matricula);
  }

  /**
   * Override: Campo ID personalizado
   */
  getIdField() {
    return 'matriculaId';
  }

  /**
   * Buscar matrícula activa de un estudiante
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<Object|null>} Matrícula activa o null
   */
  findActiveByStudent(estudianteId) {
    return this.model.findFirst({
      where: {
        estudianteId,
        estado: 'MATRICULADO',
      },
      include: {
        grupo: true,
        estudiante: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  /**
   * Contar matrículas activas en un grupo
   * @param {number} grupoId - ID del grupo
   * @returns {Promise<number>} Cantidad de matrículas activas
   */
  countActiveByGroup(grupoId) {
    return this.model.count({
      where: {
        grupoId,
        estado: 'MATRICULADO',
      },
    });
  }

  /**
   * Buscar matrícula por ID con relaciones
   * @param {number} matriculaId - ID de la matrícula
   * @returns {Promise<Object|null>} Matrícula con relaciones
   */
  findByIdWithRelations(matriculaId) {
    return this.model.findUnique({
      where: { matriculaId },
      include: {
        estudiante: {
          include: {
            usuario: true,
          },
        },
        grupo: true,
      },
    });
  }

  /**
   * Listar matrículas con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Matrículas y total
   */
  async list(filters = {}, pagination = {}) {
    const { grupoId, estudianteId, estado, search } = filters;
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (grupoId) {
      where.grupoId = parseInt(grupoId, 10);
    }

    if (estudianteId) {
      where.estudianteId = parseInt(estudianteId, 10);
    }

    if (estado) {
      where.estado = estado;
    }

    // Búsqueda por código interno o nombre de estudiante
    if (search) {
      where.estudiante = {
        OR: [
          { codigoInterno: { contains: search } },
          { usuario: { nombres: { contains: search, mode: 'insensitive' } } },
          {
            usuario: { apellidos: { contains: search, mode: 'insensitive' } },
          },
        ],
      };
    }

    const [matriculas, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaMatricula: 'desc' },
        include: {
          estudiante: {
            include: {
              usuario: {
                select: {
                  usuarioId: true,
                  dni: true,
                  nombres: true,
                  apellidos: true,
                },
              },
            },
          },
          grupo: {
            select: {
              grupoId: true,
              area: true,
              modalidad: true,
              nombreGrupo: true,
            },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    return { matriculas, total };
  }

  /**
   * Retirar estudiante (cambiar estado a RETIRADO)
   * @param {number} matriculaId - ID de la matrícula
   * @param {string} motivoRetiro - Motivo del retiro
   * @returns {Promise<Object>} Matrícula actualizada
   */
  withdraw(matriculaId, motivoRetiro) {
    return this.model.update({
      where: { matriculaId },
      data: {
        estado: 'RETIRADO',
        fechaRetiro: new Date(),
        motivoRetiro,
      },
    });
  }

  /**
   * Matricular estudiante con validaciones (transacción)
   * Validaciones: grupo existe, cupos disponibles, no duplicado en mismo grupo
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo
   * @param {number} monto - Monto pagado
   * @returns {Promise<Object>} Resultado con matrícula creada
   */
  async enrollWithValidation(estudianteId, grupoId, monto = 0) {
    return prisma.$transaction(async tx => {
      // 1. Validar que el grupo exista
      const grupo = await tx.grupo.findUnique({
        where: { grupoId: parseInt(grupoId, 10) },
      });

      if (!grupo) {
        throw new BusinessLogicError('Grupo no encontrado', 'GROUP_NOT_FOUND');
      }

      // 2. Validar cupos disponibles
      const inscritos = await tx.matricula.count({
        where: {
          grupoId: parseInt(grupoId, 10),
          estado: 'MATRICULADO',
        },
      });

      if (inscritos >= grupo.capacidad) {
        throw new BusinessLogicError('El grupo no tiene cupos disponibles', 'ENROLLMENT_NO_CAPACITY');
      }

      // 3. Validar que no esté matriculado en el mismo grupo
      const existeMismoGrupo = await tx.matricula.count({
        where: {
          estudianteId: parseInt(estudianteId, 10),
          grupoId: parseInt(grupoId, 10),
          estado: 'MATRICULADO',
        },
      });

      if (existeMismoGrupo > 0) {
        throw new BusinessLogicError(
          `El estudiante ya está matriculado en el grupo ${grupo.nombreGrupo}`,
          'ENROLLMENT_ALREADY_ENROLLED'
        );
      }

      // 4. Crear la matrícula
      const nueva = await tx.matricula.create({
        data: {
          estudianteId: parseInt(estudianteId, 10),
          grupoId: parseInt(grupoId, 10),
          fechaMatricula: new Date(),
          montoPagado: parseFloat(monto) || 0,
          estado: 'MATRICULADO',
        },
      });

      return nueva;
    });
  }
}

module.exports = EnrollmentRepository;
