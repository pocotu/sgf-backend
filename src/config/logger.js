/**
 * Winston Logger Configuration
 * Configura logging estructurado con niveles separados por archivo
 */

const winston = require('winston');
const path = require('path');

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Agregar colores a Winston
winston.addColors(colors);

// Determinar el nivel de log según el entorno
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Formato para logs en consola (desarrollo)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => {
    const { timestamp, level: logLevel, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${logLevel}: ${message} ${metaString}`;
  })
);

// Formato para logs en archivo (producción)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');

// Configurar transports
const transports = [];

// En desarrollo, log a consola
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// En producción, log a archivos
if (process.env.NODE_ENV === 'production') {
  // Log de todos los niveles
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Log solo de errores
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Log de warnings
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'warn.log'),
      level: 'warn',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // También log a consola en producción (para Docker/PM2)
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.simple()),
    })
  );
}

// En test, no hacer log (o solo errores)
if (process.env.NODE_ENV === 'test') {
  transports.length = 0; // Limpiar transports
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'test.log'),
      level: 'error',
      format: fileFormat,
    })
  );
}

// Crear logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

/**
 * Helper para log de requests HTTP
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {number} responseTime - Tiempo de respuesta en ms
 */
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };

  // Incluir usuario si está autenticado
  if (req.user) {
    logData.userId = req.user.usuarioId;
    logData.userRole = req.user.rol;
  }

  // Determinar nivel según status code
  if (res.statusCode >= 500) {
    logger.error('HTTP Request', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

/**
 * Helper para log de errores con contexto
 * @param {Error} error - Error object
 * @param {Object} context - Contexto adicional
 */
logger.logError = (error, context = {}) => {
  const errorLog = {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    ...context,
  };

  logger.error('Application Error', errorLog);
};

module.exports = logger;
