/**
 * Attendance Repository
 * Operaciones de base de datos para asistencias
 */

const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class AttendanceRepository extends BaseRepository {
  constructor() {
    super(prisma.asistencia);
  }

  /**
   * Override: Campo ID personalizado
   */
  getIdField() {
    return 'asistenciaId';
  }

  /**
   * Registrar asistencias en lote
   * @param {number} grupoId - ID del grupo
   * @param {Date} fechaClase - Fecha de la clase
   * @param {Array} asistencias - Array de asistencias
   * @returns {Promise<Object>} Resultado del registro masivo
   */
  async registerBulk(grupoId, fechaClase, asistencias) {
    const asistenciasToCreate = asistencias.map(asistencia => ({
      estudianteId: asistencia.estudianteId,
      grupoId,
      fechaClase: new Date(fechaClase),
      estado: asistencia.estado,
      horaRegistro: asistencia.horaRegistro
        ? new Date(`1970-01-01T${asistencia.horaRegistro}:00`)
        : null,
      observaciones: asistencia.observaciones || null,
    }));

    return prisma.$transaction(async tx => {
      const created = await tx.asistencia.createMany({
        data: asistenciasToCreate,
        skipDuplicates: true,
      });

      return created;
    });
  }

  /**
   * Obtener resumen de asistencia por estudiante
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo
   * @param {Object} dateRange - Rango de fechas
   * @returns {Promise<Object>} Resumen de asistencia
   */
  async getSummaryByStudent(estudianteId, grupoId, dateRange = {}) {
    const where = {
      estudianteId,
      grupoId,
    };

    if (dateRange.fechaDesde) {
      where.fechaClase = {
        ...where.fechaClase,
        gte: new Date(dateRange.fechaDesde),
      };
    }

    if (dateRange.fechaHasta) {
      where.fechaClase = {
        ...where.fechaClase,
        lte: new Date(dateRange.fechaHasta),
      };
    }

    const asistencias = await this.model.findMany({
      where,
      orderBy: { fechaClase: 'asc' },
    });

    const totalClases = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === 'PRESENTE').length;
    const tardanzas = asistencias.filter(a => a.estado === 'TARDANZA').length;
    const ausentes = asistencias.filter(a => a.estado === 'AUSENTE').length;

    const porcentajeAsistencia =
      totalClases > 0 ? ((presentes + tardanzas) / totalClases) * 100 : 0;

    return {
      estudianteId,
      grupoId,
      totalClases,
      presentes,
      tardanzas,
      ausentes,
      porcentajeAsistencia: parseFloat(porcentajeAsistencia.toFixed(2)),
      asistencias,
    };
  }

  /**
   * Obtener resumen de asistencia por grupo
   * @param {number} grupoId - ID del grupo
   * @param {Object} dateRange - Rango de fechas
   * @returns {Promise<Array>} Resumen de asistencia por estudiante
   */
  async getSummaryByGroup(grupoId, dateRange = {}) {
    const where = {
      grupoId,
    };

    if (dateRange.fechaDesde) {
      where.fechaClase = {
        ...where.fechaClase,
        gte: new Date(dateRange.fechaDesde),
      };
    }

    if (dateRange.fechaHasta) {
      where.fechaClase = {
        ...where.fechaClase,
        lte: new Date(dateRange.fechaHasta),
      };
    }

    const asistencias = await this.model.findMany({
      where,
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
      },
      orderBy: [{ estudianteId: 'asc' }, { fechaClase: 'asc' }],
    });

    // Agrupar por estudiante
    const estudiantesMap = new Map();

    asistencias.forEach(asistencia => {
      const estudianteId = asistencia.estudianteId;

      if (!estudiantesMap.has(estudianteId)) {
        estudiantesMap.set(estudianteId, {
          estudianteId,
          codigoInterno: asistencia.estudiante.codigoInterno,
          nombreCompleto: `${asistencia.estudiante.usuario.nombres} ${asistencia.estudiante.usuario.apellidos}`,
          totalClases: 0,
          presentes: 0,
          tardanzas: 0,
          ausentes: 0,
        });
      }

      const estudiante = estudiantesMap.get(estudianteId);
      estudiante.totalClases++;

      if (asistencia.estado === 'PRESENTE') {
        estudiante.presentes++;
      } else if (asistencia.estado === 'TARDANZA') {
        estudiante.tardanzas++;
      } else if (asistencia.estado === 'AUSENTE') {
        estudiante.ausentes++;
      }
    });

    // Calcular porcentajes
    const resumen = Array.from(estudiantesMap.values()).map(estudiante => {
      const porcentajeAsistencia =
        estudiante.totalClases > 0
          ? ((estudiante.presentes + estudiante.tardanzas) / estudiante.totalClases) * 100
          : 0;

      return {
        ...estudiante,
        porcentajeAsistencia: parseFloat(porcentajeAsistencia.toFixed(2)),
      };
    });

    return resumen;
  }

  /**
   * Listar asistencias con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Asistencias y total
   */
  async list(filters = {}, pagination = {}) {
    const { grupoId, estudianteId, fechaDesde, fechaHasta, estado } = filters;
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

    if (fechaDesde) {
      where.fechaClase = {
        ...where.fechaClase,
        gte: new Date(fechaDesde),
      };
    }

    if (fechaHasta) {
      where.fechaClase = {
        ...where.fechaClase,
        lte: new Date(fechaHasta),
      };
    }

    const [asistencias, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fechaClase: 'desc' }, { estudianteId: 'asc' }],
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

    return { asistencias, total };
  }

  /**
   * Verificar si existe asistencia para estudiante en fecha
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo
   * @param {Date} fechaClase - Fecha de la clase
   * @returns {Promise<boolean>} True si existe
   */
  async existsForDate(estudianteId, grupoId, fechaClase) {
    const count = await this.model.count({
      where: {
        estudianteId,
        grupoId,
        fechaClase: new Date(fechaClase),
      },
    });

    return count > 0;
  }
}

module.exports = AttendanceRepository;
