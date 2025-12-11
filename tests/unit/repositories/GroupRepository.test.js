const GroupRepository = require('../../../src/repositories/GroupRepository');
const prisma = require('../../../src/config/database');

// Mock Prisma
jest.mock('../../../src/config/database', () => ({
  grupo: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('GroupRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new GroupRepository();
    jest.clearAllMocks();
  });

  describe('getIdField', () => {
    it('should return grupoId as ID field', () => {
      expect(repository.getIdField()).toBe('grupoId');
    });
  });

  describe('validateSchedule', () => {
    describe('validación de horarios', () => {
      it('should return true when horaFin is greater than horaInicio', () => {
        const result = repository.validateSchedule('08:00', '12:00');
        expect(result).toBe(true);
      });

      it('should return false when horaFin equals horaInicio', () => {
        const result = repository.validateSchedule('08:00', '08:00');
        expect(result).toBe(false);
      });

      it('should return false when horaFin is less than horaInicio', () => {
        const result = repository.validateSchedule('12:00', '08:00');
        expect(result).toBe(false);
      });

      it('should handle edge case with 1 minute difference', () => {
        const result = repository.validateSchedule('08:00', '08:01');
        expect(result).toBe(true);
      });

      it('should handle late night hours correctly', () => {
        const result = repository.validateSchedule('20:00', '23:59');
        expect(result).toBe(true);
      });

      it('should handle early morning hours correctly', () => {
        const result = repository.validateSchedule('06:00', '09:00');
        expect(result).toBe(true);
      });
    });
  });

  describe('findWithEnrollmentCount', () => {
    describe('cálculo de cupos disponibles', () => {
      it('should calculate cuposDisponibles correctly with no enrollments', async () => {
        const mockGroup = {
          grupoId: 1,
          nombreGrupo: 'Grupo 1',
          capacidad: 30,
          _count: { matriculas: 0 },
        };
        prisma.grupo.findUnique.mockResolvedValue(mockGroup);

        const result = await repository.findWithEnrollmentCount(1);

        expect(result.cuposDisponibles).toBe(30);
        expect(result.matriculasActivas).toBe(0);
      });

      it('should calculate cuposDisponibles correctly with some enrollments', async () => {
        const mockGroup = {
          grupoId: 1,
          nombreGrupo: 'Grupo 1',
          capacidad: 30,
          _count: { matriculas: 15 },
        };
        prisma.grupo.findUnique.mockResolvedValue(mockGroup);

        const result = await repository.findWithEnrollmentCount(1);

        expect(result.cuposDisponibles).toBe(15);
        expect(result.matriculasActivas).toBe(15);
      });

      it('should calculate cuposDisponibles as 0 when group is full', async () => {
        const mockGroup = {
          grupoId: 1,
          nombreGrupo: 'Grupo 1',
          capacidad: 30,
          _count: { matriculas: 30 },
        };
        prisma.grupo.findUnique.mockResolvedValue(mockGroup);

        const result = await repository.findWithEnrollmentCount(1);

        expect(result.cuposDisponibles).toBe(0);
        expect(result.matriculasActivas).toBe(30);
      });

      it('should only count MATRICULADO enrollments', async () => {
        const mockGroup = {
          grupoId: 1,
          nombreGrupo: 'Grupo 1',
          capacidad: 30,
          _count: { matriculas: 10 },
        };
        prisma.grupo.findUnique.mockResolvedValue(mockGroup);

        await repository.findWithEnrollmentCount(1);

        expect(prisma.grupo.findUnique).toHaveBeenCalledWith({
          where: { grupoId: 1 },
          include: {
            _count: {
              select: {
                matriculas: {
                  where: { estado: 'MATRICULADO' },
                },
              },
            },
          },
        });
      });

      it('should return null when group does not exist', async () => {
        prisma.grupo.findUnique.mockResolvedValue(null);

        const result = await repository.findWithEnrollmentCount(999);

        expect(result).toBeNull();
      });
    });
  });

  describe('existsUniqueCombination', () => {
    describe('unicidad área-modalidad-nombreGrupo', () => {
      it('should return true when combination exists', async () => {
        prisma.grupo.count.mockResolvedValue(1);

        const result = await repository.existsUniqueCombination(
          'A',
          'ORDINARIO',
          'Grupo 1'
        );

        expect(result).toBe(true);
        expect(prisma.grupo.count).toHaveBeenCalledWith({
          where: { area: 'A', modalidad: 'ORDINARIO', nombreGrupo: 'Grupo 1' },
        });
      });

      it('should return false when combination does not exist', async () => {
        prisma.grupo.count.mockResolvedValue(0);

        const result = await repository.existsUniqueCombination(
          'A',
          'ORDINARIO',
          'Grupo 1'
        );

        expect(result).toBe(false);
      });

      it('should exclude specific ID when provided', async () => {
        prisma.grupo.count.mockResolvedValue(0);

        await repository.existsUniqueCombination(
          'A',
          'ORDINARIO',
          'Grupo 1',
          5
        );

        expect(prisma.grupo.count).toHaveBeenCalledWith({
          where: {
            area: 'A',
            modalidad: 'ORDINARIO',
            nombreGrupo: 'Grupo 1',
            grupoId: { not: 5 },
          },
        });
      });

      it('should allow same name in different areas', async () => {
        prisma.grupo.count.mockResolvedValue(0);

        const resultA = await repository.existsUniqueCombination(
          'A',
          'ORDINARIO',
          'Grupo 1'
        );
        const resultB = await repository.existsUniqueCombination(
          'B',
          'ORDINARIO',
          'Grupo 1'
        );

        expect(resultA).toBe(false);
        expect(resultB).toBe(false);
      });

      it('should allow same name in different modalidades', async () => {
        prisma.grupo.count.mockResolvedValue(0);

        const resultORD = await repository.existsUniqueCombination(
          'A',
          'ORDINARIO',
          'Grupo 1'
        );
        const resultPRI = await repository.existsUniqueCombination(
          'A',
          'PRIMERA_OPCION',
          'Grupo 1'
        );

        expect(resultORD).toBe(false);
        expect(resultPRI).toBe(false);
      });
    });
  });

  describe('list', () => {
    it('should include cuposDisponibles for each group', async () => {
      const mockGroups = [
        {
          grupoId: 1,
          nombreGrupo: 'Grupo 1',
          capacidad: 30,
          _count: { matriculas: 10 },
        },
        {
          grupoId: 2,
          nombreGrupo: 'Grupo 2',
          capacidad: 25,
          _count: { matriculas: 20 },
        },
      ];
      prisma.grupo.findMany.mockResolvedValue(mockGroups);
      prisma.grupo.count.mockResolvedValue(2);

      const result = await repository.list({}, { page: 1, limit: 10 });

      expect(result.grupos[0].cuposDisponibles).toBe(20);
      expect(result.grupos[1].cuposDisponibles).toBe(5);
    });

    it('should filter by modalidad', async () => {
      prisma.grupo.findMany.mockResolvedValue([]);
      prisma.grupo.count.mockResolvedValue(0);

      await repository.list({ modalidad: 'ORDINARIO' }, { page: 1, limit: 10 });

      expect(prisma.grupo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ modalidad: 'ORDINARIO' }),
        })
      );
    });

    it('should filter by area', async () => {
      prisma.grupo.findMany.mockResolvedValue([]);
      prisma.grupo.count.mockResolvedValue(0);

      await repository.list({ area: 'A' }, { page: 1, limit: 10 });

      expect(prisma.grupo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ area: 'A' }),
        })
      );
    });

    it('should filter by estado', async () => {
      prisma.grupo.findMany.mockResolvedValue([]);
      prisma.grupo.count.mockResolvedValue(0);

      await repository.list({ estado: 'ACTIVO' }, { page: 1, limit: 10 });

      expect(prisma.grupo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: 'ACTIVO' }),
        })
      );
    });
  });
});
