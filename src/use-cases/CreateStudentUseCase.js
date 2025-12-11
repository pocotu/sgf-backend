/**
 * Create Student Use Case
 * Crear estudiante con generación automática de código interno
 */

class CreateStudentUseCase {
  /**
   * @param {Object} studentRepository - Repositorio de estudiantes
   * @param {Object} studentService - Servicio de estudiantes
   */
  constructor(studentRepository, studentService) {
    this.studentRepository = studentRepository;
    this.studentService = studentService;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} studentData - Datos del estudiante
   * @param {number} studentData.usuarioId - ID del usuario
   * @param {string} studentData.modalidad - Modalidad del estudiante
   * @param {string} studentData.area - Área académica (opcional)
   * @returns {Promise<Object>} Estudiante creado con datos de usuario
   */
  async execute(studentData) {
    // Validar datos del estudiante
    await this.studentService.validateStudentData(studentData);

    // Verificar que el usuario existe y tiene rol estudiante
    await this.studentService.validateUserForStudent(studentData.usuarioId);

    // Verificar que el usuario no sea ya estudiante
    await this.studentService.checkUserNotStudent(studentData.usuarioId);

    // Generar código interno
    const codigoInterno = await this.studentRepository.generateCodigoInterno(
      studentData.modalidad,
      studentData.area || null
    );

    // Preparar datos para crear estudiante
    const studentToCreate = {
      usuarioId: studentData.usuarioId,
      codigoInterno,
      modalidad: studentData.modalidad,
    };

    // Crear estudiante
    const student = await this.studentRepository.create(studentToCreate);

    // Obtener estudiante con datos de usuario
    const studentWithUser = await this.studentRepository.findByIdWithUser(student.estudianteId);

    return studentWithUser;
  }
}

module.exports = CreateStudentUseCase;
