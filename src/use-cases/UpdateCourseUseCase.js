/**
 * Update Course Use Case
 * Actualizar curso
 */

const { NotFoundError } = require('../utils/errors');

class UpdateCourseUseCase {
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
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Curso actualizado
   */
  async execute(cursoId, updateData) {
    // Verificar que el curso existe
    const existingCourse = await this.courseRepository.findById(cursoId);
    if (!existingCourse) {
      throw new NotFoundError('Curso no encontrado');
    }

    // Validar datos de actualización
    this.courseService.validateCourseData(updateData, true);

    // Preparar datos para actualizar
    const dataToUpdate = {};

    if (updateData.nombre !== undefined) {
      dataToUpdate.nombre = updateData.nombre.trim();
    }

    if (updateData.area !== undefined) {
      dataToUpdate.area = updateData.area;
    }

    if (updateData.descripcion !== undefined) {
      dataToUpdate.descripcion = updateData.descripcion || null;
    }

    if (updateData.estado !== undefined) {
      dataToUpdate.estado = updateData.estado;
    }

    // Actualizar curso
    const updatedCourse = await this.courseRepository.update(
      cursoId,
      dataToUpdate
    );

    return updatedCourse;
  }
}

module.exports = UpdateCourseUseCase;
