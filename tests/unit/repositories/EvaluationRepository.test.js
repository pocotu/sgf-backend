const EvaluationRepository = require('../../../src/repositories/EvaluationRepository');

describe('EvaluationRepository', () => {
  let evaluationRepository;

  beforeEach(() => {
    evaluationRepository = new EvaluationRepository();
  });

  describe('validateWeekNumber', () => {
    it('should return true for week number 1', () => {
      expect(evaluationRepository.validateWeekNumber(1)).toBe(true);
    });

    it('should return true for week number 52', () => {
      expect(evaluationRepository.validateWeekNumber(52)).toBe(true);
    });

    it('should return true for week number in middle range', () => {
      expect(evaluationRepository.validateWeekNumber(26)).toBe(true);
    });

    it('should return false for week number 0', () => {
      expect(evaluationRepository.validateWeekNumber(0)).toBe(false);
    });

    it('should return false for week number 53', () => {
      expect(evaluationRepository.validateWeekNumber(53)).toBe(false);
    });

    it('should return false for negative week number', () => {
      expect(evaluationRepository.validateWeekNumber(-5)).toBe(false);
    });

    it('should return false for non-numeric week number', () => {
      expect(evaluationRepository.validateWeekNumber('abc')).toBe(false);
    });

    it('should handle string numbers correctly', () => {
      expect(evaluationRepository.validateWeekNumber('25')).toBe(true);
      expect(evaluationRepository.validateWeekNumber('53')).toBe(false);
    });
  });

  describe('getIdField', () => {
    it('should return evaluacionId as the ID field', () => {
      expect(evaluationRepository.getIdField()).toBe('evaluacionId');
    });
  });
});
