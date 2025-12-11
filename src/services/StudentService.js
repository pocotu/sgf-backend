/**
 * Student Service
 * Maneja la lógica de negocio para gestión de estudiantes
 */

const { ValidationError, NotFoundError, BusinessLogicError } = require('../utils/errors');

class StudentService {
  /**
   * @param {Object} studentRepository - Repositorio de estudiantes
   * @param {Object} userRepository - Repositorio de usuarios
   */
  constructor(studentRepository, userRepository) {
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
  }

  /**
   * Validar datos de estudiante
   * @param {Object} studentData - Datos del estudiante
   * @param {boolean} isUpdate - Si es actualización
   */
  async validateStudentData(studentData, isUpdate = false) {
    const errors = {};

    // Validar usuarioId (requerido en creación)
    if (!isUpdate && !studentData.usuarioId) {
      errors.usuarioId = 'ID de usuario es requerido';
    }

    // Validar modalidad
    if (!isUpdate && !studentData.modalidad) {
      errors.modalidad = 'Modalidad es requerida';
    } else if (studentData.modalidad) {
      const validModalidades = ['ORDINARIO', 'PRIMERA_OPCION', 'DIRIMENCIA'];
      if (!validModalidades.includes(studentData.modalidad)) {
        errors.modalidad = 'Modalidad debe ser: ORDINARIO, PRIMERA_OPCION o DIRIMENCIA';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Errores de validación', errors);
    }
  }

  /**
   * Verificar que el usuario existe y tiene rol estudiante
   * @param {number} usuarioId - ID del usuario
   */
  async validateUserForStudent(usuarioId) {
    const user = await this.userRepository.findById(usuarioId);

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (user.rol !== 'estudiante') {
      throw new BusinessLogicError(
        'El usuario debe tener rol estudiante',
        'USER_NOT_STUDENT_ROLE'
      );
    }

    if (user.estado !== 'activo') {
      throw new BusinessLogicError(
        'El usuario debe estar activo',
        'USER_NOT_ACTIVE'
      );
    }

    return user;
  }

  /**
   * Verificar que el usuario no sea ya estudiante
   * @param {number} usuarioId - ID del usuario
   */
  async checkUserNotStudent(usuarioId) {
    const isStudent = await this.studentRepository.isUserStudent(usuarioId);
    if (isStudent) {
      throw new BusinessLogicError(
        'El usuario ya está registrado como estudiante',
        'USER_ALREADY_STUDENT'
      );
    }
  }
}

module.exports = StudentService;
