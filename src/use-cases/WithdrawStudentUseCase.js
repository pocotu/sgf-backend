/**
 * Withdraw Student Use Case
 * Retirar estudiante de un grupo (cambiar estado a RETIRADO)
 */

const { NotFoundError } = require('../utils/errors');

class WithdrawStudentUseCase {
  /**
   * @param {Object} enrollmentRepository - Repositorio de matrículas
   * @param {Object} enrollmentService - Servicio de matrículas
   */
  constructor(enrollmentRepository, enrollmentService) {
    this.enrollmentRepository = enrollmentRepository;
    this.enrollmentService = enrollmentService;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} matriculaId - ID de la matrícula
   * @param {string} motivoRetiro - Motivo del retiro
   * @returns {Promise<Object>} Matrícula actualizada
   */
  async execute(matriculaId, motivoRetiro) {
    // Validar motivo de retiro
    this.enrollmentService.validateWithdrawalReason(motivoRetiro);

    // Verificar que la matrícula existe
    const enrollment = await this.enrollmentRepository.findByIdWithRelations(
      matriculaId
    );

    if (!enrollment) {
      throw new NotFoundError('Matrícula no encontrada');
    }

    // Retirar estudiante
    const updatedEnrollment = await this.enrollmentRepository.withdraw(
      matriculaId,
      motivoRetiro.trim()
    );

    // Obtener matrícula actualizada con relaciones
    const enrollmentWithRelations = await this.enrollmentRepository.findByIdWithRelations(
      updatedEnrollment.matriculaId
    );

    return enrollmentWithRelations;
  }
}

module.exports = WithdrawStudentUseCase;
