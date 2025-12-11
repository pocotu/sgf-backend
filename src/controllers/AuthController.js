/**
 * Authentication Controller
 * Maneja las peticiones HTTP relacionadas con autenticación
 */

const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
  /**
   * @param {Object} authService - Servicio de autenticación
   */
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * POST /api/auth/login
   * Autenticar usuario con DNI o correo
   */
  login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    const result = await this.authService.login(identifier, password);

    // Si requiere cambio de contraseña
    if (result.requiresPasswordChange) {
      return res.status(200).json({
        success: true,
        requiresPasswordChange: true,
        tempToken: result.tempToken,
        message: result.message,
      });
    }

    // Login normal exitoso
    return res.status(200).json(
      successResponse(
        {
          token: result.token,
          refreshToken: result.refreshToken,
          user: result.user,
        },
        'Login exitoso'
      )
    );
  });

  /**
   * POST /api/auth/change-password-first-login
   * Cambiar contraseña en primer login
   */
  changePasswordFirstLogin = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.usuarioId;

    const result = await this.authService.changePasswordFirstLogin(
      userId,
      newPassword
    );

    return res.status(200).json(
      successResponse(
        {
          token: result.token,
          refreshToken: result.refreshToken,
        },
        result.message
      )
    );
  });

  /**
   * POST /api/auth/refresh-token
   * Renovar token usando refresh token
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await this.authService.refreshToken(refreshToken);

    return res.status(200).json(
      successResponse(
        { token: result.token },
        'Token renovado exitosamente'
      )
    );
  });
}

module.exports = AuthController;
