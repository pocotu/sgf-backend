/**
 * Student Repository
 * Operaciones de base de datos para estudiantes
 */

const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class StudentRepository extends BaseRepository {
  constructor() {
    super(prisma.estudiante);
  }

  /**
   * Override: Campo ID personalizado
   */
  getIdField() {
    return 'estudianteId';
  }

  /**
   * Buscar estudiante por código interno
   * @param {string} codigoInterno - Código interno del estudiante
   * @returns {Promise<Object|null>} Estudiante encontrado o null
   */
  findByCodigoInterno(codigoInterno) {
    return this.model.findUnique({
      where: { codigoInterno },
      include: { usuario: true },
    });
  }

  /**
   * Buscar estudiante por ID con datos de usuario
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<Object|null>} Estudiante con datos de usuario
   */
  findByIdWithUser(estudianteId) {
    return this.model.findUnique({
      where: { estudianteId },
      include: {
        usuario: {
          select: {
            usuarioId: true,
            dni: true,
            correo: true,
            nombres: true,
            apellidos: true,
            telefono: true,
            estado: true,
            rol: true,
          },
        },
      },
    });
  }

  /**
   * Listar estudiantes con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Object>} Estudiantes y total
   */
  async list(filters = {}, pagination = {}) {
    const { modalidad, area, search } = filters;
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (modalidad) {
      where.modalidad = modalidad;
    }

    // Filtro por área a través de matrículas activas
    if (area) {
      where.matriculas = {
        some: {
          estado: 'MATRICULADO',
          grupo: {
            area,
          },
        },
      };
    }

    // Búsqueda por código interno, DNI o nombre
    if (search) {
      where.OR = [
        { codigoInterno: { contains: search } },
        { usuario: { dni: { contains: search } } },
        { usuario: { nombres: { contains: search, mode: 'insensitive' } } },
        { usuario: { apellidos: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [estudiantes, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaCreacion: 'desc' },
        include: {
          usuario: {
            select: {
              usuarioId: true,
              dni: true,
              correo: true,
              nombres: true,
              apellidos: true,
              telefono: true,
              estado: true,
            },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    return { estudiantes, total };
  }

  /**
   * Generar código interno para estudiante
   * Formato: YYYY-AREA-MOD-NNN
   * @param {string} modalidad - Modalidad del estudiante
   * @param {string} area - Área académica (opcional)
   * @returns {Promise<string>} Código interno generado
   */
  async generateCodigoInterno(modalidad, area = null) {
    const year = new Date().getFullYear();
    
    // Mapear modalidad a código corto
    const modalidadMap = {
      ORDINARIO: 'ORD',
      PRIMERA_OPCION: 'PRI',
      DIRIMENCIA: 'DIR',
    };
    const modCode = modalidadMap[modalidad] || 'ORD';
    
    // Usar área si se proporciona, sino usar 'X'
    const areaCode = area || 'X';
    
    // Construir prefijo: YYYY-AREA-MOD
    const prefix = `${year}-${areaCode}-${modCode}`;
    
    // Buscar el último código con este prefijo
    const lastStudent = await this.model.findFirst({
      where: {
        codigoInterno: {
          startsWith: prefix,
        },
      },
      orderBy: {
        codigoInterno: 'desc',
      },
    });
    
    let nextNumber = 1;
    if (lastStudent) {
      // Extraer el número del último código (últimos 3 dígitos)
      const lastCode = lastStudent.codigoInterno;
      const lastNumber = parseInt(lastCode.slice(-3), 10);
      nextNumber = lastNumber + 1;
    }
    
    // Formatear número con 3 dígitos (001, 002, etc.)
    const numberStr = nextNumber.toString().padStart(3, '0');
    
    return `${prefix}-${numberStr}`;
  }

  /**
   * Verificar si código interno existe
   * @param {string} codigoInterno - Código interno a verificar
   * @returns {Promise<boolean>} True si existe
   */
  async codigoInternoExists(codigoInterno) {
    return this.exists({ codigoInterno });
  }

  /**
   * Verificar si usuario ya es estudiante
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<boolean>} True si ya es estudiante
   */
  async isUserStudent(usuarioId) {
    return this.exists({ usuarioId });
  }
}

module.exports = StudentRepository;
