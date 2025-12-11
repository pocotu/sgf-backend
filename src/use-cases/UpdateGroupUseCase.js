/**
 * Update Group Use Case
 * Actualizar grupo con validaciones
 */

const { NotFoundError } = require('../utils/errors');

class UpdateGroupUseCase {
  /**
   * @param {Object} groupRepository - Repositorio de grupos
   * @param {Object} groupService - Servicio de grupos
   */
  constructor(groupRepository, groupService) {
    this.groupRepository = groupRepository;
    this.groupService = groupService;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} grupoId - ID del grupo
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Grupo actualizado
   */
  async execute(grupoId, updateData) {
    // Verificar que el grupo existe
    const existingGroup = await this.groupRepository.findById(grupoId);

    if (!existingGroup) {
      throw new NotFoundError('Grupo no encontrado');
    }

    // Validar datos de actualización
    this.groupService.validateGroupData(updateData, true);

    // Si se actualiza área, modalidad o nombreGrupo, validar unicidad
    if (
      updateData.area ||
      updateData.modalidad ||
      updateData.nombreGrupo
    ) {
      const area = updateData.area || existingGroup.area;
      const modalidad = updateData.modalidad || existingGroup.modalidad;
      const nombreGrupo = updateData.nombreGrupo || existingGroup.nombreGrupo;

      await this.groupService.validateUniqueCombination(
        area,
        modalidad,
        nombreGrupo,
        grupoId
      );
    }

    // Preparar datos para actualizar
    const dataToUpdate = {};

    if (updateData.area) {
      dataToUpdate.area = updateData.area;
    }

    if (updateData.modalidad) {
      dataToUpdate.modalidad = updateData.modalidad;
    }

    if (updateData.nombreGrupo) {
      dataToUpdate.nombreGrupo = updateData.nombreGrupo.trim();
    }

    if (updateData.dias) {
      dataToUpdate.dias = updateData.dias.trim();
    }

    if (updateData.horaInicio) {
      dataToUpdate.horaInicio = new Date(
        `1970-01-01T${updateData.horaInicio}:00`
      );
    }

    if (updateData.horaFin) {
      dataToUpdate.horaFin = new Date(`1970-01-01T${updateData.horaFin}:00`);
    }

    if (updateData.capacidad !== undefined) {
      dataToUpdate.capacidad = parseInt(updateData.capacidad, 10);
    }

    // Actualizar grupo
    const updatedGroup = await this.groupRepository.update(
      grupoId,
      dataToUpdate
    );

    return updatedGroup;
  }
}

module.exports = UpdateGroupUseCase;
