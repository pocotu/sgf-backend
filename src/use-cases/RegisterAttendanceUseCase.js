/**
 * Register Attendance Use Case
 * Registrar asistencia individual con validación de duplicados
 */

class RegisterAttendanceUseCase {
  /**
   * @param {Object} attendanceRepository - Repositorio de asistencias
   * @param {Object} attendanceService - Servicio de asistencias
   */
  constructor(attendanceRepository, attendanceService) {
    this.attendanceRepository = attendanceRepository;
    this.attendanceService = attendanceService;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} attendanceData - Datos de la asistencia
   * @returns {Promise<Object>} Asistencia creada
   */
  async execute(attendanceData) {
    // Validar datos básicos
    this.attendanceService.validateAttendanceData(attendanceData);

    // Validar que el estudiante esté matriculado en el grupo
    await this.attendanceService.validateStudentEnrolled(
      attendanceData.estudianteId,
      attendanceData.grupoId
    );

    // Validar que no exista asistencia duplicada
    await this.attendanceService.validateNoDuplicate(
      attendanceData.estudianteId,
      attendanceData.grupoId,
      attendanceData.fechaClase
    );

    // Preparar datos para crear asistencia
    const attendanceToCreate = {
      estudianteId: attendanceData.estudianteId,
      grupoId: attendanceData.grupoId,
      fechaClase: new Date(attendanceData.fechaClase),
      estado: attendanceData.estado,
      horaRegistro: attendanceData.horaRegistro
        ? new Date(`1970-01-01T${attendanceData.horaRegistro}:00`)
        : null,
      observaciones: attendanceData.observaciones || null,
    };

    // Crear asistencia
    const attendance = await this.attendanceRepository.create(attendanceToCreate);

    return attendance;
  }
}

module.exports = RegisterAttendanceUseCase;
