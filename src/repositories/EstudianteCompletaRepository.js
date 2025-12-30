/**
 * EstudianteCompleta Repository
 * Maneja el acceso a datos de la vista estudiantes_completa
 */

const prisma = require('../config/database');
const BaseRepository = require('./BaseRepository');

class EstudianteCompletaRepository extends BaseRepository {
  constructor() {
    super(prisma.estudiantesCompleta);
  }

  /**
   * Override: Campo ID personalizado
   */
  getIdField() {
    return 'estudianteId';
  }

  /**
   * Buscar todos los estudiantes con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}) {
    try {
      const estudiantes = await prisma.estudiantesCompleta.findMany({
        where: filters,
        orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      });
      return estudiantes;
    } catch (error) {
      this.handleError(error, 'Error al listar estudiantes completa');
    }
  }

  /**
   * Buscar estudiante por ID
   * @param {Number} estudianteId
   * @returns {Promise<Object|null>}
   */
  async findById(estudianteId) {
    try {
      const estudiante = await prisma.estudiantesCompleta.findUnique({
        where: { estudianteId },
      });
      return estudiante;
    } catch (error) {
      this.handleError(error, 'Error al buscar estudiante por ID');
    }
  }

  /**
   * Buscar estudiante por DNI
   * @param {String} dni
   * @returns {Promise<Object|null>}
   */
  async findByDni(dni) {
    try {
      const estudiante = await prisma.estudiantesCompleta.findFirst({
        where: { dni },
      });
      return estudiante;
    } catch (error) {
      this.handleError(error, 'Error al buscar estudiante por DNI');
    }
  }

  /**
   * Buscar estudiantes por modalidad
   * @param {String} modalidad
   * @returns {Promise<Array>}
   */
  async findByModalidad(modalidad) {
    try {
      const estudiantes = await prisma.estudiantesCompleta.findMany({
        where: { modalidad },
        orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      });
      return estudiantes;
    } catch (error) {
      this.handleError(error, 'Error al buscar estudiantes por modalidad');
    }
  }

  /**
   * Contar estudiantes por modalidad
   * @returns {Promise<Object>}
   */
  async countByModalidad() {
    try {
      const result = await prisma.$queryRaw`
        SELECT modalidad, COUNT(*) as total
        FROM estudiantes_completa
        GROUP BY modalidad
      `;
      return result;
    } catch (error) {
      this.handleError(error, 'Error al contar estudiantes por modalidad');
    }
  }

  /**
   * Contar estudiantes por estado
   * @returns {Promise<Object>}
   */
  async countByEstado() {
    try {
      const result = await prisma.$queryRaw`
        SELECT estadoUsuario, COUNT(*) as total
        FROM estudiantes_completa
        GROUP BY estadoUsuario
      `;
      return result;
    } catch (error) {
      this.handleError(error, 'Error al contar estudiantes por estado');
    }
  }
}

module.exports = EstudianteCompletaRepository;
