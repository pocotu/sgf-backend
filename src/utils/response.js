/**
 * Utilidades para respuestas API consistentes
 * Implementa formato estándar según Requirement 14
 */

const { serializeDates } = require('./serializers');

/**
 * Serializar datos recursivamente
 * @param {*} data - Datos a serializar
 * @returns {*} Datos serializados
 */
// eslint-disable-next-line complexity
const serializeData = data => {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }

  if (typeof data === 'object' && data !== null && !(data instanceof Date)) {
    const serialized = serializeDates(data);

    // Recursively serialize nested objects
    const result = {};
    for (const key in serialized) {
      if (Object.prototype.hasOwnProperty.call(serialized, key)) {
        const value = serialized[key];
        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
          result[key] = serializeData(value);
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }

  return data;
};

/**
 * Respuesta exitosa
 * @param {Object} data - Datos a retornar
 * @param {string} message - Mensaje opcional
 * @param {Object} pagination - Información de paginación opcional
 * @returns {Object} Respuesta formateada
 */
const successResponse = (data, message = null, pagination = null) => {
  const response = {
    success: true,
    data: serializeData(data),
  };

  if (message) {
    response.message = message;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

/**
 * Respuesta de error
 * @param {string} code - Código de error
 * @param {string} message - Mensaje de error
 * @param {Object} details - Detalles adicionales opcionales
 * @returns {Object} Respuesta de error formateada
 */
const errorResponse = (code, message, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return response;
};

/**
 * Respuesta paginada
 * @param {Object} options - Opciones de paginación
 * @param {Array} options.data - Datos a retornar
 * @param {number} options.page - Página actual
 * @param {number} options.limit - Límite por página
 * @param {number} options.total - Total de registros
 * @param {string} options.message - Mensaje opcional
 * @returns {Object} Respuesta con paginación
 */
const paginatedResponse = ({ data, page, limit, total, message = null }) => {
  const totalPages = Math.ceil(total / limit);

  return successResponse(data, message, {
    page: Number(page),
    limit: Number(limit),
    total: Number(total),
    totalPages,
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  serializeData,
};
