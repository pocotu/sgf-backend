/**
 * User Repository
 * Operaciones de base de datos para usuarios
 */

const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.usuario);
  }

  /**
   * Override: Campo ID personalizado
   */
  getIdField() {
    return 'usuarioId';
  }

  /**
   * Buscar usuario por DNI
   */
  findByDni(dni) {
    return this.model.findUnique({
      where: { dni },
    });
  }

  /**
   * Buscar usuario por email
   */
  findByEmail(correo) {
    return this.model.findUnique({
      where: { correo },
    });
  }

  /**
   * Buscar usuarios por rol
   */
  findByRole(rol, options = {}) {
    return this.model.findMany({
      where: { rol },
      ...options,
    });
  }

  /**
   * Buscar usuarios activos
   */
  findActive(options = {}) {
    return this.model.findMany({
      where: { estado: 'activo' },
      ...options,
    });
  }

  /**
   * Verificar si DNI existe
   */
  dniExists(dni, excludeId = null) {
    const where = { dni };
    if (excludeId) {
      where.usuarioId = { not: excludeId };
    }
    return this.exists(where);
  }

  /**
   * Verificar si email existe
   */
  emailExists(correo, excludeId = null) {
    const where = { correo };
    if (excludeId) {
      where.usuarioId = { not: excludeId };
    }
    return this.exists(where);
  }

  /**
   * Buscar usuario por DNI o correo electrónico
   * @param {string} identifier - DNI (8 dígitos) o correo electrónico
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  findByIdentifier(identifier) {
    // Si el identifier tiene 8 dígitos, buscar por DNI
    if (/^\d{8}$/.test(identifier)) {
      return this.findByDni(identifier);
    }
    // Si no, buscar por correo
    return this.findByEmail(identifier);
  }
}

module.exports = UserRepository;
