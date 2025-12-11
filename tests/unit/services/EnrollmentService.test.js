const EnrollmentService = require('../../../src/services/EnrollmentService');
const {
  ValidationError,
  BusinessLogicError,
} = require('../../../src/utils/errors');

describe('EnrollmentService', () => {
  let enrollmentService;
  let mockEnrollmentRepository;
  let mockGroupRepository;
  let mockStudentRepository;

  beforeEach(() => {
    mockEnrollmentRepository = {
      findActiveByStudent: jest.fn(),
    };
    mockGroupRepository = {
      findWithEnrollmentCount: jest.fn(),
    };
    mockStudentRepository = {
      findByIdWithUser: jest.fn(),
    };
    enrollmentService = new EnrollmentService(
      mockEnrollmentRepository,
      mockGroupRepository,
      mockStudentRepository
    );
  });

  describe('validateEnrollmentData', () => {
    it('should validate required estudianteId', () => {
      const enrollmentData = {
        grupoId: 1,
        montoPagado: 500,
      };

      try {
        enrollmentService.validateEnrollmentData(enrollmentData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.estudianteId).toBe(
          'ID del estudiante es requerido'
        );
      }
    });

    it('should validate estudianteId is a positive integer', () => {
      const enrollmentData = {
        estudianteId: -1,
        grupoId: 1,
        montoPagado: 500,
      };

      expect(() =>
        enrollmentService.validateEnrollmentData(enrollmentData)
      ).toThrow(ValidationError);
    });

    it('should validate required grupoId', () => {
      const enrollmentData = {
        estudianteId: 1,
        montoPagado: 500,
      };

      try {
        enrollmentService.validateEnrollmentData(enrollmentData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.grupoId).toBe('ID del grupo es requerido');
      }
    });

    it('should validate grupoId is a positive integer', () => {
      const enrollmentData = {
        estudianteId: 1,
        grupoId: 0,
        montoPagado: 500,
      };

      expect(() =>
        enrollmentService.validateEnrollmentData(enrollmentData)
      ).toThrow(ValidationError);
    });

    it('should validate required montoPagado', () => {
      const enrollmentData = {
        estudianteId: 1,
        grupoId: 1,
      };

      try {
        enrollmentService.validateEnrollmentData(enrollmentData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.details.montoPagado).toBe('Monto pagado es requerido');
      }
    });

    it('should validate montoPagado is non-negative', () => {
      const enrollmentData = {
        estudianteId: 1,
        grupoId: 1,
        montoPagado: -100,
      };

      expect(() =>
        enrollmentService.validateEnrollmentData(enrollmentData)
      ).toThrow(ValidationError);
    });

    it('should pass validation with valid data', () => {
      const enrollmentData = {
        estudianteId: 1,
        grupoId: 1,
        montoPagado: 500,
      };

      expect(() =>
        enrollmentService.validateEnrollmentData(enrollmentData)
      ).not.toThrow();
    });
  });

  describe('validateAvailableCapacity', () => {
    it('should throw error when group not found', async () => {
      mockGroupRepository.findWithEnrollmentCount.mockResolvedValue(null);

      await expect(
        enrollmentService.validateAvailableCapacity(1)
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        enrollmentService.validateAvailableCapacity(1)
      ).rejects.toThrow('Grupo no encontrado');
    });

    it('should throw error when no capacity available', async () => {
      const grupo = {
        grupoId: 1,
        capacidad: 30,
        cuposDisponibles: 0,
      };
      mockGroupRepository.findWithEnrollmentCount.mockResolvedValue(grupo);

      await expect(
        enrollmentService.validateAvailableCapacity(1)
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        enrollmentService.validateAvailableCapacity(1)
      ).rejects.toThrow('El grupo no tiene cupos disponibles');
    });

    it('should return group when capacity is available', async () => {
      const grupo = {
        grupoId: 1,
        capacidad: 30,
        cuposDisponibles: 5,
      };
      mockGroupRepository.findWithEnrollmentCount.mockResolvedValue(grupo);

      const result = await enrollmentService.validateAvailableCapacity(1);

      expect(result).toEqual(grupo);
    });
  });

  describe('validateModalidadMatch', () => {
    it('should throw error when student not found', async () => {
      mockStudentRepository.findByIdWithUser.mockResolvedValue(null);

      const grupo = { modalidad: 'ORDINARIO' };

      await expect(
        enrollmentService.validateModalidadMatch(1, grupo)
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        enrollmentService.validateModalidadMatch(1, grupo)
      ).rejects.toThrow('Estudiante no encontrado');
    });

    it('should throw error when modalidad does not match', async () => {
      const estudiante = {
        estudianteId: 1,
        modalidad: 'ORDINARIO',
      };
      mockStudentRepository.findByIdWithUser.mockResolvedValue(estudiante);

      const grupo = { modalidad: 'PRIMERA_OPCION' };

      await expect(
        enrollmentService.validateModalidadMatch(1, grupo)
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        enrollmentService.validateModalidadMatch(1, grupo)
      ).rejects.toThrow(
        'La modalidad del estudiante (ORDINARIO) no coincide con la modalidad del grupo (PRIMERA_OPCION)'
      );
    });

    it('should return student when modalidad matches', async () => {
      const estudiante = {
        estudianteId: 1,
        modalidad: 'ORDINARIO',
      };
      mockStudentRepository.findByIdWithUser.mockResolvedValue(estudiante);

      const grupo = { modalidad: 'ORDINARIO' };

      const result = await enrollmentService.validateModalidadMatch(1, grupo);

      expect(result).toEqual(estudiante);
    });
  });

  describe('validateNoActiveEnrollment', () => {
    it('should throw error when student already enrolled', async () => {
      const activeEnrollment = {
        matriculaId: 1,
        estudianteId: 1,
        grupo: {
          nombreGrupo: 'Grupo A',
        },
      };
      mockEnrollmentRepository.findActiveByStudent.mockResolvedValue(
        activeEnrollment
      );

      await expect(
        enrollmentService.validateNoActiveEnrollment(1)
      ).rejects.toThrow(BusinessLogicError);
      await expect(
        enrollmentService.validateNoActiveEnrollment(1)
      ).rejects.toThrow('El estudiante ya está matriculado en el grupo Grupo A');
    });

    it('should not throw error when student has no active enrollment', async () => {
      mockEnrollmentRepository.findActiveByStudent.mockResolvedValue(null);

      await expect(
        enrollmentService.validateNoActiveEnrollment(1)
      ).resolves.not.toThrow();
    });
  });

  describe('validateWithdrawalReason', () => {
    it('should throw error when motivo is empty', () => {
      expect(() =>
        enrollmentService.validateWithdrawalReason('')
      ).toThrow(ValidationError);
      expect(() =>
        enrollmentService.validateWithdrawalReason('')
      ).toThrow('Motivo de retiro es requerido');
    });

    it('should throw error when motivo is too short', () => {
      expect(() =>
        enrollmentService.validateWithdrawalReason('corto')
      ).toThrow(ValidationError);
      expect(() =>
        enrollmentService.validateWithdrawalReason('corto')
      ).toThrow('Motivo de retiro debe tener al menos 10 caracteres');
    });

    it('should not throw error with valid motivo', () => {
      expect(() =>
        enrollmentService.validateWithdrawalReason(
          'Motivo válido con más de 10 caracteres'
        )
      ).not.toThrow();
    });
  });
});
