/**
 * Enrollment Service
 * Maneja la lógica de negocio para gestión de matrículas
 */

const { ValidationError, BusinessLogicError } = require('../utils/errors');

class EnrollmentService {
  /**
   * @param {Object} enrollmentRepository - Repositorio de matrículas
   * @param {Object} groupRepository - Repositorio de grupos
   * @param {Object} studentRepository - Repositorio de estudiantes
   */
  constructor(enrollmentRepository, groupRepository, studentRepository) {
    this.enrollmentRepository = enrollmentRepository;
    this.groupRepository = groupRepository;
    this.studentRepository = studentRepository;
  }

  /**
   * Validar datos de matrícula
   * @param {Object} enrollmentData - Datos de la matrícula
   */
  validateEnrollmentData(enrollmentData) {
    const errors = {};

    // Validar estudianteId
    if (!enrollmentData.estudianteId) {
      errors.estudianteId = 'ID del estudiante es requerido';
    } else if (
      !Number.isInteger(enrollmentData.estudianteId) ||
      enrollmentData.estudianteId <= 0
    ) {
      errors.estudianteId = 'ID del estudiante debe ser un número válido';
    }

    // Validar grupoId
    if (!enrollmentData.grupoId) {
      errors.grupoId = 'ID del grupo es requerido';
    } else if (
      !Number.isInteger(enrollmentData.grupoId) ||
      enrollmentData.grupoId <= 0
    ) {
      errors.grupoId = 'ID del grupo debe ser un número válido';
    }

    // Validar montoPagado
    if (enrollmentData.montoPagado === undefined) {
      errors.montoPagado = 'Monto pagado es requerido';
    } else {
      const monto = parseFloat(enrollmentData.montoPagado);
      if (isNaN(monto) || monto < 0) {
        errors.montoPagado = 'Monto pagado debe ser un número mayor o igual a 0';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Errores de validación', errors);
    }
  }

  /**
   * Validar que el grupo tenga cupos disponibles
   * @param {number} grupoId - ID del grupo
   */
  async validateAvailableCapacity(grupoId) {
    const grupo = await this.groupRepository.findWithEnrollmentCount(grupoId);

    if (!grupo) {
      throw new BusinessLogicError(
        'Grupo no encontrado',
        'GROUP_NOT_FOUND'
      );
    }

    if (grupo.cuposDisponibles <= 0) {
      throw new BusinessLogicError(
        'El grupo no tiene cupos disponibles',
        'ENROLLMENT_NO_CAPACITY'
      );
    }

    return grupo;
  }

  /**
   * Validar que la modalidad del estudiante coincida con la del grupo
   * @param {number} estudianteId - ID del estudiante
   * @param {Object} grupo - Objeto del grupo
   */
  async validateModalidadMatch(estudianteId, grupo) {
    const estudiante = await this.studentRepository.findByIdWithUser(
      estudianteId
    );

    if (!estudiante) {
      throw new BusinessLogicError(
        'Estudiante no encontrado',
        'STUDENT_NOT_FOUND'
      );
    }

    if (estudiante.modalidad !== grupo.modalidad) {
      throw new BusinessLogicError(
        `La modalidad del estudiante (${estudiante.modalidad}) no coincide con la modalidad del grupo (${grupo.modalidad})`,
        'ENROLLMENT_MODALIDAD_MISMATCH'
      );
    }

    return estudiante;
  }

  /**
   * Validar que el estudiante no esté matriculado en otro grupo activo
   * @param {number} estudianteId - ID del estudiante
   */
  async validateNoActiveEnrollment(estudianteId) {
    const activeEnrollment = await this.enrollmentRepository.findActiveByStudent(
      estudianteId
    );

    if (activeEnrollment) {
      throw new BusinessLogicError(
        `El estudiante ya está matriculado en el grupo ${activeEnrollment.grupo.nombreGrupo}`,
        'ENROLLMENT_ALREADY_ENROLLED'
      );
    }
  }

  /**
   * Validar motivo de retiro
   * @param {string} motivoRetiro - Motivo del retiro
   */
  validateWithdrawalReason(motivoRetiro) {
    if (!motivoRetiro || motivoRetiro.trim().length === 0) {
      throw new ValidationError('Motivo de retiro es requerido');
    }

    if (motivoRetiro.trim().length < 10) {
      throw new ValidationError(
        'Motivo de retiro debe tener al menos 10 caracteres'
      );
    }
  }
}

module.exports = EnrollmentService;
