/**
 * Ranking Service
 * Maneja la lógica de negocio para cálculo de rankings
 */

const { BusinessLogicError } = require('../utils/errors');

class RankingService {
  /**
   * @param {Object} rankingRepository - Repositorio de rankings
   * @param {Object} groupRepository - Repositorio de grupos
   */
  constructor(rankingRepository, groupRepository) {
    this.rankingRepository = rankingRepository;
    this.groupRepository = groupRepository;
  }

  /**
   * Obtener ranking de un grupo con validaciones
   * @param {number} grupoId - ID del grupo (opcional para ranking global)
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object>} Ranking con estadísticas
   */
  async getGroupRanking(grupoId = null, evaluacionId = null) {
    // Validar que el grupo exista si se proporciona
    if (grupoId) {
      const grupo = await this.groupRepository.findById(grupoId);
      if (!grupo) {
        throw new BusinessLogicError('Grupo no encontrado', 'GROUP_NOT_FOUND');
      }
    }

    // Obtener ranking optimizado desde el repositorio
    const ranking = await this.rankingRepository.getRankingByGroup(grupoId, evaluacionId);

    // Obtener estadísticas del grupo
    const stats = grupoId
      ? await this.rankingRepository.getGroupStats(grupoId, evaluacionId)
      : null;

    return {
      grupoId: grupoId ? parseInt(grupoId, 10) : null,
      evaluacionId: evaluacionId ? parseInt(evaluacionId, 10) : null,
      estadisticas: stats,
      ranking,
    };
  }

  /**
   * Obtener posición de un estudiante en el ranking
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo (opcional)
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object>} Posición y estadísticas del estudiante
   */
  async getStudentPosition(estudianteId, grupoId = null, evaluacionId = null) {
    const position = await this.rankingRepository.getStudentPosition(
      estudianteId,
      grupoId,
      evaluacionId
    );

    if (!position) {
      throw new BusinessLogicError(
        'No se encontraron datos de ranking para este estudiante',
        'STUDENT_RANKING_NOT_FOUND'
      );
    }

    return position;
  }
}

module.exports = RankingService;
