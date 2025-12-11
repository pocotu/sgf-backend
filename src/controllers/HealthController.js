/**
 * Health Check Controller
 * Proporciona endpoints para monitoreo de salud del sistema
 */

const logger = require('../config/logger');

class HealthController {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Health check básico
   * GET /health
   */
  async getHealth(req, res) {
    try {
      const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: require('../../package.json').version,
        uptime: process.uptime(),
      };

      logger.info('Health check requested', { ip: req.ip });
      return res.status(200).json(health);
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      return res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }

  /**
   * Health check detallado con verificación de dependencias
   * GET /api/health
   */
  async getDetailedHealth(req, res) {
    const startTime = Date.now();
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: require('../../package.json').version,
      uptime: process.uptime(),
      checks: {},
    };

    try {
      // Check 1: Database connectivity
      const dbStartTime = Date.now();
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        health.checks.database = {
          status: 'OK',
          responseTime: `${Date.now() - dbStartTime}ms`,
        };
      } catch (dbError) {
        health.checks.database = {
          status: 'ERROR',
          error: dbError.message,
          responseTime: `${Date.now() - dbStartTime}ms`,
        };
        health.status = 'DEGRADED';
      }

      // Check 2: Memory usage
      const memUsage = process.memoryUsage();
      health.checks.memory = {
        status: 'OK',
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      };

      // Check 3: Process info
      health.checks.process = {
        status: 'OK',
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
      };

      // Calcular tiempo total de respuesta
      health.responseTime = `${Date.now() - startTime}ms`;

      // Determinar status code según el estado
      const statusCode = health.status === 'OK' ? 200 : 503;

      logger.info('Detailed health check requested', {
        ip: req.ip,
        status: health.status,
        responseTime: health.responseTime,
      });

      return res.status(statusCode).json(health);
    } catch (error) {
      logger.error('Detailed health check failed', { error: error.message });
      return res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: `${Date.now() - startTime}ms`,
      });
    }
  }

  /**
   * Readiness check - verifica si el servicio está listo para recibir tráfico
   * GET /api/health/ready
   */
  async getReadiness(req, res) {
    try {
      // Verificar conexión a base de datos
      await this.prisma.$queryRaw`SELECT 1`;

      logger.debug('Readiness check passed', { ip: req.ip });
      return res.status(200).json({
        status: 'READY',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn('Readiness check failed', { error: error.message });
      return res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }

  /**
   * Liveness check - verifica si el servicio está vivo
   * GET /api/health/live
   */
  async getLiveness(req, res) {
    // Simple check que el proceso está respondiendo
    logger.debug('Liveness check passed', { ip: req.ip });
    return res.status(200).json({
      status: 'ALIVE',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}

module.exports = HealthController;
