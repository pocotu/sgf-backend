/**
 * Update Evaluation Use Case
 * Actualizar evaluación
 */

const { NotFoundError } = require('../utils/errors');

class UpdateEvaluationUseCase {
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
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Evaluación actualizada
   */
  async execute(evaluacionId, updateData) {
    // Verificar que la evaluación existe
    const existingEvaluation = await this.evaluationRepository.findById(evaluacionId);
    if (!existingEvaluation) {
      throw new NotFoundError('Evaluación no encontrada');
    }

    // Validar datos de actualización
    this.evaluationService.validateEvaluationData(updateData, true);

    // Si se está cambiando el estado, validar transición
    if (updateData.estado && updateData.estado !== existingEvaluation.estado) {
      this.evaluationService.validateStateTransition(existingEvaluation.estado, updateData.estado);
    }

    // Si se está cambiando el grupo, validar que existe
    if (updateData.grupoId && updateData.grupoId !== existingEvaluation.grupoId) {
      await this.evaluationService.validateGroupExists(updateData.grupoId);
    }

    // Preparar datos para actualizar
    const dataToUpdate = {};

    if (updateData.grupoId) {
      dataToUpdate.grupoId = parseInt(updateData.grupoId, 10);
    }

    if (updateData.numeroSemana !== undefined) {
      dataToUpdate.numeroSemana = parseInt(updateData.numeroSemana, 10);
    }

    if (updateData.fechaEvaluacion) {
      dataToUpdate.fechaEvaluacion = new Date(updateData.fechaEvaluacion);
    }

    if (updateData.descripcion !== undefined) {
      dataToUpdate.descripcion = updateData.descripcion?.trim() || null;
    }

    if (updateData.duracionMinutos !== undefined) {
      dataToUpdate.duracionMinutos = parseInt(updateData.duracionMinutos, 10);
    }

    if (updateData.estado) {
      dataToUpdate.estado = updateData.estado;
    }

    // Actualizar evaluación
    const updatedEvaluation = await this.evaluationRepository.update(evaluacionId, dataToUpdate);

    return updatedEvaluation;
  }
}

module.exports = UpdateEvaluationUseCase;
