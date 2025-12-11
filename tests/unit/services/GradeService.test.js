const GradeService = require('../../../src/services/GradeService');
const { ValidationError, BusinessLogicError } = require('../../../src/utils/errors');

describe('GradeService', () => {
  let gradeService;
  let mockGradeRepository;
  let mockEnrollmentRepository;
  let mockEvaluationRepository;
  let mockCourseRepository;

  beforeEach(() => {
    mockGradeRepository = {
      existsDuplicate: jest.fn(),
    };
    mockEnrollmentRepository = {
      findOne: jest.fn(),
    };
    mockEvaluationRepository = {
      model: {
        findUnique: jest.fn(),
      },
    };
    mockCourseRepository = {
      findById: jest.fn(),
    };

    gradeService = new GradeService(
      mockGradeRepository,
      mockEnrollmentRepository,
      mockEvaluationRepository,
      mockCourseRepository
    );
  });

  describe('validateGradeData', () => {
    describe('validación de rango de nota', () => {
      it('should validate nota is in range 0-20', () => {
        const gradeData = {
          evaluacionId: 1,
          estudianteId: 1,
          cursoId: 1,
          nota: 21,
        };

        try {
          gradeService.validateGradeData(gradeData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.nota).toBe('Nota debe estar en el rango 0-20');
        }
      });

      it('should reject negative nota', () => {
        const gradeData = {
          evaluacionId: 1,
          estudianteId: 1,
          cursoId: 1,
          nota: -1,
        };

        expect(() => gradeService.validateGradeData(gradeData)).toThrow(ValidationError);
      });

      it('should accept nota 0', () => {
        const gradeData = {
          evaluacionId: 1,
          estudianteId: 1,
          cursoId: 1,
          nota: 0,
        };

        expect(() => gradeService.validateGradeData(gradeData)).not.toThrow();
      });

      it('should accept nota 20', () => {
        const gradeData = {
          evaluacionId: 1,
          estudianteId: 1,
          cursoId: 1,
          nota: 20,
        };

        expect(() => gradeService.validateGradeData(gradeData)).not.toThrow();
      });

      it('should accept decimal nota', () => {
        const gradeData = {
          evaluacionId: 1,
          estudianteId: 1,
          cursoId: 1,
          nota: 15.5,
        };

        expect(() => gradeService.validateGradeData(gradeData)).not.toThrow();
      });
    });

    describe('validación de campos requeridos', () => {
      it('should require evaluacionId', () => {
        const gradeData = {
          estudianteId: 1,
          cursoId: 1,
          nota: 15,
        };

        try {
          gradeService.validateGradeData(gradeData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.evaluacionId).toBe('ID de evaluación es requerido');
        }
      });

      it('should require estudianteId', () => {
        const gradeData = {
          evaluacionId: 1,
          cursoId: 1,
          nota: 15,
        };

        try {
          gradeService.validateGradeData(gradeData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.estudianteId).toBe('ID de estudiante es requerido');
        }
      });

      it('should require cursoId', () => {
        const gradeData = {
          evaluacionId: 1,
          estudianteId: 1,
          nota: 15,
        };

        try {
          gradeService.validateGradeData(gradeData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.cursoId).toBe('ID de curso es requerido');
        }
      });

      it('should require nota', () => {
        const gradeData = {
          evaluacionId: 1,
          estudianteId: 1,
          cursoId: 1,
        };

        try {
          gradeService.validateGradeData(gradeData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.nota).toBe('Nota es requerida');
        }
      });
    });

    describe('validación de observaciones', () => {
      it('should validate observaciones length', () => {
        const gradeData = {
          evaluacionId: 1,
          estudianteId: 1,
          cursoId: 1,
          nota: 15,
          observaciones: 'a'.repeat(501),
        };

        try {
          gradeService.validateGradeData(gradeData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.observaciones).toBe(
            'Observaciones no pueden exceder 500 caracteres'
          );
        }
      });

      it('should accept valid observaciones', () => {
        const gradeData = {
          evaluacionId: 1,
          estudianteId: 1,
          cursoId: 1,
          nota: 15,
          observaciones: 'Excelente desempeño',
        };

        expect(() => gradeService.validateGradeData(gradeData)).not.toThrow();
      });
    });
  });

  describe('validateStudentEnrolled', () => {
    it('should throw error when student is not enrolled', async () => {
      mockEnrollmentRepository.findOne.mockResolvedValue(null);

      await expect(gradeService.validateStudentEnrolled(1, 1)).rejects.toThrow(BusinessLogicError);

      await expect(gradeService.validateStudentEnrolled(1, 1)).rejects.toThrow(
        'El estudiante no está matriculado en el grupo de esta evaluación'
      );
    });

    it('should not throw error when student is enrolled', async () => {
      const mockMatricula = {
        matriculaId: 1,
        estudianteId: 1,
        grupoId: 1,
        estado: 'MATRICULADO',
      };
      mockEnrollmentRepository.findOne.mockResolvedValue(mockMatricula);

      await expect(gradeService.validateStudentEnrolled(1, 1)).resolves.not.toThrow();
    });

    it('should return the matricula when student is enrolled', async () => {
      const mockMatricula = {
        matriculaId: 1,
        estudianteId: 1,
        grupoId: 1,
        estado: 'MATRICULADO',
      };
      mockEnrollmentRepository.findOne.mockResolvedValue(mockMatricula);

      const result = await gradeService.validateStudentEnrolled(1, 1);

      expect(result).toEqual(mockMatricula);
    });
  });

  describe('validateCourseArea', () => {
    it('should throw error when course does not exist', async () => {
      mockCourseRepository.findById.mockResolvedValue(null);

      await expect(gradeService.validateCourseArea(999, 'A')).rejects.toThrow(BusinessLogicError);

      await expect(gradeService.validateCourseArea(999, 'A')).rejects.toThrow(
        'El curso especificado no existe'
      );
    });

    it('should throw error when course area does not match group area', async () => {
      const mockCurso = {
        cursoId: 1,
        nombre: 'Matemática',
        area: 'B',
      };
      mockCourseRepository.findById.mockResolvedValue(mockCurso);

      await expect(gradeService.validateCourseArea(1, 'A')).rejects.toThrow(BusinessLogicError);

      await expect(gradeService.validateCourseArea(1, 'A')).rejects.toThrow(
        'El curso pertenece al área B, pero el grupo es del área A'
      );
    });

    it('should not throw error when course area matches group area', async () => {
      const mockCurso = {
        cursoId: 1,
        nombre: 'Matemática',
        area: 'A',
      };
      mockCourseRepository.findById.mockResolvedValue(mockCurso);

      await expect(gradeService.validateCourseArea(1, 'A')).resolves.not.toThrow();
    });

    it('should return the course when area matches', async () => {
      const mockCurso = {
        cursoId: 1,
        nombre: 'Matemática',
        area: 'A',
      };
      mockCourseRepository.findById.mockResolvedValue(mockCurso);

      const result = await gradeService.validateCourseArea(1, 'A');

      expect(result).toEqual(mockCurso);
    });
  });

  describe('validateNoDuplicate', () => {
    it('should throw error when duplicate grade exists', async () => {
      mockGradeRepository.existsDuplicate.mockResolvedValue(true);

      await expect(gradeService.validateNoDuplicate(1, 1, 1)).rejects.toThrow(BusinessLogicError);

      await expect(gradeService.validateNoDuplicate(1, 1, 1)).rejects.toThrow(
        'Ya existe una nota registrada para este estudiante, curso y evaluación'
      );
    });

    it('should not throw error when no duplicate exists', async () => {
      mockGradeRepository.existsDuplicate.mockResolvedValue(false);

      await expect(gradeService.validateNoDuplicate(1, 1, 1)).resolves.not.toThrow();
    });
  });

  describe('validateGradeBusinessRules', () => {
    it('should validate all business rules successfully', async () => {
      const mockEvaluacion = {
        evaluacionId: 1,
        grupoId: 1,
        grupo: {
          grupoId: 1,
          area: 'A',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo 1',
        },
      };
      const mockMatricula = {
        matriculaId: 1,
        estudianteId: 1,
        grupoId: 1,
        estado: 'MATRICULADO',
      };
      const mockCurso = {
        cursoId: 1,
        nombre: 'Matemática',
        area: 'A',
      };

      mockEvaluationRepository.model.findUnique.mockResolvedValue(mockEvaluacion);
      mockEnrollmentRepository.findOne.mockResolvedValue(mockMatricula);
      mockCourseRepository.findById.mockResolvedValue(mockCurso);
      mockGradeRepository.existsDuplicate.mockResolvedValue(false);

      const gradeData = {
        evaluacionId: 1,
        estudianteId: 1,
        cursoId: 1,
        nota: 15,
      };

      const result = await gradeService.validateGradeBusinessRules(gradeData);

      expect(result).toHaveProperty('evaluacion');
      expect(result).toHaveProperty('matricula');
      expect(result).toHaveProperty('curso');
      expect(result.evaluacion).toEqual(mockEvaluacion);
      expect(result.matricula).toEqual(mockMatricula);
      expect(result.curso).toEqual(mockCurso);
    });

    it('should fail when evaluation does not exist', async () => {
      mockEvaluationRepository.model.findUnique.mockResolvedValue(null);

      const gradeData = {
        evaluacionId: 999,
        estudianteId: 1,
        cursoId: 1,
        nota: 15,
      };

      await expect(gradeService.validateGradeBusinessRules(gradeData)).rejects.toThrow(
        'La evaluación especificada no existe'
      );
    });
  });
});
