/**
 * Register Grade Use Case
 * Registrar nota individual con validaciones de negocio
 */

class RegisterGradeUseCase {
  /**
   * @param {Object} gradeRepository - Repositorio de notas
   * @param {Object} gradeService - Servicio de notas
   */
  constructor(gradeRepository, gradeService) {
    this.gradeRepository = gradeRepository;
    this.gradeService = gradeService;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} gradeData - Datos de la nota
   * @returns {Promise<Object>} Nota creada
   */
  async execute(gradeData) {
    // Validar datos de la nota
    this.gradeService.validateGradeData(gradeData);

    // Validar reglas de negocio
    await this.gradeService.validateGradeBusinessRules(gradeData);

    // Preparar datos para crear nota
    const gradeToCreate = {
      evaluacionId: parseInt(gradeData.evaluacionId, 10),
      estudianteId: parseInt(gradeData.estudianteId, 10),
      cursoId: parseInt(gradeData.cursoId, 10),
      nota: parseFloat(gradeData.nota),
      observaciones: gradeData.observaciones?.trim() || null,
    };

    // Crear nota
    const grade = await this.gradeRepository.create(gradeToCreate);

    return grade;
  }
}

module.exports = RegisterGradeUseCase;
