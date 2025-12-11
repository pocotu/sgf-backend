const GroupService = require('../../../src/services/GroupService');
const { ValidationError, BusinessLogicError } = require('../../../src/utils/errors');

describe('GroupService', () => {
  let groupService;
  let mockGroupRepository;

  beforeEach(() => {
    mockGroupRepository = {
      validateSchedule: jest.fn(),
      existsUniqueCombination: jest.fn(),
    };
    groupService = new GroupService(mockGroupRepository);
  });

  describe('validateGroupData', () => {
    describe('validación de horarios', () => {
      it('should validate that horaFin is greater than horaInicio', () => {
        mockGroupRepository.validateSchedule.mockReturnValue(false);

        const groupData = {
          area: 'A',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes, Miércoles',
          horaInicio: '12:00',
          horaFin: '08:00',
        };

        try {
          groupService.validateGroupData(groupData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.horaFin).toBe(
            'Hora de fin debe ser mayor que hora de inicio'
          );
        }
      });

      it('should pass validation when horaFin is greater than horaInicio', () => {
        mockGroupRepository.validateSchedule.mockReturnValue(true);

        const groupData = {
          area: 'A',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes, Miércoles',
          horaInicio: '08:00',
          horaFin: '12:00',
        };

        expect(() => groupService.validateGroupData(groupData)).not.toThrow();
      });

      it('should validate time format HH:mm', () => {
        const groupData = {
          area: 'A',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes',
          horaInicio: '8:00',
          horaFin: '12:00',
        };

        try {
          groupService.validateGroupData(groupData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.horaInicio).toBe(
            'Hora de inicio debe tener formato HH:mm'
          );
        }
      });

      it('should reject invalid time format for horaFin', () => {
        const groupData = {
          area: 'A',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes',
          horaInicio: '08:00',
          horaFin: '25:00',
        };

        expect(() => groupService.validateGroupData(groupData)).toThrow(
          ValidationError
        );
      });
    });

    describe('validación de campos requeridos', () => {
      it('should require area in creation', () => {
        const groupData = {
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes',
          horaInicio: '08:00',
          horaFin: '12:00',
        };

        try {
          groupService.validateGroupData(groupData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.area).toBe('Área académica es requerida');
        }
      });

      it('should require modalidad in creation', () => {
        const groupData = {
          area: 'A',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes',
          horaInicio: '08:00',
          horaFin: '12:00',
        };

        try {
          groupService.validateGroupData(groupData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.modalidad).toBe('Modalidad es requerida');
        }
      });

      it('should require nombreGrupo in creation', () => {
        const groupData = {
          area: 'A',
          modalidad: 'ORDINARIO',
          dias: 'Lunes',
          horaInicio: '08:00',
          horaFin: '12:00',
        };

        try {
          groupService.validateGroupData(groupData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.nombreGrupo).toBe(
            'Nombre del grupo es requerido'
          );
        }
      });

      it('should not require fields in update mode', () => {
        mockGroupRepository.validateSchedule.mockReturnValue(true);

        const groupData = {
          horaInicio: '08:00',
          horaFin: '12:00',
        };

        expect(() =>
          groupService.validateGroupData(groupData, true)
        ).not.toThrow();
      });
    });

    describe('validación de valores', () => {
      it('should validate area is A, B, C or D', () => {
        const groupData = {
          area: 'E',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes',
          horaInicio: '08:00',
          horaFin: '12:00',
        };

        try {
          groupService.validateGroupData(groupData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.area).toBe('Área debe ser: A, B, C o D');
        }
      });

      it('should validate modalidad values', () => {
        const groupData = {
          area: 'A',
          modalidad: 'INVALID',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes',
          horaInicio: '08:00',
          horaFin: '12:00',
        };

        try {
          groupService.validateGroupData(groupData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.modalidad).toBe(
            'Modalidad debe ser: ORDINARIO, PRIMERA_OPCION o DIRIMENCIA'
          );
        }
      });

      it('should validate estado values', () => {
        mockGroupRepository.validateSchedule.mockReturnValue(true);

        const groupData = {
          area: 'A',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes',
          horaInicio: '08:00',
          horaFin: '12:00',
          estado: 'INVALID',
        };

        try {
          groupService.validateGroupData(groupData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.estado).toBe(
            'Estado debe ser: ACTIVO o INACTIVO'
          );
        }
      });

      it('should validate capacidad is a positive number', () => {
        mockGroupRepository.validateSchedule.mockReturnValue(true);

        const groupData = {
          area: 'A',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo 1',
          dias: 'Lunes',
          horaInicio: '08:00',
          horaFin: '12:00',
          capacidad: -5,
        };

        try {
          groupService.validateGroupData(groupData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.details.capacidad).toBe(
            'Capacidad debe ser un número mayor a 0'
          );
        }
      });
    });
  });

  describe('validateUniqueCombination', () => {
    describe('unicidad área-modalidad-nombreGrupo', () => {
      it('should throw error when combination already exists', async () => {
        mockGroupRepository.existsUniqueCombination.mockResolvedValue(true);

        await expect(
          groupService.validateUniqueCombination('A', 'ORDINARIO', 'Grupo 1')
        ).rejects.toThrow(BusinessLogicError);

        await expect(
          groupService.validateUniqueCombination('A', 'ORDINARIO', 'Grupo 1')
        ).rejects.toThrow(
          'Ya existe un grupo con la misma área, modalidad y nombre'
        );
      });

      it('should not throw error when combination is unique', async () => {
        mockGroupRepository.existsUniqueCombination.mockResolvedValue(false);

        await expect(
          groupService.validateUniqueCombination('A', 'ORDINARIO', 'Grupo 1')
        ).resolves.not.toThrow();
      });

      it('should pass excludeId to repository', async () => {
        mockGroupRepository.existsUniqueCombination.mockResolvedValue(false);

        await groupService.validateUniqueCombination(
          'A',
          'ORDINARIO',
          'Grupo 1',
          5
        );

        expect(mockGroupRepository.existsUniqueCombination).toHaveBeenCalledWith(
          'A',
          'ORDINARIO',
          'Grupo 1',
          5
        );
      });
    });
  });
});
