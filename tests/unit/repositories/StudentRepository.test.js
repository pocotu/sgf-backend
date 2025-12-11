const StudentRepository = require('../../../src/repositories/StudentRepository');
const prisma = require('../../../src/config/database');

// Mock Prisma
jest.mock('../../../src/config/database', () => ({
  estudiante: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
}));

describe('StudentRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new StudentRepository();
    jest.clearAllMocks();
  });

  describe('getIdField', () => {
    it('should return estudianteId as ID field', () => {
      expect(repository.getIdField()).toBe('estudianteId');
    });
  });

  describe('generateCodigoInterno', () => {
    const currentYear = new Date().getFullYear();

    describe('formato correcto YYYY-AREA-MOD-NNN', () => {
      it('should generate code with format YYYY-A-ORD-001 for ORDINARIO modalidad and area A', async () => {
        prisma.estudiante.findFirst.mockResolvedValue(null);

        const codigo = await repository.generateCodigoInterno('ORDINARIO', 'A');

        expect(codigo).toMatch(/^\d{4}-[A-D]-[A-Z]{3}-\d{3}$/);
        expect(codigo).toBe(`${currentYear}-A-ORD-001`);
      });

      it('should generate code with format YYYY-B-PRI-001 for PRIMERA_OPCION modalidad and area B', async () => {
        prisma.estudiante.findFirst.mockResolvedValue(null);

        const codigo = await repository.generateCodigoInterno('PRIMERA_OPCION', 'B');

        expect(codigo).toBe(`${currentYear}-B-PRI-001`);
      });

      it('should generate code with format YYYY-C-DIR-001 for DIRIMENCIA modalidad and area C', async () => {
        prisma.estudiante.findFirst.mockResolvedValue(null);

        const codigo = await repository.generateCodigoInterno('DIRIMENCIA', 'C');

        expect(codigo).toBe(`${currentYear}-C-DIR-001`);
      });

      it('should generate code with format YYYY-X-ORD-001 when area is not provided', async () => {
        prisma.estudiante.findFirst.mockResolvedValue(null);

        const codigo = await repository.generateCodigoInterno('ORDINARIO', null);

        expect(codigo).toBe(`${currentYear}-X-ORD-001`);
      });

      it('should pad number with leading zeros to 3 digits', async () => {
        prisma.estudiante.findFirst.mockResolvedValue(null);

        const codigo = await repository.generateCodigoInterno('ORDINARIO', 'A');

        const numberPart = codigo.split('-')[3];
        expect(numberPart).toHaveLength(3);
        expect(numberPart).toBe('001');
      });
    });

    describe('secuencia incremental', () => {
      it('should increment sequence number when previous student exists', async () => {
        const lastStudent = {
          codigoInterno: `${currentYear}-A-ORD-001`,
        };
        prisma.estudiante.findFirst.mockResolvedValue(lastStudent);

        const codigo = await repository.generateCodigoInterno('ORDINARIO', 'A');

        expect(codigo).toBe(`${currentYear}-A-ORD-002`);
      });

      it('should increment to 010 from 009', async () => {
        const lastStudent = {
          codigoInterno: `${currentYear}-A-ORD-009`,
        };
        prisma.estudiante.findFirst.mockResolvedValue(lastStudent);

        const codigo = await repository.generateCodigoInterno('ORDINARIO', 'A');

        expect(codigo).toBe(`${currentYear}-A-ORD-010`);
      });

      it('should increment to 100 from 099', async () => {
        const lastStudent = {
          codigoInterno: `${currentYear}-A-ORD-099`,
        };
        prisma.estudiante.findFirst.mockResolvedValue(lastStudent);

        const codigo = await repository.generateCodigoInterno('ORDINARIO', 'A');

        expect(codigo).toBe(`${currentYear}-A-ORD-100`);
      });

      it('should handle large sequence numbers', async () => {
        const lastStudent = {
          codigoInterno: `${currentYear}-A-ORD-999`,
        };
        prisma.estudiante.findFirst.mockResolvedValue(lastStudent);

        const codigo = await repository.generateCodigoInterno('ORDINARIO', 'A');

        expect(codigo).toBe(`${currentYear}-A-ORD-1000`);
      });

      it('should query database with correct prefix', async () => {
        prisma.estudiante.findFirst.mockResolvedValue(null);

        await repository.generateCodigoInterno('ORDINARIO', 'A');

        expect(prisma.estudiante.findFirst).toHaveBeenCalledWith({
          where: {
            codigoInterno: {
              startsWith: `${currentYear}-A-ORD`,
            },
          },
          orderBy: {
            codigoInterno: 'desc',
          },
        });
      });
    });

    describe('unicidad', () => {
      it('should generate different codes for different areas', async () => {
        prisma.estudiante.findFirst.mockResolvedValue(null);

        const codigoA = await repository.generateCodigoInterno('ORDINARIO', 'A');
        const codigoB = await repository.generateCodigoInterno('ORDINARIO', 'B');

        expect(codigoA).not.toBe(codigoB);
        expect(codigoA).toBe(`${currentYear}-A-ORD-001`);
        expect(codigoB).toBe(`${currentYear}-B-ORD-001`);
      });

      it('should generate different codes for different modalidades', async () => {
        prisma.estudiante.findFirst.mockResolvedValue(null);

        const codigoORD = await repository.generateCodigoInterno('ORDINARIO', 'A');
        const codigoPRI = await repository.generateCodigoInterno('PRIMERA_OPCION', 'A');

        expect(codigoORD).not.toBe(codigoPRI);
        expect(codigoORD).toBe(`${currentYear}-A-ORD-001`);
        expect(codigoPRI).toBe(`${currentYear}-A-PRI-001`);
      });

      it('should generate independent sequences for different combinations', async () => {
        // Simular que ya existe un estudiante en A-ORD
        prisma.estudiante.findFirst.mockImplementation(({ where }) => {
          if (where.codigoInterno.startsWith.includes('A-ORD')) {
            return Promise.resolve({ codigoInterno: `${currentYear}-A-ORD-005` });
          }
          return Promise.resolve(null);
        });

        const codigoAORD = await repository.generateCodigoInterno('ORDINARIO', 'A');
        const codigoBORD = await repository.generateCodigoInterno('ORDINARIO', 'B');

        expect(codigoAORD).toBe(`${currentYear}-A-ORD-006`);
        expect(codigoBORD).toBe(`${currentYear}-B-ORD-001`);
      });
    });
  });

  describe('findByCodigoInterno', () => {
    it('should find student by codigo interno with user data', async () => {
      const mockStudent = {
        estudianteId: 1,
        codigoInterno: '2025-A-ORD-001',
        usuario: { nombres: 'Juan', apellidos: 'Pérez' },
      };
      prisma.estudiante.findUnique.mockResolvedValue(mockStudent);

      const result = await repository.findByCodigoInterno('2025-A-ORD-001');

      expect(prisma.estudiante.findUnique).toHaveBeenCalledWith({
        where: { codigoInterno: '2025-A-ORD-001' },
        include: { usuario: true },
      });
      expect(result).toEqual(mockStudent);
    });
  });

  describe('codigoInternoExists', () => {
    it('should return true if codigo interno exists', async () => {
      prisma.estudiante.count.mockResolvedValue(1);

      const result = await repository.codigoInternoExists('2025-A-ORD-001');

      expect(result).toBe(true);
    });

    it('should return false if codigo interno does not exist', async () => {
      prisma.estudiante.count.mockResolvedValue(0);

      const result = await repository.codigoInternoExists('2025-X-XXX-999');

      expect(result).toBe(false);
    });
  });

  describe('isUserStudent', () => {
    it('should return true if user is already a student', async () => {
      prisma.estudiante.count.mockResolvedValue(1);

      const result = await repository.isUserStudent(1);

      expect(result).toBe(true);
    });

    it('should return false if user is not a student', async () => {
      prisma.estudiante.count.mockResolvedValue(0);

      const result = await repository.isUserStudent(999);

      expect(result).toBe(false);
    });
  });
});
