/**
 * Evaluation Repository
 * Operaciones de base de datos para evaluaciones
 */

const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class EvaluationRepository extends BaseRepository {
  constructor() {
    super(prisma.evaluacion);
  }

  /**
   * Override: Campo ID personalizado
   */
  getIdField() {
    return 'evaluacionId';
  }

  /**
   * Buscar evaluación con conteo de notas registradas
   * @param {number} evaluacionId - ID de la evaluación
   * @returns {Promise<Object>} Evaluación con conteo de notas
   */
  async findWithGradeCount(evaluacionId) {
    const evaluacion = await this.model.findUnique({
      where: { evaluacionId },
      include: {
        grupo: {
          select: {
            grupoId: true,
            nombreGrupo: true,
            area: true,
            modalidad: true,
          },
        },
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    if (!evaluacion) {
      return null;
    }

    return {
      ...evaluacion,
      totalNotas: evaluacion._count.notas,
    };
  }

  /**
   * Validar número de semana
   * @param {number} numeroSemana - Número de semana (1-52)
   * @returns {boolean} True si el número de semana es válido
   */
  validateWeekNumber(numeroSemana) {
    const semana = parseInt(numeroSemana, 10);
    return !isNaN(semana) && semana >= 1 && semana <= 52;
  }

  /**
   * Listar evaluaciones con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Evaluaciones y total
   */
  async list(filters = {}, pagination = {}) {
    const { grupoId, estado, fechaDesde, fechaHasta, numeroSemana } = filters;
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (grupoId) {
      where.grupoId = parseInt(grupoId, 10);
    }

    if (estado) {
      where.estado = estado;
    }

    if (numeroSemana) {
      where.numeroSemana = parseInt(numeroSemana, 10);
    }

    // Filtro por rango de fechas
    if (fechaDesde || fechaHasta) {
      where.fechaEvaluacion = {};
      if (fechaDesde) {
        where.fechaEvaluacion.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaEvaluacion.lte = new Date(fechaHasta);
      }
    }

    const [evaluaciones, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fechaEvaluacion: 'desc' }, { numeroSemana: 'desc' }],
        include: {
          grupo: {
            select: {
              grupoId: true,
              nombreGrupo: true,
              area: true,
              modalidad: true,
            },
          },
          _count: {
            select: {
              notas: true,
            },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    // Agregar total de notas a cada evaluación
    const evaluacionesConNotas = evaluaciones.map(evaluacion => ({
      ...evaluacion,
      totalNotas: evaluacion._count.notas,
    }));

    return { evaluaciones: evaluacionesConNotas, total };
  }
}

module.exports = EvaluationRepository;
