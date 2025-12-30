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

    // Validar que la modalidad del estudiante coincida con la del grupo
    const estudiante = await this.enrollmentService.validateStudentExists(
      enrollmentData.estudianteId
    );
    const grupo = await this.enrollmentService.validateGroupExists(enrollmentData.grupoId);
    await this.enrollmentService.validateModalidadMatch(estudiante, grupo);

    // Matricular usando el método del repositorio con validaciones integradas
    const enrollment = await this.enrollmentRepository.enrollWithValidation(
      enrollmentData.estudianteId,
      enrollmentData.grupoId,
      enrollmentData.montoPagado
    );

    // Obtener matrícula con relaciones para retornar
    const enrollmentWithRelations = await this.enrollmentRepository.findByIdWithRelations(
      enrollment.matriculaId
    );

    // Transformar y limpiar respuesta
    return {
      matriculaId: enrollmentWithRelations.matriculaId,
      estudianteId: enrollmentWithRelations.estudianteId,
      grupoId: enrollmentWithRelations.grupoId,
      fechaMatricula: enrollmentWithRelations.fechaMatricula,
      montoPagado: parseFloat(enrollmentWithRelations.montoPagado),
      estado: enrollmentWithRelations.estado,
      estudiante: {
        estudianteId: enrollmentWithRelations.estudiante.estudianteId,
        codigoInterno: enrollmentWithRelations.estudiante.codigoInterno,
        modalidad: enrollmentWithRelations.estudiante.modalidad,
        nombres: enrollmentWithRelations.estudiante.usuario.nombres,
        apellidos: enrollmentWithRelations.estudiante.usuario.apellidos,
        dni: enrollmentWithRelations.estudiante.usuario.dni,
      },
      grupo: {
        grupoId: enrollmentWithRelations.grupo.grupoId,
        nombreGrupo: enrollmentWithRelations.grupo.nombreGrupo,
        area: enrollmentWithRelations.grupo.area,
        modalidad: enrollmentWithRelations.grupo.modalidad,
        capacidad: enrollmentWithRelations.grupo.capacidad,
      },
    };
  }
}

module.exports = EnrollStudentUseCase;
