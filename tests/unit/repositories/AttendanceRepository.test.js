const AttendanceRepository = require('../../../src/repositories/AttendanceRepository');
const prisma = require('../../../src/config/database');

jest.mock('../../../src/config/database', () => ({
  asistencia: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
}));

describe('AttendanceRepository', () => {
  let attendanceRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    attendanceRepository = new AttendanceRepository();
  });

  describe('getIdField', () => {
    it('should return asistenciaId as ID field', () => {
      expect(attendanceRepository.getIdField()).toBe('asistenciaId');
    });
  });

  describe('registerBulk', () => {
    it('should register multiple attendances in transaction', async () => {
      const grupoId = 1;
      const fechaClase = '2025-01-15';
      const asistencias = [
        { estudianteId: 1, estado: 'PRESENTE', horaRegistro: '08:00' },
        { estudianteId: 2, estado: 'TARDANZA', horaRegistro: '08:15' },
      ];

      const mockResult = { count: 2 };

      // eslint-disable-next-line require-await
      prisma.$transaction.mockImplementation(async callback => {
        const tx = {
          asistencia: {
            createMany: jest.fn().mockResolvedValue(mockResult),
          },
        };
        return callback(tx);
      });

      const result = await attendanceRepository.registerBulk(grupoId, fechaClase, asistencias);

      expect(result).toEqual(mockResult);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('getSummaryByStudent', () => {
    it('should calculate attendance summary for student', async () => {
      const estudianteId = 1;
      const grupoId = 1;
      const mockAsistencias = [
        { estado: 'PRESENTE', fechaClase: new Date('2025-01-15') },
        { estado: 'PRESENTE', fechaClase: new Date('2025-01-16') },
        { estado: 'TARDANZA', fechaClase: new Date('2025-01-17') },
        { estado: 'AUSENTE', fechaClase: new Date('2025-01-18') },
      ];

      prisma.asistencia.findMany.mockResolvedValue(mockAsistencias);

      const result = await attendanceRepository.getSummaryByStudent(estudianteId, grupoId);

      expect(result.totalClases).toBe(4);
      expect(result.presentes).toBe(2);
      expect(result.tardanzas).toBe(1);
      expect(result.ausentes).toBe(1);
      expect(result.porcentajeAsistencia).toBe(75);
    });

    it('should handle empty attendance list', async () => {
      prisma.asistencia.findMany.mockResolvedValue([]);

      const result = await attendanceRepository.getSummaryByStudent(1, 1);

      expect(result.totalClases).toBe(0);
      expect(result.porcentajeAsistencia).toBe(0);
    });
  });

  describe('getSummaryByGroup', () => {
    it('should calculate attendance summary by group', async () => {
      const mockAsistencias = [
        {
          estudianteId: 1,
          estado: 'PRESENTE',
          estudiante: {
            codigoInterno: '2025-A-ORD-001',
            usuario: { nombres: 'Juan', apellidos: 'Pérez' },
          },
        },
        {
          estudianteId: 1,
          estado: 'TARDANZA',
          estudiante: {
            codigoInterno: '2025-A-ORD-001',
            usuario: { nombres: 'Juan', apellidos: 'Pérez' },
          },
        },
        {
          estudianteId: 2,
          estado: 'PRESENTE',
          estudiante: {
            codigoInterno: '2025-A-ORD-002',
            usuario: { nombres: 'María', apellidos: 'García' },
          },
        },
      ];

      prisma.asistencia.findMany.mockResolvedValue(mockAsistencias);

      const result = await attendanceRepository.getSummaryByGroup(1);

      expect(result).toHaveLength(2);
      expect(result[0].estudianteId).toBe(1);
      expect(result[0].totalClases).toBe(2);
      expect(result[0].presentes).toBe(1);
      expect(result[0].tardanzas).toBe(1);
      expect(result[0].porcentajeAsistencia).toBe(100);
    });
  });

  describe('list', () => {
    it('should list attendances with filters and pagination', async () => {
      const mockAsistencias = [
        {
          asistenciaId: 1,
          estudianteId: 1,
          grupoId: 1,
          fechaClase: new Date('2025-01-15'),
          estado: 'PRESENTE',
        },
      ];

      prisma.asistencia.findMany.mockResolvedValue(mockAsistencias);
      prisma.asistencia.count.mockResolvedValue(1);

      const filters = { grupoId: 1 };
      const pagination = { page: 1, limit: 10 };

      const result = await attendanceRepository.list(filters, pagination);

      expect(result.asistencias).toEqual(mockAsistencias);
      expect(result.total).toBe(1);
    });
  });

  describe('existsForDate', () => {
    it('should return true when attendance exists', async () => {
      prisma.asistencia.count.mockResolvedValue(1);

      const result = await attendanceRepository.existsForDate(1, 1, '2025-01-15');

      expect(result).toBe(true);
    });

    it('should return false when attendance does not exist', async () => {
      prisma.asistencia.count.mockResolvedValue(0);

      const result = await attendanceRepository.existsForDate(1, 1, '2025-01-15');

      expect(result).toBe(false);
    });
  });
});
