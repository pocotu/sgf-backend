/**
 * Evaluation Service
 * Maneja la lógica de negocio para gestión de evaluaciones
 */

const { ValidationError, BusinessLogicError } = require('../utils/errors');

class EvaluationService {
  /**
   * @param {Object} evaluationRepository - Repositorio de evaluaciones
   * @param {Object} groupRepository - Repositorio de grupos
   */
  constructor(evaluationRepository, groupRepository) {
    this.evaluationRepository = evaluationRepository;
    this.groupRepository = groupRepository;
  }

  /**
   * Validar datos de evaluación
   * @param {Object} evaluationData - Datos de la evaluación
   * @param {boolean} isUpdate - Si es actualización
   */
  validateEvaluationData(evaluationData, isUpdate = false) {
    const errors = {};

    // Validar grupoId (requerido en creación)
    if (!isUpdate && !evaluationData.grupoId) {
      errors.grupoId = 'ID del grupo es requerido';
    } else if (evaluationData.grupoId) {
      const grupoId = parseInt(evaluationData.grupoId, 10);
      if (isNaN(grupoId) || grupoId <= 0) {
        errors.grupoId = 'ID del grupo debe ser un número válido';
      }
    }

    // Validar numeroSemana (requerido en creación)
    if (!isUpdate && evaluationData.numeroSemana === undefined) {
      errors.numeroSemana = 'Número de semana es requerido';
    } else if (evaluationData.numeroSemana !== undefined) {
      if (!this.evaluationRepository.validateWeekNumber(evaluationData.numeroSemana)) {
        errors.numeroSemana = 'Número de semana debe estar entre 1 y 52';
      }
    }

    // Validar fechaEvaluacion (requerido en creación)
    if (!isUpdate && !evaluationData.fechaEvaluacion) {
      errors.fechaEvaluacion = 'Fecha de evaluación es requerida';
    } else if (evaluationData.fechaEvaluacion) {
      const fecha = new Date(evaluationData.fechaEvaluacion);
      if (isNaN(fecha.getTime())) {
        errors.fechaEvaluacion = 'Fecha de evaluación debe ser válida (formato ISO 8601)';
      }
    }

    // Validar duracionMinutos si se proporciona
    if (evaluationData.duracionMinutos !== undefined) {
      const duracion = parseInt(evaluationData.duracionMinutos, 10);
      if (isNaN(duracion) || duracion <= 0) {
        errors.duracionMinutos = 'Duración debe ser un número mayor a 0';
      }
    }

    // Validar estado si se proporciona
    if (evaluationData.estado) {
      const validEstados = ['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];
      if (!validEstados.includes(evaluationData.estado)) {
        errors.estado = 'Estado debe ser: PROGRAMADA, EN_CURSO, FINALIZADA o CANCELADA';
      }
    }

    // Validar descripción si se proporciona
    if (evaluationData.descripcion && evaluationData.descripcion.length > 200) {
      errors.descripcion = 'Descripción no puede exceder 200 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Errores de validación', errors);
    }
  }

  /**
   * Validar que el grupo existe
   * @param {number} grupoId - ID del grupo
   */
  async validateGroupExists(grupoId) {
    const grupo = await this.groupRepository.findById(grupoId);
    if (!grupo) {
      throw new BusinessLogicError('El grupo especificado no existe', 'GROUP_NOT_FOUND');
    }
    return grupo;
  }

  /**
   * Validar transición de estado
   * @param {string} currentEstado - Estado actual
   * @param {string} newEstado - Nuevo estado
   */
  validateStateTransition(currentEstado, newEstado) {
    const validTransitions = {
      PROGRAMADA: ['EN_CURSO', 'CANCELADA'],
      EN_CURSO: ['FINALIZADA', 'CANCELADA'],
      FINALIZADA: [],
      CANCELADA: [],
    };

    const allowedStates = validTransitions[currentEstado] || [];

    if (!allowedStates.includes(newEstado)) {
      throw new BusinessLogicError(
        `No se puede cambiar de estado ${currentEstado} a ${newEstado}`,
        'INVALID_STATE_TRANSITION'
      );
    }
  }
}

module.exports = EvaluationService;
