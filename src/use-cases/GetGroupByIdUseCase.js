/**
 * Get Group By Id Use Case
 * Obtener grupo por ID con cupos disponibles
 */

const { NotFoundError } = require('../utils/errors');

class GetGroupByIdUseCase {
  /**
   * @param {Object} groupRepository - Repositorio de grupos
   */
  constructor(groupRepository) {
    this.groupRepository = groupRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} grupoId - ID del grupo
   * @returns {Promise<Object>} Grupo con cupos disponibles
   */
  async execute(grupoId) {
    const group = await this.groupRepository.findWithEnrollmentCount(grupoId);

    if (!group) {
      throw new NotFoundError('Grupo no encontrado');
    }

    return group;
  }
}

module.exports = GetGroupByIdUseCase;
