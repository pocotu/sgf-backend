const EnrollStudentUseCase = require('../../../src/use-cases/EnrollStudentUseCase');
const GetEnrollmentsUseCase = require('../../../src/use-cases/GetEnrollmentsUseCase');
const WithdrawStudentUseCase = require('../../../src/use-cases/WithdrawStudentUseCase');
const { NotFoundError } = require('../../../src/utils/errors');

describe('Enrollment Use Cases', () => {
  describe('EnrollStudentUseCase', () => {
    let enrollStudentUseCase;
    let mockEnrollmentRepository;
    let mockEnrollmentService;

    beforeEach(() => {
      mockEnrollmentRepository = {
        create: jest.fn(),
        findByIdWithRelations: jest.fn(),
      };
      mockEnrollmentService = {
        validateEnrollmentData: jest.fn(),
        validateNoActiveEnrollment: jest.fn(),
        validateAvailableCapacity: jest.fn(),
        validateModalidadMatch: jest.fn(),
      };
      enrollStudentUseCase = new EnrollStudentUseCase(
        mockEnrollmentRepository,
        mockEnrollmentService
      );
    });

    it('should enroll student successfully', async () => {
      const enrollmentData = {
        estudianteId: 1,
        grupoId: 1,
        montoPagado: 500,
      };

      const grupo = {
        grupoId: 1,
        modalidad: 'ORDINARIO',
        cuposDisponibles: 5,
      };

      const createdEnrollment = {
        matriculaId: 1,
        estudianteId: 1,
        grupoId: 1,
        montoPagado: 500,
        estado: 'MATRICULADO',
      };

      const enrollmentWithRelations = {
        ...createdEnrollment,
        estudiante: { estudianteId: 1 },
        grupo: { grupoId: 1 },
      };

      mockEnrollmentService.validateAvailableCapacity.mockResolvedValue(grupo);
      mockEnrollmentRepository.create.mockResolvedValue(createdEnrollment);
      mockEnrollmentRepository.findByIdWithRelations.mockResolvedValue(enrollmentWithRelations);

      const result = await enrollStudentUseCase.execute(enrollmentData);

      expect(mockEnrollmentService.validateEnrollmentData).toHaveBeenCalledWith(enrollmentData);
      expect(mockEnrollmentService.validateNoActiveEnrollment).toHaveBeenCalledWith(1);
      expect(mockEnrollmentService.validateAvailableCapacity).toHaveBeenCalledWith(1);
      expect(mockEnrollmentService.validateModalidadMatch).toHaveBeenCalledWith(1, grupo);
      expect(mockEnrollmentRepository.create).toHaveBeenCalled();
      expect(result).toEqual(enrollmentWithRelations);
    });

    it('should validate all business rules before enrolling', async () => {
      const enrollmentData = {
        estudianteId: 1,
        grupoId: 1,
        montoPagado: 500,
      };

      const grupo = { grupoId: 1, modalidad: 'ORDINARIO' };
      mockEnrollmentService.validateAvailableCapacity.mockResolvedValue(grupo);
      mockEnrollmentRepository.create.mockResolvedValue({
        matriculaId: 1,
      });
      mockEnrollmentRepository.findByIdWithRelations.mockResolvedValue({});

      await enrollStudentUseCase.execute(enrollmentData);

      expect(mockEnrollmentService.validateEnrollmentData).toHaveBeenCalled();
      expect(mockEnrollmentService.validateNoActiveEnrollment).toHaveBeenCalled();
      expect(mockEnrollmentService.validateAvailableCapacity).toHaveBeenCalled();
      expect(mockEnrollmentService.validateModalidadMatch).toHaveBeenCalled();
    });
  });

  describe('GetEnrollmentsUseCase', () => {
    let getEnrollmentsUseCase;
    let mockEnrollmentRepository;

    beforeEach(() => {
      mockEnrollmentRepository = {
        list: jest.fn(),
      };
      getEnrollmentsUseCase = new GetEnrollmentsUseCase(mockEnrollmentRepository);
    });

    it('should list enrollments with pagination', async () => {
      const filters = { grupoId: 1, estado: 'MATRICULADO' };
      const pagination = { page: 1, limit: 10 };

      const mockResult = {
        matriculas: [{ matriculaId: 1 }, { matriculaId: 2 }],
        total: 25,
      };

      mockEnrollmentRepository.list.mockResolvedValue(mockResult);

      const result = await getEnrollmentsUseCase.execute(filters, pagination);

      expect(mockEnrollmentRepository.list).toHaveBeenCalledWith(filters, {
        page: 1,
        limit: 10,
      });
      expect(result.matriculas).toEqual(mockResult.matriculas);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('should use default pagination values', async () => {
      mockEnrollmentRepository.list.mockResolvedValue({
        matriculas: [],
        total: 0,
      });

      const result = await getEnrollmentsUseCase.execute({}, {});

      expect(mockEnrollmentRepository.list).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('WithdrawStudentUseCase', () => {
    let withdrawStudentUseCase;
    let mockEnrollmentRepository;
    let mockEnrollmentService;

    beforeEach(() => {
      mockEnrollmentRepository = {
        findByIdWithRelations: jest.fn(),
        withdraw: jest.fn(),
      };
      mockEnrollmentService = {
        validateWithdrawalReason: jest.fn(),
      };
      withdrawStudentUseCase = new WithdrawStudentUseCase(
        mockEnrollmentRepository,
        mockEnrollmentService
      );
    });

    it('should withdraw student successfully', async () => {
      const matriculaId = 1;
      const motivoRetiro = 'Motivo válido de retiro';

      const enrollment = {
        matriculaId: 1,
        estado: 'MATRICULADO',
      };

      const updatedEnrollment = {
        matriculaId: 1,
        estado: 'RETIRADO',
      };

      const enrollmentWithRelations = {
        ...updatedEnrollment,
        estudiante: {},
        grupo: {},
      };

      mockEnrollmentRepository.findByIdWithRelations
        .mockResolvedValueOnce(enrollment)
        .mockResolvedValueOnce(enrollmentWithRelations);
      mockEnrollmentRepository.withdraw.mockResolvedValue(updatedEnrollment);

      const result = await withdrawStudentUseCase.execute(matriculaId, motivoRetiro);

      expect(mockEnrollmentService.validateWithdrawalReason).toHaveBeenCalledWith(motivoRetiro);
      expect(mockEnrollmentRepository.withdraw).toHaveBeenCalledWith(matriculaId, motivoRetiro);
      expect(result).toEqual(enrollmentWithRelations);
    });

    it('should throw error when enrollment not found', async () => {
      mockEnrollmentRepository.findByIdWithRelations.mockResolvedValue(null);

      await expect(withdrawStudentUseCase.execute(999, 'Motivo válido')).rejects.toThrow(
        NotFoundError
      );
      await expect(withdrawStudentUseCase.execute(999, 'Motivo válido')).rejects.toThrow(
        'Matrícula no encontrada'
      );
    });

    it('should validate withdrawal reason', async () => {
      const enrollment = { matriculaId: 1 };
      mockEnrollmentRepository.findByIdWithRelations.mockResolvedValue(enrollment);
      mockEnrollmentRepository.withdraw.mockResolvedValue({});
      mockEnrollmentRepository.findByIdWithRelations.mockResolvedValue({});

      await withdrawStudentUseCase.execute(1, 'Motivo válido de retiro');

      expect(mockEnrollmentService.validateWithdrawalReason).toHaveBeenCalledWith(
        'Motivo válido de retiro'
      );
    });
  });
});
