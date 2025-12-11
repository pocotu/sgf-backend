/**
 * Delete Course Use Case
 * Eliminar curso (soft delete con validación de relaciones)
 */

const { NotFoundError } = require('../utils/errors');

class DeleteCourseUseCase {
  /**
   * @param {Object} courseRepository - Repositorio de cursos
   * @param {Object} courseService - Servicio de cursos
   */
  constructor(courseRepository, courseService) {
    this.courseRepository = courseRepository;
    this.courseService = courseService;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Object>} Curso eliminado
   */
  async execute(cursoId) {
    // Verificar que el curso existe
    const existingCourse = await this.courseRepository.findById(cursoId);
    if (!existingCourse) {
      throw new NotFoundError('Curso no encontrado');
    }

    // Validar que el curso puede ser eliminado
    await this.courseService.validateCanDelete(cursoId);

    // Realizar soft delete
    const deletedCourse = await this.courseRepository.softDelete(cursoId);

    return deletedCourse;
  }
}

module.exports = DeleteCourseUseCase;
