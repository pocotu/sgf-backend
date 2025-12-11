/**
 * Get Group Ranking Use Case
 * Obtener ranking de un grupo con ordenamiento por promedio
 */

const { BusinessLogicError } = require('../utils/errors');

class GetGroupRankingUseCase {
  /**
   * @param {Object} rankingService - Servicio de rankings
   * @param {Object} groupRepository - Repositorio de grupos
   */
  constructor(rankingService, groupRepository) {
    this.rankingService = rankingService;
    this.groupRepository = groupRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} grupoId - ID del grupo
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object>} Ranking del grupo
   */
  async execute(grupoId, evaluacionId = null) {
    // Validar que el grupo existe
    const grupo = await this.groupRepository.findById(grupoId);

    if (!grupo) {
      throw new BusinessLogicError('El grupo especificado no existe', 'GROUP_NOT_FOUND');
    }

    // Calcular ranking del grupo
    const ranking = await this.rankingService.calculateGroupRanking(grupoId, evaluacionId);

    return ranking;
  }
}

module.exports = GetGroupRankingUseCase;
