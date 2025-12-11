/**
 * Utilidades para respuestas API consistentes
 */

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
    data,
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

  return successResponse(
    data,
    message,
    {
      page,
      limit,
      total,
      totalPages,
    },
  );
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
