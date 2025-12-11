/**
 * Enroll Student Use Case
 * Matricular estudiante en un grupo con validaciones de negocio
 */

class EnrollStudentUseCase {
  /**
   * @param {Object} enrollmentRepository - Repositorio de matrículas
   * @param {Object} enrollmentService - Servicio de matrículas
   */
  constructor(enrollmentRepository, enrollmentService) {
    this.enrollmentRepository = enrollmentRepository;
    this.enrollmentService = enrollmentService;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} enrollmentData - Datos de la matrícula
   * @returns {Promise<Object>} Matrícula creada
   */
  async execute(enrollmentData) {
    // Validar datos básicos
    this.enrollmentService.validateEnrollmentData(enrollmentData);

    // Validar que el estudiante no esté matriculado en otro grupo activo
    await this.enrollmentService.validateNoActiveEnrollment(enrollmentData.estudianteId);

    // Validar que el grupo tenga cupos disponibles
    const grupo = await this.enrollmentService.validateAvailableCapacity(enrollmentData.grupoId);

    // Validar que la modalidad del estudiante coincida con la del grupo
    await this.enrollmentService.validateModalidadMatch(enrollmentData.estudianteId, grupo);

    // Preparar datos para crear matrícula
    const enrollmentToCreate = {
      estudianteId: enrollmentData.estudianteId,
      grupoId: enrollmentData.grupoId,
      fechaMatricula: new Date(),
      montoPagado: parseFloat(enrollmentData.montoPagado),
      estado: 'MATRICULADO',
    };

    // Crear matrícula
    const enrollment = await this.enrollmentRepository.create(enrollmentToCreate);

    // Obtener matrícula con relaciones para retornar
    const enrollmentWithRelations = await this.enrollmentRepository.findByIdWithRelations(
      enrollment.matriculaId
    );

    return enrollmentWithRelations;
  }
}

module.exports = EnrollStudentUseCase;
