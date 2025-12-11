/**
 * Register Bulk Grades Use Case
 * Registrar notas en lote con transacciones
 */

class RegisterBulkGradesUseCase {
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
   * @param {Object} bulkData - Datos del registro masivo
   * @returns {Promise<Array>} Notas creadas
   */
  async execute(bulkData) {
    const { evaluacionId, notas } = bulkData;

    // Validar que evaluacionId está presente
    if (!evaluacionId) {
      throw new Error('ID de evaluación es requerido');
    }

    // Validar que notas es un array no vacío
    if (!Array.isArray(notas) || notas.length === 0) {
      throw new Error('Debe proporcionar al menos una nota');
    }

    // Validar que la evaluación existe
    await this.gradeService.validateEvaluationExists(evaluacionId);

    // Validar cada nota individualmente
    for (const nota of notas) {
      const gradeData = {
        evaluacionId,
        estudianteId: nota.estudianteId,
        cursoId: nota.cursoId,
        nota: nota.nota,
        observaciones: nota.observaciones,
      };

      // Validar datos de la nota
      this.gradeService.validateGradeData(gradeData);

      // Validar reglas de negocio
      // eslint-disable-next-line no-await-in-loop
      await this.gradeService.validateGradeBusinessRules(gradeData);
    }

    // Registrar todas las notas en una transacción
    const grades = await this.gradeRepository.registerBulk(evaluacionId, notas);

    return grades;
  }
}

module.exports = RegisterBulkGradesUseCase;
