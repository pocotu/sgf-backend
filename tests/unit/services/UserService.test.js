/**
 * Unit Tests for UserService
 */

const UserService = require('../../../src/services/UserService');
const { ValidationError, BusinessLogicError } = require('../../../src/utils/errors');

describe('UserService', () => {
  let userService;
  let mockUserRepository;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock UserRepository
    mockUserRepository = {
      dniExists: jest.fn(),
      emailExists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    // Create UserService instance
    userService = new UserService(mockUserRepository);
  });

  describe('validateUserData', () => {
    describe('for new user creation', () => {
      it('should validate successfully with all required fields', async () => {
        // Arrange
        const userData = {
          dni: '12345678',
          correo: 'test@example.com',
          nombres: 'Juan',
          apellidos: 'Pérez',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData)).resolves.not.toThrow();
      });

      it('should validate successfully without optional correo', async () => {
        // Arrange
        const userData = {
          dni: '12345678',
          nombres: 'Juan',
          apellidos: 'Pérez',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData)).resolves.not.toThrow();
      });

      it('should throw ValidationError when DNI is missing', async () => {
        // Arrange
        const userData = {
          nombres: 'Juan',
          apellidos: 'Pérez',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
        await expect(userService.validateUserData(userData))
          .rejects.toThrow('Errores de validación');
      });

      it('should throw ValidationError when DNI is invalid (not 8 digits)', async () => {
        // Arrange
        const userData = {
          dni: '123',
          nombres: 'Juan',
          apellidos: 'Pérez',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError when DNI contains non-numeric characters', async () => {
        // Arrange
        const userData = {
          dni: '1234567A',
          nombres: 'Juan',
          apellidos: 'Pérez',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError when correo format is invalid', async () => {
        // Arrange
        const userData = {
          dni: '12345678',
          correo: 'invalid-email',
          nombres: 'Juan',
          apellidos: 'Pérez',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError when nombres is missing', async () => {
        // Arrange
        const userData = {
          dni: '12345678',
          apellidos: 'Pérez',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError when nombres is empty string', async () => {
        // Arrange
        const userData = {
          dni: '12345678',
          nombres: '   ',
          apellidos: 'Pérez',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError when apellidos is missing', async () => {
        // Arrange
        const userData = {
          dni: '12345678',
          nombres: 'Juan',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError when apellidos is empty string', async () => {
        // Arrange
        const userData = {
          dni: '12345678',
          nombres: 'Juan',
          apellidos: '   ',
          rol: 'estudiante',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError when rol is missing', async () => {
        // Arrange
        const userData = {
          dni: '12345678',
          nombres: 'Juan',
          apellidos: 'Pérez',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError when rol is invalid', async () => {
        // Arrange
        const userData = {
          dni: '12345678',
          nombres: 'Juan',
          apellidos: 'Pérez',
          rol: 'invalid_role',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData))
          .rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError with multiple errors', async () => {
        // Arrange
        const userData = {
          dni: '123',
          correo: 'invalid-email',
          nombres: '',
          rol: 'invalid_role',
        };

        // Act & Assert
        try {
          await userService.validateUserData(userData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details).toHaveProperty('dni');
          expect(error.details).toHaveProperty('correo');
          expect(error.details).toHaveProperty('nombres');
          expect(error.details).toHaveProperty('apellidos');
          expect(error.details).toHaveProperty('rol');
        }
      });
    });

    describe('for user update', () => {
      it('should validate successfully for partial update', async () => {
        // Arrange
        const userData = {
          nombres: 'Juan Carlos',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData, true))
          .resolves.not.toThrow();
      });

      it('should not require DNI for update', async () => {
        // Arrange
        const userData = {
          nombres: 'Juan',
          apellidos: 'Pérez',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData, true))
          .resolves.not.toThrow();
      });

      it('should still validate DNI format if provided', async () => {
        // Arrange
        const userData = {
          dni: '123',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData, true))
          .rejects.toThrow(ValidationError);
      });

      it('should still validate correo format if provided', async () => {
        // Arrange
        const userData = {
          correo: 'invalid-email',
        };

        // Act & Assert
        await expect(userService.validateUserData(userData, true))
          .rejects.toThrow(ValidationError);
      });
    });
  });

  describe('checkUniqueness', () => {
    it('should pass when DNI and correo are unique', async () => {
      // Arrange
      mockUserRepository.dniExists.mockResolvedValue(false);
      mockUserRepository.emailExists.mockResolvedValue(false);

      // Act & Assert
      await expect(userService.checkUniqueness('12345678', 'test@example.com'))
        .resolves.not.toThrow();
      expect(mockUserRepository.dniExists).toHaveBeenCalledWith('12345678', null);
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith('test@example.com', null);
    });

    it('should throw BusinessLogicError when DNI already exists', async () => {
      // Arrange
      mockUserRepository.dniExists.mockResolvedValue(true);

      // Act & Assert
      await expect(userService.checkUniqueness('12345678', 'test@example.com'))
        .rejects.toThrow(BusinessLogicError);
      await expect(userService.checkUniqueness('12345678', 'test@example.com'))
        .rejects.toThrow('El DNI ya está registrado');
    });

    it('should throw BusinessLogicError when correo already exists', async () => {
      // Arrange
      mockUserRepository.dniExists.mockResolvedValue(false);
      mockUserRepository.emailExists.mockResolvedValue(true);

      // Act & Assert
      await expect(userService.checkUniqueness('12345678', 'test@example.com'))
        .rejects.toThrow(BusinessLogicError);
      await expect(userService.checkUniqueness('12345678', 'test@example.com'))
        .rejects.toThrow('El correo electrónico ya está registrado');
    });

    it('should exclude specific ID when checking uniqueness', async () => {
      // Arrange
      mockUserRepository.dniExists.mockResolvedValue(false);
      mockUserRepository.emailExists.mockResolvedValue(false);

      // Act
      await userService.checkUniqueness('12345678', 'test@example.com', 5);

      // Assert
      expect(mockUserRepository.dniExists).toHaveBeenCalledWith('12345678', 5);
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith('test@example.com', 5);
    });

    it('should not check correo uniqueness when correo is null', async () => {
      // Arrange
      mockUserRepository.dniExists.mockResolvedValue(false);

      // Act
      await userService.checkUniqueness('12345678', null);

      // Assert
      expect(mockUserRepository.dniExists).toHaveBeenCalledWith('12345678', null);
      expect(mockUserRepository.emailExists).not.toHaveBeenCalled();
    });

    it('should not check DNI uniqueness when DNI is null', async () => {
      // Arrange
      mockUserRepository.emailExists.mockResolvedValue(false);

      // Act
      await userService.checkUniqueness(null, 'test@example.com');

      // Assert
      expect(mockUserRepository.dniExists).not.toHaveBeenCalled();
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith('test@example.com', null);
    });
  });
});
