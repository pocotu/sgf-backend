/**
 * Create Group Use Case
 * Crear grupo con validación de horarios y unicidad
 */

class CreateGroupUseCase {
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
   * @param {Object} groupData - Datos del grupo
   * @returns {Promise<Object>} Grupo creado
   */
  async execute(groupData) {
    // Validar datos del grupo
    this.groupService.validateGroupData(groupData);

    // Validar unicidad de combinación área-modalidad-nombreGrupo
    await this.groupService.validateUniqueCombination(
      groupData.area,
      groupData.modalidad,
      groupData.nombreGrupo
    );

    // Preparar datos para crear grupo
    const groupToCreate = {
      area: groupData.area,
      modalidad: groupData.modalidad,
      nombreGrupo: groupData.nombreGrupo.trim(),
      dias: groupData.dias.trim(),
      horaInicio: new Date(`1970-01-01T${groupData.horaInicio}:00`),
      horaFin: new Date(`1970-01-01T${groupData.horaFin}:00`),
      capacidad: groupData.capacidad || 30,
      estado: 'ACTIVO',
    };

    // Crear grupo
    const group = await this.groupRepository.create(groupToCreate);

    return group;
  }
}

module.exports = CreateGroupUseCase;
