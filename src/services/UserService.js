/**
 * User Service
 * Maneja la lógica de negocio para gestión de usuarios
 */

const bcrypt = require('bcryptjs');
const { ValidationError, NotFoundError, BusinessLogicError } = require('../utils/errors');
const { isValidDni, isValidEmail, isValidRole } = require('../utils/validators');

class UserService {
  /**
   * @param {Object} userRepository - Repositorio de usuarios
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  }

  /**
   * Validar datos de usuario
   * @param {Object} userData - Datos del usuario
   * @param {boolean} isUpdate - Si es actualización
   */
  async validateUserData(userData, isUpdate = false) {
    const errors = {};

    // Validar DNI
    if (!isUpdate && !userData.dni) {
      errors.dni = 'DNI es requerido';
    } else if (userData.dni && !isValidDni(userData.dni)) {
      errors.dni = 'DNI debe tener exactamente 8 dígitos numéricos';
    }

    // Validar correo (opcional pero debe ser válido si se proporciona)
    if (userData.correo && !isValidEmail(userData.correo)) {
      errors.correo = 'Formato de correo electrónico inválido';
    }

    // Validar nombres
    if (!isUpdate && !userData.nombres) {
      errors.nombres = 'Nombres son requeridos';
    } else if (userData.nombres && userData.nombres.trim().length === 0) {
      errors.nombres = 'Nombres no pueden estar vacíos';
    }

    // Validar apellidos
    if (!isUpdate && !userData.apellidos) {
      errors.apellidos = 'Apellidos son requeridos';
    } else if (userData.apellidos && userData.apellidos.trim().length === 0) {
      errors.apellidos = 'Apellidos no pueden estar vacíos';
    }

    // Validar rol
    if (!isUpdate && !userData.rol) {
      errors.rol = 'Rol es requerido';
    } else if (userData.rol && !isValidRole(userData.rol)) {
      errors.rol = 'Rol debe ser: admin, docente o estudiante';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Errores de validación', errors);
    }
  }

  /**
   * Verificar unicidad de DNI y correo
   * @param {string} dni - DNI del usuario
   * @param {string} correo - Correo del usuario
   * @param {number} excludeId - ID a excluir (para actualizaciones)
   */
  async checkUniqueness(dni, correo, excludeId = null) {
    // Verificar DNI único
    if (dni) {
      const dniExists = await this.userRepository.dniExists(dni, excludeId);
      if (dniExists) {
        throw new BusinessLogicError('El DNI ya está registrado', 'USER_DNI_EXISTS');
      }
    }

    // Verificar correo único (si se proporciona)
    if (correo) {
      const emailExists = await this.userRepository.emailExists(correo, excludeId);
      if (emailExists) {
        throw new BusinessLogicError(
          'El correo electrónico ya está registrado',
          'USER_EMAIL_EXISTS'
        );
      }
    }
  }
}

module.exports = UserService;
