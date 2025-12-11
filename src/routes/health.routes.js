/**
 * Health Check Routes
 * Rutas para monitoreo de salud del sistema
 */

const express = require('express');

/**
 * Configura las rutas de health check
 * @param {HealthController} healthController - Controlador de health check
 * @returns {express.Router} Router configurado
 */
const configureHealthRoutes = healthController => {
  const router = express.Router();

  // GET /api/health - Health check detallado
  router.get('/', (req, res) => healthController.getDetailedHealth(req, res));

  // GET /api/health/ready - Readiness check
  router.get('/ready', (req, res) => healthController.getReadiness(req, res));

  // GET /api/health/live - Liveness check
  router.get('/live', (req, res) => healthController.getLiveness(req, res));

  return router;
};

module.exports = configureHealthRoutes;
