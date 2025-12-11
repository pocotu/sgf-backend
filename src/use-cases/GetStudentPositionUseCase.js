/**
 * Get Student Position Use Case
 * Obtener posición de un estudiante en el ranking con cálculo de diferencia con primer lugar
 */

const { BusinessLogicError } = require('../utils/errors');

class GetStudentPositionUseCase {
  /**
   * @param {Object} rankingService - Servicio de rankings
   * @param {Object} studentRepository - Repositorio de estudiantes
   */
  constructor(rankingService, studentRepository) {
    this.rankingService = rankingService;
    this.studentRepository = studentRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} estudianteId - ID del estudiante
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object>} Posición del estudiante en el ranking
   */
  async execute(estudianteId, evaluacionId = null) {
    // Validar que el estudiante existe
    const estudiante = await this.studentRepository.findById(estudianteId);

    if (!estudiante) {
      throw new BusinessLogicError('El estudiante especificado no existe', 'STUDENT_NOT_FOUND');
    }

    // Obtener posición del estudiante
    const position = await this.rankingService.getStudentPosition(estudianteId, evaluacionId);

    if (!position) {
      throw new BusinessLogicError(
        'El estudiante no tiene matrícula activa o no tiene notas registradas',
        'STUDENT_NO_ACTIVE_ENROLLMENT'
      );
    }

    return position;
  }
}

module.exports = GetStudentPositionUseCase;
