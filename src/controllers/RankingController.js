/**
 * Ranking Controller
 * Maneja las peticiones HTTP relacionadas con rankings
 */

const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class RankingController {
  /**
   * @param {Object} getGroupRankingUseCase - Caso de uso para obtener ranking de grupo
   * @param {Object} getStudentPositionUseCase - Caso de uso para obtener posición de estudiante
   */
  constructor(getGroupRankingUseCase, getStudentPositionUseCase) {
    this.getGroupRankingUseCase = getGroupRankingUseCase;
    this.getStudentPositionUseCase = getStudentPositionUseCase;
  }

  /**
   * GET /api/rankings/group/:grupoId
   * Obtener ranking de un grupo
   */
  getGroupRanking = asyncHandler(async (req, res) => {
    const grupoId = req.params.grupoId ? parseInt(req.params.grupoId, 10) : null;
    const evaluacionId = req.query.evaluacionId ? parseInt(req.query.evaluacionId, 10) : null;

    const ranking = await this.getGroupRankingUseCase.execute(grupoId, evaluacionId);

    return res
      .status(200)
      .json(successResponse(ranking, 'Ranking del grupo obtenido exitosamente'));
  });

  /**
   * GET /api/rankings/student/:estudianteId
   * Obtener posición de un estudiante en el ranking
   */
  getStudentPosition = asyncHandler(async (req, res) => {
    const estudianteId = parseInt(req.params.estudianteId, 10);
    const grupoId = req.query.grupoId ? parseInt(req.query.grupoId, 10) : null;
    const evaluacionId = req.query.evaluacionId ? parseInt(req.query.evaluacionId, 10) : null;

    const position = await this.getStudentPositionUseCase.execute(
      estudianteId,
      grupoId,
      evaluacionId
    );

    return res
      .status(200)
      .json(successResponse(position, 'Posición del estudiante obtenida exitosamente'));
  });
}

module.exports = RankingController;
