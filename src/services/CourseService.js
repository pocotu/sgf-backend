/**
 * Course Service
 * Maneja la lógica de negocio para gestión de cursos
 */

const { ValidationError, BusinessLogicError } = require('../utils/errors');

class CourseService {
  /**
   * @param {Object} courseRepository - Repositorio de cursos
   */
  constructor(courseRepository) {
    this.courseRepository = courseRepository;
  }

  /**
   * Validar datos de curso
   * @param {Object} courseData - Datos del curso
   * @param {boolean} isUpdate - Si es actualización
   */
  validateCourseData(courseData, isUpdate = false) {
    const errors = {};

    // Validar nombre (requerido en creación)
    if (!isUpdate && !courseData.nombre) {
      errors.nombre = 'Nombre del curso es requerido';
    } else if (courseData.nombre && courseData.nombre.trim().length === 0) {
      errors.nombre = 'Nombre del curso no puede estar vacío';
    }

    // Validar área
    if (!isUpdate && !courseData.area) {
      errors.area = 'Área académica es requerida';
    } else if (courseData.area) {
      const validAreas = ['A', 'B', 'C', 'D'];
      if (!validAreas.includes(courseData.area)) {
        errors.area = 'Área debe ser: A, B, C o D';
      }
    }

    // Validar estado si se proporciona
    if (courseData.estado) {
      const validEstados = ['activo', 'inactivo'];
      if (!validEstados.includes(courseData.estado)) {
        errors.estado = 'Estado debe ser: activo o inactivo';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Errores de validación', errors);
    }
  }

  /**
   * Validar que un curso puede ser eliminado
   * @param {number} cursoId - ID del curso
   */
  async validateCanDelete(cursoId) {
    const hasRelations = await this.courseRepository.hasActiveRelations(
      cursoId
    );

    if (hasRelations) {
      throw new BusinessLogicError(
        'No se puede eliminar el curso porque tiene notas registradas',
        'COURSE_HAS_RELATIONS'
      );
    }
  }
}

module.exports = CourseService;
