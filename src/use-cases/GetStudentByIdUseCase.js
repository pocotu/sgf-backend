/**
 * Get Student By Id Use Case
 * Obtener estudiante por ID con datos de usuario
 */

const { NotFoundError } = require('../utils/errors');

class GetStudentByIdUseCase {
  /**
   * @param {Object} studentRepository - Repositorio de estudiantes
   */
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} estudianteId - ID del estudiante
   * @returns {Promise<Object>} Estudiante con datos de usuario
   */
  async execute(estudianteId) {
    const student = await this.studentRepository.findByIdWithUser(estudianteId);

    if (!student) {
      throw new NotFoundError('Estudiante no encontrado');
    }

    return student;
  }
}

module.exports = GetStudentByIdUseCase;
