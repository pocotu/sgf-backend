/**
 * Delete Student Use Case
 * Eliminar estudiante (soft delete a través del usuario)
 */

const { NotFoundError } = require('../utils/errors');

class DeleteStudentUseCase {
  /**
   * @param {Object} studentRepository - Repositorio de estudiantes
   * @param {Object} userRepository - Repositorio de usuarios
   */
  constructor(studentRepository, userRepository) {
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<Object>} Estudiante eliminado
   */
  async execute(estudianteId) {
    // Verificar que el estudiante existe
    const student = await this.studentRepository.findByIdWithUser(estudianteId);
    if (!student) {
      throw new NotFoundError('Estudiante no encontrado');
    }

    /*
     * Realizar soft delete del usuario asociado
     * Esto marcará el usuario como inactivo
     */
    await this.userRepository.softDelete(student.usuarioId);

    // Obtener estudiante actualizado con datos de usuario
    const deletedStudent = await this.studentRepository.findByIdWithUser(estudianteId);

    return deletedStudent;
  }
}

module.exports = DeleteStudentUseCase;
