/**
 * Create Course Use Case
 * Crear curso con validación de área
 */

class CreateCourseUseCase {
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
   * @param {Object} courseData - Datos del curso
   * @param {string} courseData.nombre - Nombre del curso
   * @param {string} courseData.area - Área académica (A, B, C, D)
   * @param {string} courseData.descripcion - Descripción del curso (opcional)
   * @returns {Promise<Object>} Curso creado
   */
  async execute(courseData) {
    // Validar datos del curso
    this.courseService.validateCourseData(courseData);

    // Preparar datos para crear curso
    const courseToCreate = {
      nombre: courseData.nombre.trim(),
      area: courseData.area,
      descripcion: courseData.descripcion || null,
      estado: 'activo',
    };

    // Crear curso
    const course = await this.courseRepository.create(courseToCreate);

    return course;
  }
}

module.exports = CreateCourseUseCase;
