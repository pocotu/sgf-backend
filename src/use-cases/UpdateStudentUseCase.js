/**
 * Update Student Use Case
 * Actualizar datos de estudiante
 */

const { NotFoundError, BusinessLogicError } = require('../utils/errors');

class UpdateStudentUseCase {
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
   * @param {number} estudianteId - ID del estudiante
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Estudiante actualizado
   */
  async execute(estudianteId, updateData) {
    // Verificar que el estudiante existe
    const existingStudent = await this.studentRepository.findById(estudianteId);
    if (!existingStudent) {
      throw new NotFoundError('Estudiante no encontrado');
    }

    // Prevenir cambios en campos protegidos
    const protectedFields = ['estudianteId', 'usuarioId', 'codigoInterno'];
    const attemptedChanges = Object.keys(updateData).filter(field =>
      protectedFields.includes(field)
    );

    if (attemptedChanges.length > 0) {
      throw new BusinessLogicError(
        `No se pueden modificar los campos: ${attemptedChanges.join(', ')}`,
        'PROTECTED_FIELDS'
      );
    }

    // Validar datos si se está actualizando modalidad
    if (updateData.modalidad) {
      await this.studentService.validateStudentData(updateData, true);
    }

    // Actualizar estudiante
    const updatedStudent = await this.studentRepository.update(
      estudianteId,
      updateData
    );

    // Obtener estudiante con datos de usuario
    const studentWithUser = await this.studentRepository.findByIdWithUser(
      updatedStudent.estudianteId
    );

    return studentWithUser;
  }
}

module.exports = UpdateStudentUseCase;
