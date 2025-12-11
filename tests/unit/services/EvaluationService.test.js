const EvaluationService = require('../../../src/services/EvaluationService');
const { ValidationError, BusinessLogicError } = require('../../../src/utils/errors');

describe('EvaluationService', () => {
  let evaluationService;
  let mockEvaluationRepository;
  let mockGroupRepository;

  beforeEach(() => {
    mockEvaluationRepository = {
      validateWeekNumber: jest.fn(),
    };
    mockGroupRepository = {
      findById: jest.fn(),
    };
    evaluationService = new EvaluationService(mockEvaluationRepository, mockGroupRepository);
  });

  describe('validateEvaluationData', () => {
    describe('validación de número de semana', () => {
      it('should validate week number is between 1 and 52', () => {
        mockEvaluationRepository.validateWeekNumber.mockReturnValue(false);

        const evaluationData = {
          grupoId: 1,
          numeroSemana: 53,
          fechaEvaluacion: '2025-01-20',
        };

        try {
          evaluationService.validateEvaluationData(evaluationData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.numeroSemana).toBe('Número de semana debe estar entre 1 y 52');
        }
      });

      it('should pass validation for valid week number', () => {
        mockEvaluationRepository.validateWeekNumber.mockReturnValue(true);

        const evaluationData = {
          grupoId: 1,
          numeroSemana: 25,
          fechaEvaluacion: '2025-01-20',
        };

        expect(() => evaluationService.validateEvaluationData(evaluationData)).not.toThrow();
      });

      it('should reject week number 0', () => {
        mockEvaluationRepository.validateWeekNumber.mockReturnValue(false);

        const evaluationData = {
          grupoId: 1,
          numeroSemana: 0,
          fechaEvaluacion: '2025-01-20',
        };

        expect(() => evaluationService.validateEvaluationData(evaluationData)).toThrow(
          ValidationError
        );
      });

      it('should reject negative week number', () => {
        mockEvaluationRepository.validateWeekNumber.mockReturnValue(false);

        const evaluationData = {
          grupoId: 1,
          numeroSemana: -5,
          fechaEvaluacion: '2025-01-20',
        };

        expect(() => evaluationService.validateEvaluationData(evaluationData)).toThrow(
          ValidationError
        );
      });
    });

    describe('validación de campos requeridos', () => {
      it('should require grupoId in creation', () => {
        const evaluationData = {
          numeroSemana: 1,
          fechaEvaluacion: '2025-01-20',
        };

        try {
          evaluationService.validateEvaluationData(evaluationData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.grupoId).toBe('ID del grupo es requerido');
        }
      });

      it('should require numeroSemana in creation', () => {
        const evaluationData = {
          grupoId: 1,
          fechaEvaluacion: '2025-01-20',
        };

        try {
          evaluationService.validateEvaluationData(evaluationData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.numeroSemana).toBe('Número de semana es requerido');
        }
      });

      it('should require fechaEvaluacion in creation', () => {
        mockEvaluationRepository.validateWeekNumber.mockReturnValue(true);

        const evaluationData = {
          grupoId: 1,
          numeroSemana: 1,
        };

        try {
          evaluationService.validateEvaluationData(evaluationData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.fechaEvaluacion).toBe('Fecha de evaluación es requerida');
        }
      });

      it('should not require fields in update mode', () => {
        const evaluationData = {
          descripcion: 'Nueva descripción',
        };

        expect(() => evaluationService.validateEvaluationData(evaluationData, true)).not.toThrow();
      });
    });

    describe('validación de valores', () => {
      it('should validate estado values', () => {
        mockEvaluationRepository.validateWeekNumber.mockReturnValue(true);

        const evaluationData = {
          grupoId: 1,
          numeroSemana: 1,
          fechaEvaluacion: '2025-01-20',
          estado: 'INVALID',
        };

        try {
          evaluationService.validateEvaluationData(evaluationData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.estado).toBe(
            'Estado debe ser: PROGRAMADA, EN_CURSO, FINALIZADA o CANCELADA'
          );
        }
      });

      it('should validate duracionMinutos is positive', () => {
        mockEvaluationRepository.validateWeekNumber.mockReturnValue(true);

        const evaluationData = {
          grupoId: 1,
          numeroSemana: 1,
          fechaEvaluacion: '2025-01-20',
          duracionMinutos: -30,
        };

        try {
          evaluationService.validateEvaluationData(evaluationData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.duracionMinutos).toBe('Duración debe ser un número mayor a 0');
        }
      });

      it('should validate descripcion length', () => {
        mockEvaluationRepository.validateWeekNumber.mockReturnValue(true);

        const evaluationData = {
          grupoId: 1,
          numeroSemana: 1,
          fechaEvaluacion: '2025-01-20',
          descripcion: 'a'.repeat(201),
        };

        try {
          evaluationService.validateEvaluationData(evaluationData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.descripcion).toBe('Descripción no puede exceder 200 caracteres');
        }
      });

      it('should validate fechaEvaluacion format', () => {
        mockEvaluationRepository.validateWeekNumber.mockReturnValue(true);

        const evaluationData = {
          grupoId: 1,
          numeroSemana: 1,
          fechaEvaluacion: 'invalid-date',
        };

        try {
          evaluationService.validateEvaluationData(evaluationData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.fechaEvaluacion).toBe(
            'Fecha de evaluación debe ser válida (formato ISO 8601)'
          );
        }
      });
    });
  });

  describe('validateGroupExists', () => {
    it('should throw error when group does not exist', async () => {
      mockGroupRepository.findById.mockResolvedValue(null);

      await expect(evaluationService.validateGroupExists(999)).rejects.toThrow(BusinessLogicError);

      await expect(evaluationService.validateGroupExists(999)).rejects.toThrow(
        'El grupo especificado no existe'
      );
    });

    it('should not throw error when group exists', async () => {
      mockGroupRepository.findById.mockResolvedValue({ grupoId: 1, nombreGrupo: 'Grupo 1' });

      await expect(evaluationService.validateGroupExists(1)).resolves.not.toThrow();
    });

    it('should return the group when it exists', async () => {
      const mockGroup = { grupoId: 1, nombreGrupo: 'Grupo 1' };
      mockGroupRepository.findById.mockResolvedValue(mockGroup);

      const result = await evaluationService.validateGroupExists(1);

      expect(result).toEqual(mockGroup);
    });
  });

  describe('validateStateTransition', () => {
    describe('transiciones de estado', () => {
      it('should allow PROGRAMADA to EN_CURSO', () => {
        expect(() =>
          evaluationService.validateStateTransition('PROGRAMADA', 'EN_CURSO')
        ).not.toThrow();
      });

      it('should allow PROGRAMADA to CANCELADA', () => {
        expect(() =>
          evaluationService.validateStateTransition('PROGRAMADA', 'CANCELADA')
        ).not.toThrow();
      });

      it('should allow EN_CURSO to FINALIZADA', () => {
        expect(() =>
          evaluationService.validateStateTransition('EN_CURSO', 'FINALIZADA')
        ).not.toThrow();
      });

      it('should allow EN_CURSO to CANCELADA', () => {
        expect(() =>
          evaluationService.validateStateTransition('EN_CURSO', 'CANCELADA')
        ).not.toThrow();
      });

      it('should reject PROGRAMADA to FINALIZADA', () => {
        try {
          evaluationService.validateStateTransition('PROGRAMADA', 'FINALIZADA');
          fail('Should have thrown BusinessLogicError');
        } catch (error) {
          expect(error).toBeInstanceOf(BusinessLogicError);
          expect(error.message).toBe('No se puede cambiar de estado PROGRAMADA a FINALIZADA');
        }
      });

      it('should reject FINALIZADA to any state', () => {
        expect(() => evaluationService.validateStateTransition('FINALIZADA', 'EN_CURSO')).toThrow(
          BusinessLogicError
        );
      });

      it('should reject CANCELADA to any state', () => {
        expect(() => evaluationService.validateStateTransition('CANCELADA', 'EN_CURSO')).toThrow(
          BusinessLogicError
        );
      });

      it('should reject EN_CURSO to PROGRAMADA', () => {
        expect(() => evaluationService.validateStateTransition('EN_CURSO', 'PROGRAMADA')).toThrow(
          BusinessLogicError
        );
      });
    });
  });
});
