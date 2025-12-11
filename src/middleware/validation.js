/**
 * Middleware de validación centralizada
 * Valida datos de entrada según esquemas definidos
 */

const { ValidationError } = require('../utils/errors');
const {
  isValidDni,
  isValidEmail,
  isValidDate,
  isValidTime,
  isValidPassword,
  isValidGrade,
  isValidWeekNumber,
  isValidArea,
  isValidModalidad,
  isValidRole,
  isTimeAfter,
} = require('../utils/validators');

/**
 * Tipos de validación disponibles
 */
const VALIDATION_TYPES = {
  DNI: 'dni',
  EMAIL: 'email',
  DATE: 'date',
  TIME: 'time',
  PASSWORD: 'password',
  GRADE: 'grade',
  WEEK_NUMBER: 'weekNumber',
  AREA: 'area',
  MODALIDAD: 'modalidad',
  ROLE: 'role',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object',
};

/**
 * Mensajes de error por tipo de validación
 */
const ERROR_MESSAGES = {
  required: campo => `${campo} es requerido`,
  dni: 'DNI debe tener exactamente 8 dígitos numéricos',
  email: 'Formato de correo electrónico inválido',
  date: 'Fecha debe estar en formato ISO 8601 (YYYY-MM-DD)',
  time: 'Hora debe estar en formato HH:mm (24 horas)',
  password: 'Contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número',
  grade: 'Nota debe estar en el rango 0-20',
  weekNumber: 'Número de semana debe estar entre 1 y 52',
  area: 'Área debe ser: A, B, C o D',
  modalidad: 'Modalidad debe ser: ORDINARIO, PRIMERA_OPCION o DIRIMENCIA',
  role: 'Rol debe ser: admin, docente o estudiante',
  string: campo => `${campo} debe ser una cadena de texto`,
  number: campo => `${campo} debe ser un número`,
  boolean: campo => `${campo} debe ser un valor booleano`,
  array: campo => `${campo} debe ser un arreglo`,
  object: campo => `${campo} debe ser un objeto`,
  minLength: (campo, min) => `${campo} debe tener al menos ${min} caracteres`,
  maxLength: (campo, max) => `${campo} debe tener máximo ${max} caracteres`,
  min: (campo, min) => `${campo} debe ser mayor o igual a ${min}`,
  max: (campo, max) => `${campo} debe ser menor o igual a ${max}`,
  custom: mensaje => mensaje,
};

/**
 * Validar un campo según su tipo
 * @param {*} value - Valor a validar
 * @param {string} type - Tipo de validación
 * @returns {boolean} True si es válido
 */
const validateType = (value, type) => {
  switch (type) {
    case VALIDATION_TYPES.DNI:
      return isValidDni(value);
    case VALIDATION_TYPES.EMAIL:
      return isValidEmail(value);
    case VALIDATION_TYPES.DATE:
      return isValidDate(value);
    case VALIDATION_TYPES.TIME:
      return isValidTime(value);
    case VALIDATION_TYPES.PASSWORD:
      return isValidPassword(value);
    case VALIDATION_TYPES.GRADE:
      return isValidGrade(value);
    case VALIDATION_TYPES.WEEK_NUMBER:
      return isValidWeekNumber(value);
    case VALIDATION_TYPES.AREA:
      return isValidArea(value);
    case VALIDATION_TYPES.MODALIDAD:
      return isValidModalidad(value);
    case VALIDATION_TYPES.ROLE:
      return isValidRole(value);
    case VALIDATION_TYPES.STRING:
      return typeof value === 'string';
    case VALIDATION_TYPES.NUMBER:
      return typeof value === 'number' && !isNaN(value);
    case VALIDATION_TYPES.BOOLEAN:
      return typeof value === 'boolean';
    case VALIDATION_TYPES.ARRAY:
      return Array.isArray(value);
    case VALIDATION_TYPES.OBJECT:
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return true;
  }
};

/**
 * Validar un campo según su esquema
 * @param {*} value - Valor a validar
 * @param {Object} fieldSchema - Esquema del campo
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null si es válido
 */
const validateField = (value, fieldSchema, fieldName) => {
  // Verificar si es requerido
  if (fieldSchema.required && (value === undefined || value === null || value === '')) {
    return ERROR_MESSAGES.required(fieldName);
  }

  // Si no es requerido y está vacío, no validar más
  if (!fieldSchema.required && (value === undefined || value === null || value === '')) {
    return null;
  }

  // Validar tipo
  if (fieldSchema.type && !validateType(value, fieldSchema.type)) {
    const errorKey = fieldSchema.type;
    const errorMsg = ERROR_MESSAGES[errorKey];
    return typeof errorMsg === 'function' ? errorMsg(fieldName) : errorMsg;
  }

  // Validar longitud mínima (para strings)
  if (fieldSchema.minLength && typeof value === 'string' && value.length < fieldSchema.minLength) {
    return ERROR_MESSAGES.minLength(fieldName, fieldSchema.minLength);
  }

  // Validar longitud máxima (para strings)
  if (fieldSchema.maxLength && typeof value === 'string' && value.length > fieldSchema.maxLength) {
    return ERROR_MESSAGES.maxLength(fieldName, fieldSchema.maxLength);
  }

  // Validar valor mínimo (para números)
  if (fieldSchema.min !== undefined && typeof value === 'number' && value < fieldSchema.min) {
    return ERROR_MESSAGES.min(fieldName, fieldSchema.min);
  }

  // Validar valor máximo (para números)
  if (fieldSchema.max !== undefined && typeof value === 'number' && value > fieldSchema.max) {
    return ERROR_MESSAGES.max(fieldName, fieldSchema.max);
  }

  // Validación personalizada
  if (fieldSchema.custom) {
    const customResult = fieldSchema.custom(value);
    if (customResult !== true) {
      return typeof customResult === 'string' ? customResult : ERROR_MESSAGES.custom(customResult);
    }
  }

  return null;
};

/**
 * Middleware de validación
 * @param {Object} schema - Esquema de validación
 * @returns {Function} Middleware de Express
 */
const validate = schema => {
  return (req, res, next) => {
    const errors = {};
    const data = req.body;

    // Validar cada campo del esquema
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = data[fieldName];
      const error = validateField(value, fieldSchema, fieldName);

      if (error) {
        errors[fieldName] = error;
      }
    }

    // Si hay errores, lanzar ValidationError
    if (Object.keys(errors).length > 0) {
      return next(new ValidationError('Errores de validación en los datos enviados', errors));
    }

    // Si todo es válido, continuar
    next();
  };
};

/**
 * Middleware para validar parámetros de query
 * @param {Object} schema - Esquema de validación
 * @returns {Function} Middleware de Express
 */
const validateQuery = schema => {
  return (req, res, next) => {
    const errors = {};
    const data = req.query;

    // Validar cada campo del esquema
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      let value = data[fieldName];

      // Convertir tipos si es necesario
      if (value !== undefined && value !== null && value !== '') {
        if (fieldSchema.type === VALIDATION_TYPES.NUMBER) {
          value = Number(value);
          if (isNaN(value)) {
            errors[fieldName] = ERROR_MESSAGES.number(fieldName);
            continue;
          }
        } else if (fieldSchema.type === VALIDATION_TYPES.BOOLEAN) {
          value = value === 'true' || value === '1';
        }
      }

      const error = validateField(value, fieldSchema, fieldName);

      if (error) {
        errors[fieldName] = error;
      }
    }

    // Si hay errores, lanzar ValidationError
    if (Object.keys(errors).length > 0) {
      return next(new ValidationError('Errores de validación en los parámetros', errors));
    }

    // Si todo es válido, continuar
    next();
  };
};

/**
 * Middleware para validar parámetros de ruta
 * @param {Object} schema - Esquema de validación
 * @returns {Function} Middleware de Express
 */
const validateParams = schema => {
  return (req, res, next) => {
    const errors = {};
    const data = req.params;

    // Validar cada campo del esquema
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      let value = data[fieldName];

      // Convertir tipos si es necesario
      if (value !== undefined && value !== null && value !== '') {
        if (fieldSchema.type === VALIDATION_TYPES.NUMBER) {
          value = Number(value);
          if (isNaN(value)) {
            errors[fieldName] = ERROR_MESSAGES.number(fieldName);
            continue;
          }
        }
      }

      const error = validateField(value, fieldSchema, fieldName);

      if (error) {
        errors[fieldName] = error;
      }
    }

    // Si hay errores, lanzar ValidationError
    if (Object.keys(errors).length > 0) {
      return next(new ValidationError('Errores de validación en los parámetros de ruta', errors));
    }

    // Si todo es válido, continuar
    next();
  };
};

/**
 * Validación personalizada para horarios
 * Valida que horaFin > horaInicio
 * @returns {Function} Middleware de Express
 */
const validateSchedule = () => {
  return (req, res, next) => {
    const { horaInicio, horaFin } = req.body;

    if (horaInicio && horaFin) {
      if (!isTimeAfter(horaInicio, horaFin)) {
        return next(
          new ValidationError('Error de validación en horario', {
            horaFin: 'Hora de fin debe ser mayor que hora de inicio',
          })
        );
      }
    }

    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  validateSchedule,
  VALIDATION_TYPES,
};
