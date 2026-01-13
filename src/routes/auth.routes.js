/**
 * Authentication Routes
 * Define las rutas para autenticación
 */

const express = require('express');
const router = express.Router();

/**
 * Configurar rutas de autenticación
 * @param {Object} authController - Controlador de autenticación
 * @param {Object} authService - Servicio de autenticación (para middleware)
 * @returns {Router} Router configurado
 */
const configureAuthRoutes = (authController, authService) => {
  const { authenticateJWT } = require('../middleware/auth');

  /**
   * POST /api/auth/login
   * Login con DNI o correo electrónico
   * Body: { identifier, password }
   */
  router.post('/login', authController.login);

  /**
   * POST /api/auth/change-password-first-login
   * Cambiar contraseña en primer login
   * Requiere tempToken en Authorization header
   * Body: { newPassword }
   */
  router.post(
    '/change-password-first-login',
    authenticateJWT(authService),
    authController.changePasswordFirstLogin
  );

  /**
   * POST /api/auth/refresh-token
   * Renovar token usando refresh token
   * Body: { refreshToken }
   */
  router.post('/refresh-token', authController.refreshToken);

  /**
   * POST /api/auth/register
   * Registrar nuevo usuario
   * Body: { dni, nombres, apellidos, correo, telefono, rol }
   */
  router.post('/register', authController.register);

  return router;
};

module.exports = configureAuthRoutes;
