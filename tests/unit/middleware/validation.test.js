/**
 * Tests para middleware de validación
 */

const {
  validate,
  validateQuery,
  validateParams,
  validateSchedule,
  VALIDATION_TYPES,
} = require('../../../src/middleware/validation');
const { ValidationError } = require('../../../src/utils/errors');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };
    res = {};
    next = jest.fn();
  });

  describe('validate - Body validation', () => {
    describe('DNI validation', () => {
      it('should pass with valid 8-digit DNI', () => {
        const schema = {
          dni: { required: true, type: VALIDATION_TYPES.DNI },
        };
        req.body = { dni: '12345678' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });

      it('should fail with invalid DNI (less than 8 digits)', () => {
        const schema = {
          dni: { required: true, type: VALIDATION_TYPES.DNI },
        };
        req.body = { dni: '1234567' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.dni).toBe('DNI debe tener exactamente 8 dígitos numéricos');
      });

      it('should fail with invalid DNI (contains letters)', () => {
        const schema = {
          dni: { required: true, type: VALIDATION_TYPES.DNI },
        };
        req.body = { dni: '1234567A' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      });

      it('should fail when required DNI is missing', () => {
        const schema = {
          dni: { required: true, type: VALIDATION_TYPES.DNI },
        };
        req.body = {};

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.dni).toBe('dni es requerido');
      });
    });

    describe('Email validation', () => {
      it('should pass with valid email', () => {
        const schema = {
          correo: { required: true, type: VALIDATION_TYPES.EMAIL },
        };
        req.body = { correo: 'test@example.com' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });

      it('should fail with invalid email format', () => {
        const schema = {
          correo: { required: true, type: VALIDATION_TYPES.EMAIL },
        };
        req.body = { correo: 'invalid-email' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.correo).toBe('Formato de correo electrónico inválido');
      });

      it('should pass when optional email is not provided', () => {
        const schema = {
          correo: { required: false, type: VALIDATION_TYPES.EMAIL },
        };
        req.body = {};

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });
    });

    describe('Date validation', () => {
      it('should pass with valid ISO 8601 date', () => {
        const schema = {
          fecha: { required: true, type: VALIDATION_TYPES.DATE },
        };
        req.body = { fecha: '2025-01-15' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });

      it('should fail with invalid date format', () => {
        const schema = {
          fecha: { required: true, type: VALIDATION_TYPES.DATE },
        };
        req.body = { fecha: '15/01/2025' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.fecha).toBe('Fecha debe estar en formato ISO 8601 (YYYY-MM-DD)');
      });

      it('should fail with invalid date (February 30)', () => {
        const schema = {
          fecha: { required: true, type: VALIDATION_TYPES.DATE },
        };
        req.body = { fecha: '2025-02-30' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      });
    });

    describe('Time validation', () => {
      it('should pass with valid time in HH:mm format', () => {
        const schema = {
          hora: { required: true, type: VALIDATION_TYPES.TIME },
        };
        req.body = { hora: '14:30' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });

      it('should fail with invalid time format', () => {
        const schema = {
          hora: { required: true, type: VALIDATION_TYPES.TIME },
        };
        req.body = { hora: '2:30 PM' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.hora).toBe('Hora debe estar en formato HH:mm (24 horas)');
      });

      it('should fail with invalid hour (25:00)', () => {
        const schema = {
          hora: { required: true, type: VALIDATION_TYPES.TIME },
        };
        req.body = { hora: '25:00' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      });
    });

    describe('String validation with length constraints', () => {
      it('should pass with string within length constraints', () => {
        const schema = {
          nombre: { required: true, type: VALIDATION_TYPES.STRING, minLength: 2, maxLength: 50 },
        };
        req.body = { nombre: 'Juan Pérez' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });

      it('should fail when string is too short', () => {
        const schema = {
          nombre: { required: true, type: VALIDATION_TYPES.STRING, minLength: 5 },
        };
        req.body = { nombre: 'Juan' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.nombre).toBe('nombre debe tener al menos 5 caracteres');
      });

      it('should fail when string is too long', () => {
        const schema = {
          nombre: { required: true, type: VALIDATION_TYPES.STRING, maxLength: 5 },
        };
        req.body = { nombre: 'Juan Pérez' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.nombre).toBe('nombre debe tener máximo 5 caracteres');
      });
    });

    describe('Number validation with range constraints', () => {
      it('should pass with number within range', () => {
        const schema = {
          edad: { required: true, type: VALIDATION_TYPES.NUMBER, min: 0, max: 120 },
        };
        req.body = { edad: 25 };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });

      it('should fail when number is below minimum', () => {
        const schema = {
          edad: { required: true, type: VALIDATION_TYPES.NUMBER, min: 18 },
        };
        req.body = { edad: 15 };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.edad).toBe('edad debe ser mayor o igual a 18');
      });

      it('should fail when number is above maximum', () => {
        const schema = {
          edad: { required: true, type: VALIDATION_TYPES.NUMBER, max: 100 },
        };
        req.body = { edad: 150 };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.edad).toBe('edad debe ser menor o igual a 100');
      });
    });

    describe('Grade validation', () => {
      it('should pass with valid grade (0-20)', () => {
        const schema = {
          nota: { required: true, type: VALIDATION_TYPES.GRADE },
        };
        req.body = { nota: 15.5 };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });

      it('should fail with grade below 0', () => {
        const schema = {
          nota: { required: true, type: VALIDATION_TYPES.GRADE },
        };
        req.body = { nota: -1 };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      });

      it('should fail with grade above 20', () => {
        const schema = {
          nota: { required: true, type: VALIDATION_TYPES.GRADE },
        };
        req.body = { nota: 21 };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      });
    });

    describe('Custom validation', () => {
      it('should pass with custom validation returning true', () => {
        const schema = {
          campo: {
            required: true,
            custom: value => value === 'valid',
          },
        };
        req.body = { campo: 'valid' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });

      it('should fail with custom validation returning error message', () => {
        const schema = {
          campo: {
            required: true,
            custom: value => (value === 'valid' ? true : 'Valor debe ser "valid"'),
          },
        };
        req.body = { campo: 'invalid' };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details.campo).toBe('Valor debe ser "valid"');
      });
    });

    describe('Multiple field validation', () => {
      it('should validate multiple fields and collect all errors', () => {
        const schema = {
          dni: { required: true, type: VALIDATION_TYPES.DNI },
          correo: { required: true, type: VALIDATION_TYPES.EMAIL },
          edad: { required: true, type: VALIDATION_TYPES.NUMBER, min: 18 },
        };
        req.body = {
          dni: '123',
          correo: 'invalid',
          edad: 15,
        };

        validate(schema)(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.details).toHaveProperty('dni');
        expect(error.details).toHaveProperty('correo');
        expect(error.details).toHaveProperty('edad');
      });
    });
  });

  describe('validateQuery - Query parameter validation', () => {
    it('should validate query parameters', () => {
      const schema = {
        page: { required: false, type: VALIDATION_TYPES.NUMBER, min: 1 },
        limit: { required: false, type: VALIDATION_TYPES.NUMBER, min: 1, max: 100 },
      };
      req.query = { page: '1', limit: '10' };

      validateQuery(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should convert string numbers to numbers', () => {
      const schema = {
        page: { required: true, type: VALIDATION_TYPES.NUMBER },
      };
      req.query = { page: '5' };

      validateQuery(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail with invalid number string', () => {
      const schema = {
        page: { required: true, type: VALIDATION_TYPES.NUMBER },
      };
      req.query = { page: 'abc' };

      validateQuery(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('validateParams - Route parameter validation', () => {
    it('should validate route parameters', () => {
      const schema = {
        id: { required: true, type: VALIDATION_TYPES.NUMBER, min: 1 },
      };
      req.params = { id: '123' };

      validateParams(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail with invalid parameter', () => {
      const schema = {
        id: { required: true, type: VALIDATION_TYPES.NUMBER },
      };
      req.params = { id: 'abc' };

      validateParams(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('validateSchedule - Schedule validation', () => {
    it('should pass when horaFin > horaInicio', () => {
      req.body = {
        horaInicio: '08:00',
        horaFin: '12:00',
      };

      validateSchedule()(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail when horaFin <= horaInicio', () => {
      req.body = {
        horaInicio: '12:00',
        horaFin: '08:00',
      };

      validateSchedule()(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = next.mock.calls[0][0];
      expect(error.details.horaFin).toBe('Hora de fin debe ser mayor que hora de inicio');
    });

    it('should pass when times are not provided', () => {
      req.body = {};

      validateSchedule()(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
