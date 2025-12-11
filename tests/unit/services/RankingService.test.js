const RankingService = require('../../../src/services/RankingService');

describe('RankingService', () => {
  let rankingService;
  let mockGradeRepository;
  let mockEnrollmentRepository;

  beforeEach(() => {
    mockGradeRepository = {
      calculateAverageByEvaluation: jest.fn(),
      calculateGeneralAverage: jest.fn(),
      model: {
        findMany: jest.fn(),
      },
    };
    mockEnrollmentRepository = {
      model: {
        findMany: jest.fn(),
      },
      findActiveByStudent: jest.fn(),
    };

    rankingService = new RankingService(mockGradeRepository, mockEnrollmentRepository);
  });

  describe('calculateGroupRanking', () => {
    describe('ordenamiento por promedio', () => {
      it('should order students by average descending', async () => {
        const mockMatriculas = [
          {
            estudianteId: 1,
            estudiante: {
              codigoInterno: '2025-A-ORD-001',
              usuario: { nombres: 'Juan', apellidos: 'Pérez' },
            },
          },
          {
            estudianteId: 2,
            estudiante: {
              codigoInterno: '2025-A-ORD-002',
              usuario: { nombres: 'María', apellidos: 'García' },
            },
          },
          {
            estudianteId: 3,
            estudiante: {
              codigoInterno: '2025-A-ORD-003',
              usuario: { nombres: 'Pedro', apellidos: 'López' },
            },
          },
        ];

        mockEnrollmentRepository.model.findMany.mockResolvedValue(mockMatriculas);
        mockGradeRepository.calculateGeneralAverage
          .mockResolvedValueOnce(15.5)
          .mockResolvedValueOnce(18.0)
          .mockResolvedValueOnce(16.5);
        mockGradeRepository.model.findMany.mockResolvedValue([]);

        const result = await rankingService.calculateGroupRanking(1);

        expect(result.ranking).toHaveLength(3);
        expect(result.ranking[0].posicion).toBe(1);
        expect(result.ranking[0].promedio).toBe(18.0);
        expect(result.ranking[0].estudianteId).toBe(2);
        expect(result.ranking[1].posicion).toBe(2);
        expect(result.ranking[1].promedio).toBe(16.5);
        expect(result.ranking[1].estudianteId).toBe(3);
        expect(result.ranking[2].posicion).toBe(3);
        expect(result.ranking[2].promedio).toBe(15.5);
        expect(result.ranking[2].estudianteId).toBe(1);
      });

      it('should handle students with same average', async () => {
        const mockMatriculas = [
          {
            estudianteId: 1,
            estudiante: {
              codigoInterno: '2025-A-ORD-001',
              usuario: { nombres: 'Juan', apellidos: 'Pérez' },
            },
          },
          {
            estudianteId: 2,
            estudiante: {
              codigoInterno: '2025-A-ORD-002',
              usuario: { nombres: 'María', apellidos: 'García' },
            },
          },
        ];

        mockEnrollmentRepository.model.findMany.mockResolvedValue(mockMatriculas);
        mockGradeRepository.calculateGeneralAverage
          .mockResolvedValueOnce(15.5)
          .mockResolvedValueOnce(15.5);
        mockGradeRepository.model.findMany.mockResolvedValue([]);

        const result = await rankingService.calculateGroupRanking(1);

        expect(result.ranking).toHaveLength(2);
        expect(result.ranking[0].promedio).toBe(15.5);
        expect(result.ranking[1].promedio).toBe(15.5);
      });
    });

    describe('cálculo de promedio del grupo', () => {
      it('should calculate group average correctly', async () => {
        const mockMatriculas = [
          {
            estudianteId: 1,
            estudiante: {
              codigoInterno: '2025-A-ORD-001',
              usuario: { nombres: 'Juan', apellidos: 'Pérez' },
            },
          },
          {
            estudianteId: 2,
            estudiante: {
              codigoInterno: '2025-A-ORD-002',
              usuario: { nombres: 'María', apellidos: 'García' },
            },
          },
        ];

        mockEnrollmentRepository.model.findMany.mockResolvedValue(mockMatriculas);
        mockGradeRepository.calculateGeneralAverage
          .mockResolvedValueOnce(14.0)
          .mockResolvedValueOnce(16.0);
        mockGradeRepository.model.findMany.mockResolvedValue([]);

        const result = await rankingService.calculateGroupRanking(1);

        expect(result.promedioGrupo).toBe(15.0);
      });

      it('should return 0 for empty group', async () => {
        mockEnrollmentRepository.model.findMany.mockResolvedValue([]);

        const result = await rankingService.calculateGroupRanking(1);

        expect(result.promedioGrupo).toBe(0);
        expect(result.ranking).toHaveLength(0);
      });
    });

    describe('cálculo de cursos aprobados', () => {
      it('should calculate approved courses (nota >= 11)', async () => {
        const mockMatriculas = [
          {
            estudianteId: 1,
            estudiante: {
              codigoInterno: '2025-A-ORD-001',
              usuario: { nombres: 'Juan', apellidos: 'Pérez' },
            },
          },
        ];

        const mockNotas = [
          { nota: '15.0', cursoId: 1 },
          { nota: '12.0', cursoId: 2 },
          { nota: '10.5', cursoId: 3 },
          { nota: '18.0', cursoId: 4 },
        ];

        mockEnrollmentRepository.model.findMany.mockResolvedValue(mockMatriculas);
        mockGradeRepository.calculateGeneralAverage.mockResolvedValue(14.0);
        mockGradeRepository.model.findMany.mockResolvedValue(mockNotas);

        const result = await rankingService.calculateGroupRanking(1);

        expect(result.ranking[0].cursosAprobados).toBe(3);
      });

      it('should count course as approved when average is exactly 11', async () => {
        const mockMatriculas = [
          {
            estudianteId: 1,
            estudiante: {
              codigoInterno: '2025-A-ORD-001',
              usuario: { nombres: 'Juan', apellidos: 'Pérez' },
            },
          },
        ];

        const mockNotas = [
          { nota: '11.0', cursoId: 1 },
          { nota: '10.9', cursoId: 2 },
        ];

        mockEnrollmentRepository.model.findMany.mockResolvedValue(mockMatriculas);
        mockGradeRepository.calculateGeneralAverage.mockResolvedValue(11.0);
        mockGradeRepository.model.findMany.mockResolvedValue(mockNotas);

        const result = await rankingService.calculateGroupRanking(1);

        expect(result.ranking[0].cursosAprobados).toBe(1);
      });
    });

    describe('filtrado por evaluación', () => {
      it('should calculate ranking for specific evaluation', async () => {
        const mockMatriculas = [
          {
            estudianteId: 1,
            estudiante: {
              codigoInterno: '2025-A-ORD-001',
              usuario: { nombres: 'Juan', apellidos: 'Pérez' },
            },
          },
        ];

        mockEnrollmentRepository.model.findMany.mockResolvedValue(mockMatriculas);
        mockGradeRepository.calculateAverageByEvaluation.mockResolvedValue(16.0);
        mockGradeRepository.model.findMany.mockResolvedValue([]);

        const result = await rankingService.calculateGroupRanking(1, 5);

        expect(result.evaluacionId).toBe(5);
        expect(mockGradeRepository.calculateAverageByEvaluation).toHaveBeenCalledWith(5, 1);
      });
    });
  });

  describe('getStudentPosition', () => {
    describe('cálculo de posición', () => {
      it('should return student position in ranking', async () => {
        const mockMatricula = {
          grupoId: 1,
        };

        const mockMatriculas = [
          {
            estudianteId: 1,
            estudiante: {
              codigoInterno: '2025-A-ORD-001',
              usuario: { nombres: 'Juan', apellidos: 'Pérez' },
            },
          },
          {
            estudianteId: 2,
            estudiante: {
              codigoInterno: '2025-A-ORD-002',
              usuario: { nombres: 'María', apellidos: 'García' },
            },
          },
        ];

        mockEnrollmentRepository.findActiveByStudent.mockResolvedValue(mockMatricula);
        mockEnrollmentRepository.model.findMany.mockResolvedValue(mockMatriculas);
        mockGradeRepository.calculateGeneralAverage
          .mockResolvedValueOnce(15.0)
          .mockResolvedValueOnce(18.0);
        mockGradeRepository.model.findMany.mockResolvedValue([]);

        const result = await rankingService.getStudentPosition(1);

        expect(result.posicion).toBe(2);
        expect(result.totalEstudiantes).toBe(2);
      });

      it('should return null when student has no active enrollment', async () => {
        mockEnrollmentRepository.findActiveByStudent.mockResolvedValue(null);

        const result = await rankingService.getStudentPosition(1);

        expect(result).toBeNull();
      });
    });

    describe('cálculo de diferencia con primer lugar', () => {
      it('should calculate difference with first place', async () => {
        const mockMatricula = {
          grupoId: 1,
        };

        const mockMatriculas = [
          {
            estudianteId: 1,
            estudiante: {
              codigoInterno: '2025-A-ORD-001',
              usuario: { nombres: 'Juan', apellidos: 'Pérez' },
            },
          },
          {
            estudianteId: 2,
            estudiante: {
              codigoInterno: '2025-A-ORD-002',
              usuario: { nombres: 'María', apellidos: 'García' },
            },
          },
        ];

        mockEnrollmentRepository.findActiveByStudent.mockResolvedValue(mockMatricula);
        mockEnrollmentRepository.model.findMany.mockResolvedValue(mockMatriculas);
        mockGradeRepository.calculateGeneralAverage
          .mockResolvedValueOnce(15.0)
          .mockResolvedValueOnce(18.0);
        mockGradeRepository.model.findMany.mockResolvedValue([]);

        const result = await rankingService.getStudentPosition(1);

        expect(result.diferenciaConPrimero).toBe(3.0);
        expect(result.promedio).toBe(15.0);
      });

      it('should return 0 difference when student is first place', async () => {
        const mockMatricula = {
          grupoId: 1,
        };

        const mockMatriculas = [
          {
            estudianteId: 1,
            estudiante: {
              codigoInterno: '2025-A-ORD-001',
              usuario: { nombres: 'Juan', apellidos: 'Pérez' },
            },
          },
        ];

        mockEnrollmentRepository.findActiveByStudent.mockResolvedValue(mockMatricula);
        mockEnrollmentRepository.model.findMany.mockResolvedValue(mockMatriculas);
        mockGradeRepository.calculateGeneralAverage.mockResolvedValue(18.0);
        mockGradeRepository.model.findMany.mockResolvedValue([]);

        const result = await rankingService.getStudentPosition(1);

        expect(result.posicion).toBe(1);
        expect(result.diferenciaConPrimero).toBe(0);
      });
    });
  });

  describe('calculateApprovedCourses', () => {
    it('should calculate approved courses with multiple grades per course', async () => {
      const mockNotas = [
        { nota: '15.0', cursoId: 1 },
        { nota: '16.0', cursoId: 1 },
        { nota: '10.0', cursoId: 2 },
        { nota: '12.0', cursoId: 2 },
      ];

      mockGradeRepository.model.findMany.mockResolvedValue(mockNotas);

      const result = await rankingService.calculateApprovedCourses(1, 1);

      expect(result).toBe(2);
    });

    it('should return 0 when no courses are approved', async () => {
      const mockNotas = [
        { nota: '8.0', cursoId: 1 },
        { nota: '9.0', cursoId: 2 },
      ];

      mockGradeRepository.model.findMany.mockResolvedValue(mockNotas);

      const result = await rankingService.calculateApprovedCourses(1, 1);

      expect(result).toBe(0);
    });
  });
});
