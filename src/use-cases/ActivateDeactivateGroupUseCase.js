/**
 * Activate/Deactivate Group Use Case
 * Cambiar estado de grupo (ACTIVO/INACTIVO)
 */

const { NotFoundError, ValidationError } = require('../utils/errors');

class ActivateDeactivateGroupUseCase {
  /**
   * @param {Object} groupRepository - Repositorio de grupos
   */
  constructor(groupRepository) {
    this.groupRepository = groupRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} grupoId - ID del grupo
   * @param {string} estado - Nuevo estado (ACTIVO/INACTIVO)
   * @returns {Promise<Object>} Grupo actualizado
   */
  async execute(grupoId, estado) {
    // Verificar que el grupo existe
    const existingGroup = await this.groupRepository.findById(grupoId);

    if (!existingGroup) {
      throw new NotFoundError('Grupo no encontrado');
    }

    // Validar estado
    const validEstados = ['ACTIVO', 'INACTIVO'];
    if (!validEstados.includes(estado)) {
      throw new ValidationError('Estado debe ser: ACTIVO o INACTIVO');
    }

    // Actualizar estado
    const updatedGroup = await this.groupRepository.update(grupoId, {
      estado,
    });

    return updatedGroup;
  }
}

module.exports = ActivateDeactivateGroupUseCase;
