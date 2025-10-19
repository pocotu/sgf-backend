const UserRepository = require('../../../src/repositories/UserRepository');
const prisma = require('../../../src/config/database');

// Mock Prisma
jest.mock('../../../src/config/database', () => ({
  usuario: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

describe('UserRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new UserRepository();
    jest.clearAllMocks();
  });

  describe('getIdField', () => {
    it('should return usuarioId as ID field', () => {
      expect(repository.getIdField()).toBe('usuarioId');
    });
  });

  describe('findByDni', () => {
    it('should find user by DNI', async () => {
      const mockUser = { usuarioId: 1, dni: '12345678' };
      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByDni('12345678');

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { dni: '12345678' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = { usuarioId: 1, correo: 'test@test.com' };
      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@test.com');

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { correo: 'test@test.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      const mockUsers = [{ usuarioId: 1, rol: 'admin' }];
      prisma.usuario.findMany.mockResolvedValue(mockUsers);

      const result = await repository.findByRole('admin');

      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        where: { rol: 'admin' },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findActive', () => {
    it('should find active users', async () => {
      const mockUsers = [{ usuarioId: 1, estado: 'activo' }];
      prisma.usuario.findMany.mockResolvedValue(mockUsers);

      const result = await repository.findActive();

      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        where: { estado: 'activo' },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('dniExists', () => {
    it('should return true if DNI exists', async () => {
      prisma.usuario.count.mockResolvedValue(1);

      const result = await repository.dniExists('12345678');

      expect(result).toBe(true);
    });

    it('should return false if DNI does not exist', async () => {
      prisma.usuario.count.mockResolvedValue(0);

      const result = await repository.dniExists('99999999');

      expect(result).toBe(false);
    });

    it('should exclude specific ID when checking', async () => {
      prisma.usuario.count.mockResolvedValue(0);

      await repository.dniExists('12345678', 5);

      expect(prisma.usuario.count).toHaveBeenCalledWith({
        where: { dni: '12345678', usuarioId: { not: 5 } },
      });
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      prisma.usuario.count.mockResolvedValue(1);

      const result = await repository.emailExists('test@test.com');

      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      prisma.usuario.count.mockResolvedValue(0);

      const result = await repository.emailExists('none@test.com');

      expect(result).toBe(false);
    });
  });
});
