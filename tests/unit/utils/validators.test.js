const {
  isValidDni,
  isValidEmail,
  isValidDate,
  isValidTime,
  isTimeAfter,
  isValidPassword,
  isValidGrade,
  isValidWeekNumber,
  isValidArea,
  isValidModalidad,
  isValidRole,
} = require('../../../src/utils/validators');

describe('Validator Utilities', () => {
  describe('isValidDni', () => {
    it('should validate correct DNI', () => {
      expect(isValidDni('12345678')).toBe(true);
      expect(isValidDni('87654321')).toBe(true);
    });

    it('should reject DNI with less than 8 digits', () => {
      expect(isValidDni('1234567')).toBe(false);
      expect(isValidDni('123')).toBe(false);
    });

    it('should reject DNI with more than 8 digits', () => {
      expect(isValidDni('123456789')).toBe(false);
    });

    it('should reject DNI with non-numeric characters', () => {
      expect(isValidDni('1234567a')).toBe(false);
      expect(isValidDni('abcd1234')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(isValidDni(null)).toBe(false);
      expect(isValidDni(undefined)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject email without @', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should reject email without extension', () => {
      expect(isValidEmail('test@domain')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate correct ISO date', () => {
      expect(isValidDate('2025-01-15')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
    });

    it('should reject invalid date format', () => {
      expect(isValidDate('15-01-2025')).toBe(false);
      expect(isValidDate('2025/01/15')).toBe(false);
    });

    it('should reject invalid date values', () => {
      expect(isValidDate('2025-13-01')).toBe(false);
      expect(isValidDate('2025-02-30')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  describe('isValidTime', () => {
    it('should validate correct time format', () => {
      expect(isValidTime('08:00')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
      expect(isValidTime('00:00')).toBe(true);
    });

    it('should reject invalid hour', () => {
      expect(isValidTime('24:00')).toBe(false);
      expect(isValidTime('25:30')).toBe(false);
    });

    it('should reject invalid minute', () => {
      expect(isValidTime('08:60')).toBe(false);
      expect(isValidTime('12:99')).toBe(false);
    });

    it('should reject invalid format', () => {
      expect(isValidTime('8:00')).toBe(false);
      expect(isValidTime('08:0')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(isValidTime(null)).toBe(false);
      expect(isValidTime(undefined)).toBe(false);
    });
  });

  describe('isTimeAfter', () => {
    it('should return true when end time is after start time', () => {
      expect(isTimeAfter('08:00', '12:00')).toBe(true);
      expect(isTimeAfter('09:30', '10:00')).toBe(true);
    });

    it('should return false when end time equals start time', () => {
      expect(isTimeAfter('08:00', '08:00')).toBe(false);
    });

    it('should return false when end time is before start time', () => {
      expect(isTimeAfter('12:00', '08:00')).toBe(false);
    });

    it('should return false for invalid times', () => {
      expect(isTimeAfter('25:00', '12:00')).toBe(false);
      expect(isTimeAfter('08:00', '24:00')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate strong password', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('MyPass1word')).toBe(true);
    });

    it('should reject password less than 8 characters', () => {
      expect(isValidPassword('Pass1')).toBe(false);
    });

    it('should reject password without uppercase', () => {
      expect(isValidPassword('password123')).toBe(false);
    });

    it('should reject password without lowercase', () => {
      expect(isValidPassword('PASSWORD123')).toBe(false);
    });

    it('should reject password without number', () => {
      expect(isValidPassword('Password')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(isValidPassword(null)).toBe(false);
      expect(isValidPassword(undefined)).toBe(false);
    });
  });

  describe('isValidGrade', () => {
    it('should validate grades in range 0-20', () => {
      expect(isValidGrade(0)).toBe(true);
      expect(isValidGrade(10)).toBe(true);
      expect(isValidGrade(20)).toBe(true);
      expect(isValidGrade(15.5)).toBe(true);
    });

    it('should reject grades below 0', () => {
      expect(isValidGrade(-1)).toBe(false);
    });

    it('should reject grades above 20', () => {
      expect(isValidGrade(21)).toBe(false);
      expect(isValidGrade(100)).toBe(false);
    });

    it('should reject non-numeric values', () => {
      expect(isValidGrade('15')).toBe(false);
      expect(isValidGrade(null)).toBe(false);
    });
  });

  describe('isValidWeekNumber', () => {
    it('should validate week numbers 1-52', () => {
      expect(isValidWeekNumber(1)).toBe(true);
      expect(isValidWeekNumber(26)).toBe(true);
      expect(isValidWeekNumber(52)).toBe(true);
    });

    it('should reject week number 0', () => {
      expect(isValidWeekNumber(0)).toBe(false);
    });

    it('should reject week number above 52', () => {
      expect(isValidWeekNumber(53)).toBe(false);
    });

    it('should reject non-numeric values', () => {
      expect(isValidWeekNumber('1')).toBe(false);
      expect(isValidWeekNumber(null)).toBe(false);
    });
  });

  describe('isValidArea', () => {
    it('should validate areas A, B, C, D', () => {
      expect(isValidArea('A')).toBe(true);
      expect(isValidArea('B')).toBe(true);
      expect(isValidArea('C')).toBe(true);
      expect(isValidArea('D')).toBe(true);
    });

    it('should reject invalid areas', () => {
      expect(isValidArea('E')).toBe(false);
      expect(isValidArea('a')).toBe(false);
      expect(isValidArea('1')).toBe(false);
    });
  });

  describe('isValidModalidad', () => {
    it('should validate valid modalidades', () => {
      expect(isValidModalidad('ORDINARIO')).toBe(true);
      expect(isValidModalidad('PRIMERA_OPCION')).toBe(true);
      expect(isValidModalidad('DIRIMENCIA')).toBe(true);
    });

    it('should reject invalid modalidades', () => {
      expect(isValidModalidad('REGULAR')).toBe(false);
      expect(isValidModalidad('ordinario')).toBe(false);
    });
  });

  describe('isValidRole', () => {
    it('should validate valid roles', () => {
      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('docente')).toBe(true);
      expect(isValidRole('estudiante')).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(isValidRole('ADMIN')).toBe(false);
      expect(isValidRole('user')).toBe(false);
      expect(isValidRole('teacher')).toBe(false);
    });
  });
});
