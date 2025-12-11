/**
 * Authentication Service
 * Maneja la lógica de autenticación, generación de tokens y cambio de contraseña
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthError, ValidationError } = require('../utils/errors');
const { isValidPassword } = require('../utils/validators');

class AuthService {
  /**
   * @param {Object} userRepository - Repositorio de usuarios
   * @param {Object} jwtConfig - Configuración JWT
   */
  constructor(userRepository, jwtConfig) {
    this.userRepository = userRepository;
    this.jwtConfig = jwtConfig;
  }

  /**
   * Autenticar usuario con DNI o correo electrónico
   * @param {string} identifier - DNI (8 dígitos) o correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Token y datos del usuario
   */
  async login(identifier, password) {
    // Validar que se proporcionen credenciales
    if (!identifier || !password) {
      throw new AuthError(
        'Debe proporcionar DNI/correo y contraseña',
        'AUTH_INVALID_CREDENTIALS'
      );
    }

    // Buscar usuario por DNI o correo
    const user = await this.userRepository.findByIdentifier(identifier);

    if (!user) {
      throw new AuthError(
        'Credenciales inválidas',
        'AUTH_INVALID_CREDENTIALS'
      );
    }

    // Verificar que el usuario esté activo
    if (user.estado !== 'activo') {
      throw new AuthError(
        'Usuario inactivo',
        'AUTH_USER_INACTIVE'
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.contrasenaHash);

    if (!isPasswordValid) {
      throw new AuthError(
        'Credenciales inválidas',
        'AUTH_INVALID_CREDENTIALS'
      );
    }

    // Si requiere cambio de contraseña, retornar tempToken
    if (user.requiereCambioPassword) {
      const tempToken = this.generateToken(user, true);
      return {
        requiresPasswordChange: true,
        tempToken,
        message: 'Debe cambiar su contraseña',
      };
    }

    // Generar tokens normales
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      token,
      refreshToken,
      user: {
        usuarioId: user.usuarioId,
        dni: user.dni,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: user.rol,
      },
    };
  }

  /**
   * Cambiar contraseña en primer login
   * @param {number} userId - ID del usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Token y datos del usuario
   */
  async changePasswordFirstLogin(userId, newPassword) {
    // Validar contraseña segura
    if (!isValidPassword(newPassword)) {
      throw new ValidationError(
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número'
      );
    }

    // Buscar usuario
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AuthError(
        'Usuario no encontrado',
        'AUTH_USER_NOT_FOUND'
      );
    }

    // Hash de la nueva contraseña
    const contrasenaHash = await bcrypt.hash(
      newPassword,
      parseInt(this.jwtConfig.bcryptSaltRounds, 10)
    );

    // Actualizar contraseña y marcar como no requiere cambio
    await this.userRepository.update(userId, {
      contrasenaHash,
      requiereCambioPassword: false,
    });

    // Generar tokens normales
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      token,
      refreshToken,
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Renovar token usando refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Nuevo token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AuthError(
        'Refresh token requerido',
        'AUTH_TOKEN_REQUIRED'
      );
    }

    try {
      // Verificar refresh token
      const decoded = jwt.verify(
        refreshToken,
        this.jwtConfig.refreshSecret
      );

      // Buscar usuario
      const user = await this.userRepository.findById(decoded.usuarioId);

      if (!user) {
        throw new AuthError(
          'Usuario no encontrado',
          'AUTH_USER_NOT_FOUND'
        );
      }

      if (user.estado !== 'activo') {
        throw new AuthError(
          'Usuario inactivo',
          'AUTH_USER_INACTIVE'
        );
      }

      // Generar nuevo token
      const token = this.generateToken(user);

      return { token };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthError(
          'Refresh token expirado',
          'AUTH_TOKEN_EXPIRED'
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AuthError(
          'Refresh token inválido',
          'AUTH_TOKEN_INVALID'
        );
      }
      throw error;
    }
  }

  /**
   * Generar JWT token
   * @param {Object} user - Usuario
   * @param {boolean} isTemp - Si es token temporal
   * @returns {string} JWT token
   */
  generateToken(user, isTemp = false) {
    const payload = {
      usuarioId: user.usuarioId,
      dni: user.dni,
      rol: user.rol,
    };

    const expiresIn = isTemp ? '15m' : this.jwtConfig.expiresIn;

    return jwt.sign(payload, this.jwtConfig.secret, { expiresIn });
  }

  /**
   * Generar refresh token
   * @param {Object} user - Usuario
   * @returns {string} Refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      usuarioId: user.usuarioId,
      dni: user.dni,
    };

    return jwt.sign(
      payload,
      this.jwtConfig.refreshSecret,
      { expiresIn: this.jwtConfig.refreshExpiresIn }
    );
  }

  /**
   * Verificar token JWT
   * @param {string} token - Token a verificar
   * @returns {Object} Payload decodificado
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtConfig.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthError(
          'Token expirado',
          'AUTH_TOKEN_EXPIRED'
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AuthError(
          'Token inválido',
          'AUTH_TOKEN_INVALID'
        );
      }
      throw error;
    }
  }
}

module.exports = AuthService;
