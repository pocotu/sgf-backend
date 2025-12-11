/**
 * Group Service
 * Maneja la lógica de negocio para gestión de grupos
 */

const { ValidationError, BusinessLogicError } = require('../utils/errors');

class GroupService {
  /**
   * @param {Object} groupRepository - Repositorio de grupos
   */
  constructor(groupRepository) {
    this.groupRepository = groupRepository;
  }

  /**
   * Validar datos de grupo
   * @param {Object} groupData - Datos del grupo
   * @param {boolean} isUpdate - Si es actualización
   */
  validateGroupData(groupData, isUpdate = false) {
    const errors = {};

    // Validar área (requerido en creación)
    if (!isUpdate && !groupData.area) {
      errors.area = 'Área académica es requerida';
    } else if (groupData.area) {
      const validAreas = ['A', 'B', 'C', 'D'];
      if (!validAreas.includes(groupData.area)) {
        errors.area = 'Área debe ser: A, B, C o D';
      }
    }

    // Validar modalidad (requerido en creación)
    if (!isUpdate && !groupData.modalidad) {
      errors.modalidad = 'Modalidad es requerida';
    } else if (groupData.modalidad) {
      const validModalidades = ['ORDINARIO', 'PRIMERA_OPCION', 'DIRIMENCIA'];
      if (!validModalidades.includes(groupData.modalidad)) {
        errors.modalidad =
          'Modalidad debe ser: ORDINARIO, PRIMERA_OPCION o DIRIMENCIA';
      }
    }

    // Validar nombre de grupo (requerido en creación)
    if (!isUpdate && !groupData.nombreGrupo) {
      errors.nombreGrupo = 'Nombre del grupo es requerido';
    } else if (
      groupData.nombreGrupo &&
      groupData.nombreGrupo.trim().length === 0
    ) {
      errors.nombreGrupo = 'Nombre del grupo no puede estar vacío';
    }

    // Validar días (requerido en creación)
    if (!isUpdate && !groupData.dias) {
      errors.dias = 'Días de clase son requeridos';
    }

    // Validar horarios (requeridos en creación)
    if (!isUpdate && !groupData.horaInicio) {
      errors.horaInicio = 'Hora de inicio es requerida';
    }

    if (!isUpdate && !groupData.horaFin) {
      errors.horaFin = 'Hora de fin es requerida';
    }

    // Validar formato de horas (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (groupData.horaInicio && !timeRegex.test(groupData.horaInicio)) {
      errors.horaInicio = 'Hora de inicio debe tener formato HH:mm';
    }

    if (groupData.horaFin && !timeRegex.test(groupData.horaFin)) {
      errors.horaFin = 'Hora de fin debe tener formato HH:mm';
    }

    // Validar que horaFin > horaInicio
    if (
      groupData.horaInicio &&
      groupData.horaFin &&
      timeRegex.test(groupData.horaInicio) &&
      timeRegex.test(groupData.horaFin)
    ) {
      if (!this.groupRepository.validateSchedule(
        groupData.horaInicio,
        groupData.horaFin
      )) {
        errors.horaFin = 'Hora de fin debe ser mayor que hora de inicio';
      }
    }

    // Validar capacidad
    if (groupData.capacidad !== undefined) {
      const capacidad = parseInt(groupData.capacidad, 10);
      if (isNaN(capacidad) || capacidad <= 0) {
        errors.capacidad = 'Capacidad debe ser un número mayor a 0';
      }
    }

    // Validar estado si se proporciona
    if (groupData.estado) {
      const validEstados = ['ACTIVO', 'INACTIVO'];
      if (!validEstados.includes(groupData.estado)) {
        errors.estado = 'Estado debe ser: ACTIVO o INACTIVO';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Errores de validación', errors);
    }
  }

  /**
   * Validar unicidad de combinación área-modalidad-nombreGrupo
   * @param {string} area - Área académica
   * @param {string} modalidad - Modalidad
   * @param {string} nombreGrupo - Nombre del grupo
   * @param {number} excludeId - ID a excluir (para actualizaciones)
   */
  async validateUniqueCombination(area, modalidad, nombreGrupo, excludeId) {
    const exists = await this.groupRepository.existsUniqueCombination(
      area,
      modalidad,
      nombreGrupo,
      excludeId
    );

    if (exists) {
      throw new BusinessLogicError(
        'Ya existe un grupo con la misma área, modalidad y nombre',
        'GROUP_DUPLICATE_COMBINATION'
      );
    }
  }
}

module.exports = GroupService;
