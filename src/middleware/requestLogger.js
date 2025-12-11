/**
 * Middleware de logging de requests HTTP
 * Registra todas las peticiones HTTP con información detallada
 */

const logger = require('../config/logger');

/**
 * Middleware para registrar requests HTTP
 * Captura método, URL, status code, tiempo de respuesta, etc.
 */
const requestLogger = (req, res, next) => {
  // Capturar tiempo de inicio
  const startTime = Date.now();

  // Capturar el método original res.json para interceptar la respuesta
  const originalJson = res.json.bind(res);

  // Sobrescribir res.json para capturar cuando se envía la respuesta
  res.json = function (body) {
    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // Log del request
    logger.logRequest(req, res, responseTime);

    // Llamar al método original
    return originalJson(body);
  };

  // Capturar el método original res.send para interceptar respuestas no-JSON
  const originalSend = res.send.bind(res);

  res.send = function (body) {
    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // Log del request
    logger.logRequest(req, res, responseTime);

    // Llamar al método original
    return originalSend(body);
  };

  next();
};

module.exports = requestLogger;
