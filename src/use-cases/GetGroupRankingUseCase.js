/**
 * Get Group Ranking Use Case
 * Obtener ranking de un grupo con ordenamiento por promedio
 */

class GetGroupRankingUseCase {
  /**
   * @param {Object} rankingService - Servicio de rankings
   */
  constructor(rankingService) {
    this.rankingService = rankingService;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} grupoId - ID del grupo (opcional para ranking global)
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object>} Ranking del grupo
   */
  async execute(grupoId = null, evaluacionId = null) {
    // Obtener ranking del grupo usando query optimizada con RANK()
    const ranking = await this.rankingService.getGroupRanking(grupoId, evaluacionId);

    return ranking;
  }
}

module.exports = GetGroupRankingUseCase;
