/**
 * Schedule Evaluation Use Case
 * Programar evaluación con validación de semana (1-52)
 */

class ScheduleEvaluationUseCase {
  /**
   * @param {Object} evaluationRepository - Repositorio de evaluaciones
   * @param {Object} evaluationService - Servicio de evaluaciones
   */
  constructor(evaluationRepository, evaluationService) {
    this.evaluationRepository = evaluationRepository;
    this.evaluationService = evaluationService;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} evaluationData - Datos de la evaluación
   * @returns {Promise<Object>} Evaluación creada
   */
  async execute(evaluationData) {
    // Validar datos de la evaluación
    this.evaluationService.validateEvaluationData(evaluationData);

    // Validar que el grupo existe
    await this.evaluationService.validateGroupExists(evaluationData.grupoId);

    // Preparar datos para crear evaluación
    const evaluationToCreate = {
      grupoId: parseInt(evaluationData.grupoId, 10),
      numeroSemana: parseInt(evaluationData.numeroSemana, 10),
      fechaEvaluacion: new Date(evaluationData.fechaEvaluacion),
      descripcion: evaluationData.descripcion?.trim() || null,
      duracionMinutos: evaluationData.duracionMinutos || 120,
      estado: 'PROGRAMADA',
    };

    // Crear evaluación
    const evaluation = await this.evaluationRepository.create(evaluationToCreate);

    return evaluation;
  }
}

module.exports = ScheduleEvaluationUseCase;
