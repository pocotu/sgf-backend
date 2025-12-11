/**
 * Cancel Evaluation Use Case
 * Cancelar evaluación
 */

const { NotFoundError } = require('../utils/errors');

class CancelEvaluationUseCase {
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
   * @param {number} evaluacionId - ID de la evaluación
   * @returns {Promise<Object>} Evaluación cancelada
   */
  async execute(evaluacionId) {
    // Verificar que la evaluación existe
    const existingEvaluation = await this.evaluationRepository.findById(evaluacionId);
    if (!existingEvaluation) {
      throw new NotFoundError('Evaluación no encontrada');
    }

    // Validar transición de estado a CANCELADA
    this.evaluationService.validateStateTransition(existingEvaluation.estado, 'CANCELADA');

    // Actualizar estado a CANCELADA
    const canceledEvaluation = await this.evaluationRepository.update(evaluacionId, {
      estado: 'CANCELADA',
    });

    return canceledEvaluation;
  }
}

module.exports = CancelEvaluationUseCase;
