/**
 * Unit Tests for AuthService
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = require('../../../src/services/AuthService');
const { AuthError, ValidationError } = require('../../../src/utils/errors');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService;
  let mockUserRepository;
  let jwtConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock UserRepository
    mockUserRepository = {
      findByIdentifier: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    // JWT Configuration
    jwtConfig = {
      secret: 'test_secret',
      refreshSecret: 'test_refresh_secret',
      expiresIn: '24h',
      refreshExpiresIn: '7d',
      bcryptSaltRounds: 10,
    };

    // Create AuthService instance
    authService = new AuthService(mockUserRepository, jwtConfig);
  });

  describe('login', () => {
    const mockUser = {
      usuarioId: 1,
      dni: '12345678',
      correo: 'test@example.com',
      nombres: 'Juan',
      apellidos: 'Pérez',
      rol: 'estudiante',
      estado: 'activo',
      contrasenaHash: 'hashed_password',
      requiereCambioPassword: false,
    };

    it('should login successfully with DNI', async () => {
      // Arrange
      mockUserRepository.findByIdentifier.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

      // Act
      const result = await authService.login('12345678', 'password123');

      // Assert
      expect(mockUserRepository.findByIdentifier).toHaveBeenCalledWith('12345678');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toHaveProperty('token', 'access_token');
      expect(result).toHaveProperty('refreshToken', 'refresh_token');
      expect(result.user).toEqual({
        usuarioId: 1,
        dni: '12345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        rol: 'estudiante',
      });
    });

    it('should login successfully with email', async () => {
      // Arrange
      mockUserRepository.findByIdentifier.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

      // Act
      const result = await authService.login('test@example.com', 'password123');

      // Assert
      expect(mockUserRepository.findByIdentifier).toHaveBeenCalledWith('test@example.com');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should return tempToken when password change is required', async () => {
      // Arrange
      const userRequiringChange = { ...mockUser, requiereCambioPassword: true };
      mockUserRepository.findByIdentifier.mockResolvedValue(userRequiringChange);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('temp_token');

      // Act
      const result = await authService.login('12345678', 'password123');

      // Assert
      expect(result).toHaveProperty('requiresPasswordChange', true);
      expect(result).toHaveProperty('tempToken', 'temp_token');
      expect(result).toHaveProperty('message', 'Debe cambiar su contraseña');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ usuarioId: 1, dni: '12345678', rol: 'estudiante' }),
        'test_secret',
        { expiresIn: '15m' }
      );
    });

    it('should throw AuthError for invalid credentials (user not found)', async () => {
      // Arrange
      mockUserRepository.findByIdentifier.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login('12345678', 'password123')).rejects.toThrow(AuthError);
      await expect(authService.login('12345678', 'password123')).rejects.toThrow(
        'Credenciales inválidas'
      );
    });

    it('should throw AuthError for invalid password', async () => {
      // Arrange
      mockUserRepository.findByIdentifier.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login('12345678', 'wrong_password')).rejects.toThrow(AuthError);
      await expect(authService.login('12345678', 'wrong_password')).rejects.toThrow(
        'Credenciales inválidas'
      );
    });

    it('should throw AuthError for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, estado: 'inactivo' };
      mockUserRepository.findByIdentifier.mockResolvedValue(inactiveUser);
      bcrypt.compare.mockResolvedValue(true);

      // Act & Assert
      await expect(authService.login('12345678', 'password123')).rejects.toThrow(AuthError);
      await expect(authService.login('12345678', 'password123')).rejects.toThrow(
        'Usuario inactivo'
      );
    });

    it('should throw AuthError when credentials are missing', async () => {
      // Act & Assert
      await expect(authService.login('', 'password123')).rejects.toThrow(AuthError);
      await expect(authService.login('12345678', '')).rejects.toThrow(AuthError);
    });
  });

  describe('changePasswordFirstLogin', () => {
    const mockUser = {
      usuarioId: 1,
      dni: '12345678',
      nombres: 'Juan',
      apellidos: 'Pérez',
      rol: 'estudiante',
    };

    it('should change password successfully with valid password', async () => {
      // Arrange
      const newPassword = 'NewPass123';
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ ...mockUser });
      bcrypt.hash.mockResolvedValue('new_hashed_password');
      jwt.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

      // Act
      const result = await authService.changePasswordFirstLogin(1, newPassword);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        contrasenaHash: 'new_hashed_password',
        requiereCambioPassword: false,
      });
      expect(result).toHaveProperty('token', 'access_token');
      expect(result).toHaveProperty('refreshToken', 'refresh_token');
      expect(result).toHaveProperty('message', 'Contraseña actualizada exitosamente');
    });

    it('should throw ValidationError for weak password (no uppercase)', async () => {
      // Arrange
      const weakPassword = 'password123';

      // Act & Assert
      await expect(authService.changePasswordFirstLogin(1, weakPassword)).rejects.toThrow(
        ValidationError
      );
      await expect(authService.changePasswordFirstLogin(1, weakPassword)).rejects.toThrow(
        'mínimo 8 caracteres, una mayúscula, una minúscula y un número'
      );
    });

    it('should throw ValidationError for weak password (no lowercase)', async () => {
      // Arrange
      const weakPassword = 'PASSWORD123';

      // Act & Assert
      await expect(authService.changePasswordFirstLogin(1, weakPassword)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for weak password (no number)', async () => {
      // Arrange
      const weakPassword = 'PasswordABC';

      // Act & Assert
      await expect(authService.changePasswordFirstLogin(1, weakPassword)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for weak password (too short)', async () => {
      // Arrange
      const weakPassword = 'Pass1';

      // Act & Assert
      await expect(authService.changePasswordFirstLogin(1, weakPassword)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw AuthError when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.changePasswordFirstLogin(999, 'NewPass123')).rejects.toThrow(
        AuthError
      );
      await expect(authService.changePasswordFirstLogin(999, 'NewPass123')).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('refreshToken', () => {
    const mockUser = {
      usuarioId: 1,
      dni: '12345678',
      rol: 'estudiante',
      estado: 'activo',
    };

    it('should refresh token successfully', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      jwt.verify.mockReturnValue({ usuarioId: 1, dni: '12345678' });
      mockUserRepository.findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('new_access_token');

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, 'test_refresh_secret');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('token', 'new_access_token');
    });

    it('should throw AuthError when refresh token is missing', async () => {
      // Act & Assert
      await expect(authService.refreshToken('')).rejects.toThrow(AuthError);
      await expect(authService.refreshToken('')).rejects.toThrow('Refresh token requerido');
    });

    it('should throw AuthError when refresh token is expired', async () => {
      // Arrange
      const expiredToken = 'expired_token';
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(authService.refreshToken(expiredToken)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(expiredToken)).rejects.toThrow(
        'Refresh token expirado'
      );
    });

    it('should throw AuthError when refresh token is invalid', async () => {
      // Arrange
      const invalidToken = 'invalid_token';
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(authService.refreshToken(invalidToken)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(invalidToken)).rejects.toThrow(
        'Refresh token inválido'
      );
    });

    it('should throw AuthError when user not found', async () => {
      // Arrange
      jwt.verify.mockReturnValue({ usuarioId: 999, dni: '99999999' });
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken('valid_token')).rejects.toThrow(AuthError);
      await expect(authService.refreshToken('valid_token')).rejects.toThrow(
        'Usuario no encontrado'
      );
    });

    it('should throw AuthError when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, estado: 'inactivo' };
      jwt.verify.mockReturnValue({ usuarioId: 1, dni: '12345678' });
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(authService.refreshToken('valid_token')).rejects.toThrow(AuthError);
      await expect(authService.refreshToken('valid_token')).rejects.toThrow('Usuario inactivo');
    });
  });

  describe('generateToken', () => {
    const mockUser = {
      usuarioId: 1,
      dni: '12345678',
      rol: 'estudiante',
    };

    it('should generate normal token with 24h expiration', () => {
      // Arrange
      jwt.sign.mockReturnValue('generated_token');

      // Act
      const token = authService.generateToken(mockUser);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { usuarioId: 1, dni: '12345678', rol: 'estudiante' },
        'test_secret',
        { expiresIn: '24h' }
      );
      expect(token).toBe('generated_token');
    });

    it('should generate temporary token with 15m expiration', () => {
      // Arrange
      jwt.sign.mockReturnValue('temp_token');

      // Act
      const token = authService.generateToken(mockUser, true);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { usuarioId: 1, dni: '12345678', rol: 'estudiante' },
        'test_secret',
        { expiresIn: '15m' }
      );
      expect(token).toBe('temp_token');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token successfully', () => {
      // Arrange
      const token = 'valid_token';
      const decoded = { usuarioId: 1, dni: '12345678', rol: 'estudiante' };
      jwt.verify.mockReturnValue(decoded);

      // Act
      const result = authService.verifyToken(token);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test_secret');
      expect(result).toEqual(decoded);
    });

    it('should throw AuthError for expired token', () => {
      // Arrange
      const token = 'expired_token';
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => authService.verifyToken(token)).toThrow(AuthError);
      expect(() => authService.verifyToken(token)).toThrow('Token expirado');
    });

    it('should throw AuthError for invalid token', () => {
      // Arrange
      const token = 'invalid_token';
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => authService.verifyToken(token)).toThrow(AuthError);
      expect(() => authService.verifyToken(token)).toThrow('Token inválido');
    });
  });
});
