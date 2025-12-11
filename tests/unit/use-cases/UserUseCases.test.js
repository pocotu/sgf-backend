/**
 * Unit Tests for User Use Cases
 */

const bcrypt = require('bcryptjs');
const RegisterUserUseCase = require('../../../src/use-cases/RegisterUserUseCase');
const GetUsersUseCase = require('../../../src/use-cases/GetUsersUseCase');
const GetUserByIdUseCase = require('../../../src/use-cases/GetUserByIdUseCase');
const UpdateUserUseCase = require('../../../src/use-cases/UpdateUserUseCase');
const DeleteUserUseCase = require('../../../src/use-cases/DeleteUserUseCase');
const { NotFoundError, BusinessLogicError } = require('../../../src/utils/errors');

// Mock bcrypt
jest.mock('bcryptjs');

describe('User Use Cases', () => {
  let mockUserRepository;
  let mockUserService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      model: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    mockUserService = {
      validateUserData: jest.fn(),
      checkUniqueness: jest.fn(),
    };
  });

  describe('RegisterUserUseCase', () => {
    let registerUserUseCase;

    beforeEach(() => {
      registerUserUseCase = new RegisterUserUseCase(mockUserRepository, mockUserService);
    });

    it('should create user successfully with password = DNI', async () => {
      // Arrange
      const userData = {
        dni: '12345678',
        correo: 'test@example.com',
        nombres: 'Juan',
        apellidos: 'Pérez',
        telefono: '987654321',
        rol: 'estudiante',
      };

      const createdUser = {
        usuarioId: 1,
        ...userData,
        contrasenaHash: 'hashed_dni',
        requiereCambioPassword: true,
        estado: 'activo',
      };

      mockUserService.validateUserData.mockResolvedValue();
      mockUserService.checkUniqueness.mockResolvedValue();
      bcrypt.hash.mockResolvedValue('hashed_dni');
      mockUserRepository.create.mockResolvedValue(createdUser);

      // Act
      const result = await registerUserUseCase.execute(userData);

      // Assert
      expect(mockUserService.validateUserData).toHaveBeenCalledWith(userData);
      expect(mockUserService.checkUniqueness).toHaveBeenCalledWith('12345678', 'test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('12345678', expect.any(Number));
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        dni: '12345678',
        correo: 'test@example.com',
        contrasenaHash: 'hashed_dni',
        requiereCambioPassword: true,
        rol: 'estudiante',
        nombres: 'Juan',
        apellidos: 'Pérez',
        telefono: '987654321',
        estado: 'activo',
      });
      expect(result).not.toHaveProperty('contrasenaHash');
      expect(result.usuarioId).toBe(1);
    });

    it('should create user with null correo when not provided', async () => {
      // Arrange
      const userData = {
        dni: '12345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        rol: 'estudiante',
      };

      const createdUser = {
        usuarioId: 1,
        ...userData,
        correo: null,
        telefono: null,
        contrasenaHash: 'hashed_dni',
        requiereCambioPassword: true,
        estado: 'activo',
      };

      mockUserService.validateUserData.mockResolvedValue();
      mockUserService.checkUniqueness.mockResolvedValue();
      bcrypt.hash.mockResolvedValue('hashed_dni');
      mockUserRepository.create.mockResolvedValue(createdUser);

      // Act
      const result = await registerUserUseCase.execute(userData);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          correo: null,
          telefono: null,
        })
      );
      expect(result.correo).toBeNull();
    });
  });

  describe('GetUsersUseCase', () => {
    let getUsersUseCase;

    beforeEach(() => {
      getUsersUseCase = new GetUsersUseCase(mockUserRepository);
    });

    it('should list users with default pagination', async () => {
      // Arrange
      const mockUsers = [
        { usuarioId: 1, dni: '12345678', nombres: 'Juan', apellidos: 'Pérez' },
        { usuarioId: 2, dni: '87654321', nombres: 'María', apellidos: 'García' },
      ];

      mockUserRepository.model.findMany.mockResolvedValue(mockUsers);
      mockUserRepository.model.count.mockResolvedValue(2);

      // Act
      const result = await getUsersUseCase.execute();

      // Assert
      expect(mockUserRepository.model.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { fechaCreacion: 'desc' },
        select: expect.any(Object),
      });
      expect(result.usuarios).toEqual(mockUsers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter users by rol', async () => {
      // Arrange
      mockUserRepository.model.findMany.mockResolvedValue([]);
      mockUserRepository.model.count.mockResolvedValue(0);

      // Act
      await getUsersUseCase.execute({ rol: 'estudiante' });

      // Assert
      expect(mockUserRepository.model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rol: 'estudiante' },
        })
      );
    });

    it('should filter users by estado', async () => {
      // Arrange
      mockUserRepository.model.findMany.mockResolvedValue([]);
      mockUserRepository.model.count.mockResolvedValue(0);

      // Act
      await getUsersUseCase.execute({ estado: 'activo' });

      // Assert
      expect(mockUserRepository.model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado: 'activo' },
        })
      );
    });

    it('should search users by DNI, nombre or correo', async () => {
      // Arrange
      mockUserRepository.model.findMany.mockResolvedValue([]);
      mockUserRepository.model.count.mockResolvedValue(0);

      // Act
      await getUsersUseCase.execute({ search: 'juan' });

      // Assert
      expect(mockUserRepository.model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { dni: { contains: 'juan' } },
              { nombres: { contains: 'juan', mode: 'insensitive' } },
              { apellidos: { contains: 'juan', mode: 'insensitive' } },
              { correo: { contains: 'juan', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('should apply pagination correctly', async () => {
      // Arrange
      mockUserRepository.model.findMany.mockResolvedValue([]);
      mockUserRepository.model.count.mockResolvedValue(25);

      // Act
      const result = await getUsersUseCase.execute({}, { page: 2, limit: 5 });

      // Assert
      expect(mockUserRepository.model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 25,
        totalPages: 5,
      });
    });
  });

  describe('GetUserByIdUseCase', () => {
    let getUserByIdUseCase;

    beforeEach(() => {
      getUserByIdUseCase = new GetUserByIdUseCase(mockUserRepository);
    });

    it('should get user by ID successfully', async () => {
      // Arrange
      const mockUser = {
        usuarioId: 1,
        dni: '12345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        contrasenaHash: 'hashed_password',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await getUserByIdUseCase.execute(1);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).not.toHaveProperty('contrasenaHash');
      expect(result.usuarioId).toBe(1);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getUserByIdUseCase.execute(999))
        .rejects.toThrow(NotFoundError);
      await expect(getUserByIdUseCase.execute(999))
        .rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('UpdateUserUseCase', () => {
    let updateUserUseCase;

    beforeEach(() => {
      updateUserUseCase = new UpdateUserUseCase(mockUserRepository, mockUserService);
    });

    it('should update user successfully', async () => {
      // Arrange
      const existingUser = {
        usuarioId: 1,
        dni: '12345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
      };

      const updateData = {
        nombres: 'Juan Carlos',
        telefono: '987654321',
      };

      const updatedUser = {
        ...existingUser,
        ...updateData,
        contrasenaHash: 'hashed_password',
      };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserService.validateUserData.mockResolvedValue();
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(1, updateData);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserService.validateUserData).toHaveBeenCalledWith(updateData, true);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).not.toHaveProperty('contrasenaHash');
      expect(result.nombres).toBe('Juan Carlos');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateUserUseCase.execute(999, { nombres: 'Test' }))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw BusinessLogicError when trying to change DNI', async () => {
      // Arrange
      const existingUser = { usuarioId: 1, dni: '12345678' };
      mockUserRepository.findById.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(1, { dni: '87654321' }))
        .rejects.toThrow(BusinessLogicError);
      await expect(updateUserUseCase.execute(1, { dni: '87654321' }))
        .rejects.toThrow('No se permite cambiar el DNI');
    });

    it('should throw BusinessLogicError when trying to change usuarioId', async () => {
      // Arrange
      const existingUser = { usuarioId: 1, dni: '12345678' };
      mockUserRepository.findById.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(1, { usuarioId: 2 }))
        .rejects.toThrow(BusinessLogicError);
      await expect(updateUserUseCase.execute(1, { usuarioId: 2 }))
        .rejects.toThrow('No se permite cambiar el ID de usuario');
    });

    it('should throw BusinessLogicError when trying to change rol', async () => {
      // Arrange
      const existingUser = { usuarioId: 1, dni: '12345678', rol: 'estudiante' };
      mockUserRepository.findById.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(1, { rol: 'admin' }))
        .rejects.toThrow(BusinessLogicError);
      await expect(updateUserUseCase.execute(1, { rol: 'admin' }))
        .rejects.toThrow('No se permite cambiar el rol');
    });

    it('should check correo uniqueness when updating correo', async () => {
      // Arrange
      const existingUser = { usuarioId: 1, dni: '12345678' };
      const updateData = { correo: 'new@example.com' };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserService.validateUserData.mockResolvedValue();
      mockUserService.checkUniqueness.mockResolvedValue();
      mockUserRepository.update.mockResolvedValue({ ...existingUser, ...updateData });

      // Act
      await updateUserUseCase.execute(1, updateData);

      // Assert
      expect(mockUserService.checkUniqueness).toHaveBeenCalledWith(null, 'new@example.com', 1);
    });
  });

  describe('DeleteUserUseCase', () => {
    let deleteUserUseCase;

    beforeEach(() => {
      deleteUserUseCase = new DeleteUserUseCase(mockUserRepository);
    });

    it('should soft delete user successfully', async () => {
      // Arrange
      const existingUser = {
        usuarioId: 1,
        dni: '12345678',
        estado: 'activo',
      };

      const deletedUser = {
        ...existingUser,
        estado: 'inactivo',
        contrasenaHash: 'hashed_password',
      };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(deletedUser);

      // Act
      const result = await deleteUserUseCase.execute(1);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { estado: 'inactivo' });
      expect(result).not.toHaveProperty('contrasenaHash');
      expect(result.estado).toBe('inactivo');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteUserUseCase.execute(999))
        .rejects.toThrow(NotFoundError);
      await expect(deleteUserUseCase.execute(999))
        .rejects.toThrow('Usuario no encontrado');
    });
  });
});
