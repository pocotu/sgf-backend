const AttendanceService = require('../../../src/services/AttendanceService');
const { ValidationError, BusinessLogicError } = require('../../../src/utils/errors');

describe('AttendanceService', () => {
  let attendanceService;
  let mockAttendanceRepository;
  let mockEnrollmentRepository;

  beforeEach(() => {
    mockAttendanceRepository = {
      existsForDate: jest.fn(),
    };
    mockEnrollmentRepository = {
      findOne: jest.fn(),
    };
    attendanceService = new AttendanceService(mockAttendanceRepository, mockEnrollmentRepository);
  });

  describe('validateAttendanceData', () => {
    it('should validate required estudianteId', () => {
      const attendanceData = {
        grupoId: 1,
        fechaClase: '2025-01-15',
        estado: 'PRESENTE',
      };

      try {
        attendanceService.validateAttendanceData(attendanceData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.estudianteId).toBe('ID del estudiante es requerido');
      }
    });

    it('should validate estudianteId is a positive integer', () => {
      const attendanceData = {
        estudianteId: -1,
        grupoId: 1,
        fechaClase: '2025-01-15',
        estado: 'PRESENTE',
      };

      expect(() => attendanceService.validateAttendanceData(attendanceData)).toThrow(
        ValidationError
      );
    });

    it('should validate required grupoId', () => {
      const attendanceData = {
        estudianteId: 1,
        fechaClase: '2025-01-15',
        estado: 'PRESENTE',
      };

      try {
        attendanceService.validateAttendanceData(attendanceData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.grupoId).toBe('ID del grupo es requerido');
      }
    });

    it('should validate required fechaClase', () => {
      const attendanceData = {
        estudianteId: 1,
        grupoId: 1,
        estado: 'PRESENTE',
      };

      try {
        attendanceService.validateAttendanceData(attendanceData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.fechaClase).toBe('Fecha de clase es requerida');
      }
    });

    it('should validate fechaClase is a valid date', () => {
      const attendanceData = {
        estudianteId: 1,
        grupoId: 1,
        fechaClase: 'invalid-date',
        estado: 'PRESENTE',
      };

      expect(() => attendanceService.validateAttendanceData(attendanceData)).toThrow(
        ValidationError
      );
    });

    it('should validate required estado', () => {
      const attendanceData = {
        estudianteId: 1,
        grupoId: 1,
        fechaClase: '2025-01-15',
      };

      try {
        attendanceService.validateAttendanceData(attendanceData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.estado).toBe('Estado de asistencia es requerido');
      }
    });

    it('should validate estado is valid', () => {
      const attendanceData = {
        estudianteId: 1,
        grupoId: 1,
        fechaClase: '2025-01-15',
        estado: 'INVALID',
      };

      expect(() => attendanceService.validateAttendanceData(attendanceData)).toThrow(
        ValidationError
      );
    });

    it('should validate horaRegistro format if present', () => {
      const attendanceData = {
        estudianteId: 1,
        grupoId: 1,
        fechaClase: '2025-01-15',
        estado: 'PRESENTE',
        horaRegistro: '25:00',
      };

      expect(() => attendanceService.validateAttendanceData(attendanceData)).toThrow(
        ValidationError
      );
    });

    it('should pass validation with valid data', () => {
      const attendanceData = {
        estudianteId: 1,
        grupoId: 1,
        fechaClase: '2025-01-15',
        estado: 'PRESENTE',
        horaRegistro: '08:30',
      };

      expect(() => attendanceService.validateAttendanceData(attendanceData)).not.toThrow();
    });
  });

  describe('validateBulkAttendanceData', () => {
    it('should validate required grupoId', () => {
      const bulkData = {
        fechaClase: '2025-01-15',
        asistencias: [{ estudianteId: 1, estado: 'PRESENTE' }],
      };

      try {
        attendanceService.validateBulkAttendanceData(bulkData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.grupoId).toBe('ID del grupo es requerido');
      }
    });

    it('should validate asistencias is an array', () => {
      const bulkData = {
        grupoId: 1,
        fechaClase: '2025-01-15',
        asistencias: 'not-an-array',
      };

      expect(() => attendanceService.validateBulkAttendanceData(bulkData)).toThrow(ValidationError);
    });

    it('should validate asistencias is not empty', () => {
      const bulkData = {
        grupoId: 1,
        fechaClase: '2025-01-15',
        asistencias: [],
      };

      expect(() => attendanceService.validateBulkAttendanceData(bulkData)).toThrow(ValidationError);
    });

    it('should validate each asistencia item', () => {
      const bulkData = {
        grupoId: 1,
        fechaClase: '2025-01-15',
        asistencias: [
          { estudianteId: 1, estado: 'PRESENTE' },
          { estudianteId: -1, estado: 'INVALID' },
        ],
      };

      try {
        attendanceService.validateBulkAttendanceData(bulkData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.asistencias).toBeDefined();
        expect(Array.isArray(error.details.asistencias)).toBe(true);
      }
    });

    it('should pass validation with valid bulk data', () => {
      const bulkData = {
        grupoId: 1,
        fechaClase: '2025-01-15',
        asistencias: [
          { estudianteId: 1, estado: 'PRESENTE', horaRegistro: '08:00' },
          { estudianteId: 2, estado: 'TARDANZA', horaRegistro: '08:15' },
        ],
      };

      expect(() => attendanceService.validateBulkAttendanceData(bulkData)).not.toThrow();
    });
  });

  describe('validateNoDuplicate', () => {
    it('should throw error when attendance already exists', async () => {
      mockAttendanceRepository.existsForDate.mockResolvedValue(true);

      await expect(attendanceService.validateNoDuplicate(1, 1, '2025-01-15')).rejects.toThrow(
        BusinessLogicError
      );
      await expect(attendanceService.validateNoDuplicate(1, 1, '2025-01-15')).rejects.toThrow(
        'Ya existe un registro de asistencia para este estudiante en esta fecha'
      );
    });

    it('should not throw error when attendance does not exist', async () => {
      mockAttendanceRepository.existsForDate.mockResolvedValue(false);

      await expect(
        attendanceService.validateNoDuplicate(1, 1, '2025-01-15')
      ).resolves.not.toThrow();
    });
  });

  describe('validateStudentEnrolled', () => {
    it('should throw error when student not enrolled', async () => {
      mockEnrollmentRepository.findOne.mockResolvedValue(null);

      await expect(attendanceService.validateStudentEnrolled(1, 1)).rejects.toThrow(
        BusinessLogicError
      );
      await expect(attendanceService.validateStudentEnrolled(1, 1)).rejects.toThrow(
        'El estudiante no está matriculado en este grupo'
      );
    });

    it('should return enrollment when student is enrolled', async () => {
      const enrollment = {
        matriculaId: 1,
        estudianteId: 1,
        grupoId: 1,
        estado: 'MATRICULADO',
      };
      mockEnrollmentRepository.findOne.mockResolvedValue(enrollment);

      const result = await attendanceService.validateStudentEnrolled(1, 1);

      expect(result).toEqual(enrollment);
    });
  });
});
