/**
 * Get Course By Id Use Case
 * Obtener curso por ID
 */

const { NotFoundError } = require('../utils/errors');

class GetCourseByIdUseCase {
  /**
   * @param {Object} courseRepository - Repositorio de cursos
   */
  constructor(courseRepository) {
    this.courseRepository = courseRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Object>} Curso encontrado
   */
  async execute(cursoId) {
    const course = await this.courseRepository.findById(cursoId);

    if (!course) {
      throw new NotFoundError('Curso no encontrado');
    }

    return course;
  }
}

module.exports = GetCourseByIdUseCase;
