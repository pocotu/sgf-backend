/**
 * Get Evaluation By Id Use Case
 * Obtener evaluación por ID con total de notas
 */

const { NotFoundError } = require('../utils/errors');

class GetEvaluationByIdUseCase {
  /**
   * @param {Object} evaluationRepository - Repositorio de evaluaciones
   */
  constructor(evaluationRepository) {
    this.evaluationRepository = evaluationRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} evaluacionId - ID de la evaluación
   * @returns {Promise<Object>} Evaluación con detalles
   */
  async execute(evaluacionId) {
    const evaluation = await this.evaluationRepository.findWithGradeCount(evaluacionId);

    if (!evaluation) {
      throw new NotFoundError('Evaluación no encontrada');
    }

    return evaluation;
  }
}

module.exports = GetEvaluationByIdUseCase;
