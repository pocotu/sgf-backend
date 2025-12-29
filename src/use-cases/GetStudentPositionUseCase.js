/**
 * Get Student Position Use Case
 * Obtener posición de un estudiante en el ranking con cálculo de diferencia con primer lugar
 */

class GetStudentPositionUseCase {
  /**
   * @param {Object} rankingService - Servicio de rankings
   */
  constructor(rankingService) {
    this.rankingService = rankingService;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo (opcional)
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object>} Posición del estudiante en el ranking
   */
  async execute(estudianteId, grupoId = null, evaluacionId = null) {
    // Obtener posición del estudiante usando query optimizada
    const position = await this.rankingService.getStudentPosition(
      estudianteId,
      grupoId,
      evaluacionId
    );

    return position;
  }
}

module.exports = GetStudentPositionUseCase;
