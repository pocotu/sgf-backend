/**
 * Grade Repository
 * Operaciones de base de datos para notas
 */

const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class GradeRepository extends BaseRepository {
  constructor() {
    super(prisma.nota);
  }

  /**
   * Override: Campo ID personalizado
   */
  getIdField() {
    return 'notaId';
  }

  /**
   * Registrar notas en lote con transacción
   * @param {number} evaluacionId - ID de la evaluación
   * @param {Array} notas - Array de notas a registrar
   * @returns {Promise<Array>} Notas creadas
   */
  async registerBulk(evaluacionId, notas) {
    const notasToCreate = notas.map(nota => ({
      evaluacionId,
      estudianteId: parseInt(nota.estudianteId, 10),
      cursoId: parseInt(nota.cursoId, 10),
      nota: parseFloat(nota.nota),
      observaciones: nota.observaciones?.trim() || null,
    }));

    return prisma.$transaction(notasToCreate.map(nota => this.model.create({ data: nota })));
  }

  /**
   * Obtener notas de un estudiante con filtros
   * @param {number} estudianteId - ID del estudiante
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Notas del estudiante
   */
  async getByStudent(estudianteId, filters = {}) {
    const { grupoId, evaluacionId, cursoId } = filters;

    const where = { estudianteId };

    if (evaluacionId) {
      where.evaluacionId = parseInt(evaluacionId, 10);
    }

    if (cursoId) {
      where.cursoId = parseInt(cursoId, 10);
    }

    // Si se especifica grupoId, filtrar por evaluaciones de ese grupo
    if (grupoId) {
      where.evaluacion = {
        grupoId: parseInt(grupoId, 10),
      };
    }

    return this.model.findMany({
      where,
      include: {
        curso: {
          select: {
            cursoId: true,
            nombre: true,
            area: true,
          },
        },
        evaluacion: {
          select: {
            evaluacionId: true,
            numeroSemana: true,
            fechaEvaluacion: true,
            grupoId: true,
          },
        },
      },
      orderBy: [{ evaluacion: { fechaEvaluacion: 'desc' } }, { curso: { nombre: 'asc' } }],
    });
  }

  /**
   * Calcular promedio de un estudiante en una evaluación
   * @param {number} evaluacionId - ID de la evaluación
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<number|null>} Promedio o null si no hay notas
   */
  async calculateAverageByEvaluation(evaluacionId, estudianteId) {
    const result = await this.model.aggregate({
      where: {
        evaluacionId,
        estudianteId,
      },
      _avg: {
        nota: true,
      },
    });

    return result._avg.nota ? parseFloat(result._avg.nota.toFixed(2)) : null;
  }

  /**
   * Calcular promedio general de un estudiante
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo (opcional)
   * @returns {Promise<number|null>} Promedio general o null si no hay notas
   */
  async calculateGeneralAverage(estudianteId, grupoId = null) {
    const where = { estudianteId };

    if (grupoId) {
      where.evaluacion = {
        grupoId: parseInt(grupoId, 10),
      };
    }

    const result = await this.model.aggregate({
      where,
      _avg: {
        nota: true,
      },
    });

    return result._avg.nota ? parseFloat(result._avg.nota.toFixed(2)) : null;
  }

  /**
   * Listar notas con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Notas y total
   */
  async list(filters = {}, pagination = {}) {
    const { evaluacionId, estudianteId, cursoId, grupoId } = filters;
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (evaluacionId) {
      where.evaluacionId = parseInt(evaluacionId, 10);
    }

    if (estudianteId) {
      where.estudianteId = parseInt(estudianteId, 10);
    }

    if (cursoId) {
      where.cursoId = parseInt(cursoId, 10);
    }

    if (grupoId) {
      where.evaluacion = {
        grupoId: parseInt(grupoId, 10),
      };
    }

    const [notas, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { evaluacion: { fechaEvaluacion: 'desc' } },
          { estudiante: { codigoInterno: 'asc' } },
        ],
        include: {
          estudiante: {
            select: {
              estudianteId: true,
              codigoInterno: true,
              usuario: {
                select: {
                  nombres: true,
                  apellidos: true,
                },
              },
            },
          },
          curso: {
            select: {
              cursoId: true,
              nombre: true,
              area: true,
            },
          },
          evaluacion: {
            select: {
              evaluacionId: true,
              numeroSemana: true,
              fechaEvaluacion: true,
              grupoId: true,
            },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    return { notas, total };
  }

  /**
   * Verificar si existe una nota duplicada
   * @param {number} evaluacionId - ID de la evaluación
   * @param {number} estudianteId - ID del estudiante
   * @param {number} cursoId - ID del curso
   * @returns {Promise<boolean>} True si existe
   */
  async existsDuplicate(evaluacionId, estudianteId, cursoId) {
    const count = await this.model.count({
      where: {
        evaluacionId: parseInt(evaluacionId, 10),
        estudianteId: parseInt(estudianteId, 10),
        cursoId: parseInt(cursoId, 10),
      },
    });

    return count > 0;
  }
}

module.exports = GradeRepository;
