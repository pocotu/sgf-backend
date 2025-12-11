/**
 * Attendance Service
 * Maneja la lógica de negocio para gestión de asistencias
 */

const { ValidationError, BusinessLogicError } = require('../utils/errors');

class AttendanceService {
  /**
   * @param {Object} attendanceRepository - Repositorio de asistencias
   * @param {Object} enrollmentRepository - Repositorio de matrículas
   */
  constructor(attendanceRepository, enrollmentRepository) {
    this.attendanceRepository = attendanceRepository;
    this.enrollmentRepository = enrollmentRepository;
  }

  /**
   * Validar datos de asistencia
   * @param {Object} attendanceData - Datos de la asistencia
   */
  validateAttendanceData(attendanceData) {
    const errors = {};

    // Validar estudianteId
    if (!attendanceData.estudianteId) {
      errors.estudianteId = 'ID del estudiante es requerido';
    } else if (!Number.isInteger(attendanceData.estudianteId) || attendanceData.estudianteId <= 0) {
      errors.estudianteId = 'ID del estudiante debe ser un número válido';
    }

    // Validar grupoId
    if (!attendanceData.grupoId) {
      errors.grupoId = 'ID del grupo es requerido';
    } else if (!Number.isInteger(attendanceData.grupoId) || attendanceData.grupoId <= 0) {
      errors.grupoId = 'ID del grupo debe ser un número válido';
    }

    // Validar fechaClase
    if (!attendanceData.fechaClase) {
      errors.fechaClase = 'Fecha de clase es requerida';
    } else {
      const fecha = new Date(attendanceData.fechaClase);
      if (isNaN(fecha.getTime())) {
        errors.fechaClase = 'Fecha de clase debe ser una fecha válida';
      }
    }

    // Validar estado
    const estadosValidos = ['PRESENTE', 'TARDANZA', 'AUSENTE'];
    if (!attendanceData.estado) {
      errors.estado = 'Estado de asistencia es requerido';
    } else if (!estadosValidos.includes(attendanceData.estado)) {
      errors.estado = `Estado debe ser uno de: ${estadosValidos.join(', ')}`;
    }

    // Validar horaRegistro si está presente
    if (attendanceData.horaRegistro) {
      const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!horaRegex.test(attendanceData.horaRegistro)) {
        errors.horaRegistro = 'Hora de registro debe tener formato HH:mm';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Errores de validación', errors);
    }
  }

  /**
   * Validar datos de asistencia masiva
   * @param {Object} bulkData - Datos de asistencia masiva
   */
  validateBulkAttendanceData(bulkData) {
    const errors = {};

    // Validar grupoId
    if (!bulkData.grupoId) {
      errors.grupoId = 'ID del grupo es requerido';
    } else if (!Number.isInteger(bulkData.grupoId) || bulkData.grupoId <= 0) {
      errors.grupoId = 'ID del grupo debe ser un número válido';
    }

    // Validar fechaClase
    if (!bulkData.fechaClase) {
      errors.fechaClase = 'Fecha de clase es requerida';
    } else {
      const fecha = new Date(bulkData.fechaClase);
      if (isNaN(fecha.getTime())) {
        errors.fechaClase = 'Fecha de clase debe ser una fecha válida';
      }
    }

    // Validar asistencias array
    if (!bulkData.asistencias || !Array.isArray(bulkData.asistencias)) {
      errors.asistencias = 'Asistencias debe ser un array';
    } else if (bulkData.asistencias.length === 0) {
      errors.asistencias = 'Debe proporcionar al menos una asistencia';
    } else {
      // Validar cada asistencia
      const asistenciaErrors = [];
      const estadosValidos = ['PRESENTE', 'TARDANZA', 'AUSENTE'];

      bulkData.asistencias.forEach((asistencia, index) => {
        const itemErrors = {};

        if (!asistencia.estudianteId) {
          itemErrors.estudianteId = 'ID del estudiante es requerido';
        } else if (!Number.isInteger(asistencia.estudianteId) || asistencia.estudianteId <= 0) {
          itemErrors.estudianteId = 'ID del estudiante debe ser válido';
        }

        if (!asistencia.estado) {
          itemErrors.estado = 'Estado es requerido';
        } else if (!estadosValidos.includes(asistencia.estado)) {
          itemErrors.estado = `Estado debe ser: ${estadosValidos.join(', ')}`;
        }

        if (asistencia.horaRegistro) {
          const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          if (!horaRegex.test(asistencia.horaRegistro)) {
            itemErrors.horaRegistro = 'Formato debe ser HH:mm';
          }
        }

        if (Object.keys(itemErrors).length > 0) {
          asistenciaErrors.push({ index, errors: itemErrors });
        }
      });

      if (asistenciaErrors.length > 0) {
        errors.asistencias = asistenciaErrors;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Errores de validación', errors);
    }
  }

  /**
   * Validar que no exista asistencia duplicada
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo
   * @param {Date} fechaClase - Fecha de la clase
   */
  async validateNoDuplicate(estudianteId, grupoId, fechaClase) {
    const exists = await this.attendanceRepository.existsForDate(estudianteId, grupoId, fechaClase);

    if (exists) {
      throw new BusinessLogicError(
        'Ya existe un registro de asistencia para este estudiante en esta fecha',
        'ATTENDANCE_DUPLICATE'
      );
    }
  }

  /**
   * Validar que el estudiante esté matriculado en el grupo
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo
   */
  async validateStudentEnrolled(estudianteId, grupoId) {
    const enrollment = await this.enrollmentRepository.findOne({
      estudianteId,
      grupoId,
      estado: 'MATRICULADO',
    });

    if (!enrollment) {
      throw new BusinessLogicError(
        'El estudiante no está matriculado en este grupo',
        'STUDENT_NOT_ENROLLED'
      );
    }

    return enrollment;
  }
}

module.exports = AttendanceService;
