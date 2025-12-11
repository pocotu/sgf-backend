const {
  successResponse,
  errorResponse,
  paginatedResponse,
  serializeData,
} = require('../../../src/utils/response');

describe('Response Utilities', () => {
  describe('successResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const result = successResponse(data);

      expect(result).toEqual({
        success: true,
        data,
      });
    });

    it('should serialize dates in data', () => {
      const data = {
        id: 1,
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      };
      const result = successResponse(data);

      expect(result.success).toBe(true);
      expect(result.data.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should serialize dates in nested objects', () => {
      const data = {
        id: 1,
        usuario: {
          usuarioId: 1,
          fechaCreacion: new Date('2025-01-15T10:00:00Z'),
        },
      };
      const result = successResponse(data);

      expect(result.data.usuario.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should serialize dates in arrays', () => {
      const data = [
        { id: 1, fechaCreacion: new Date('2025-01-15T10:00:00Z') },
        { id: 2, fechaCreacion: new Date('2025-01-16T10:00:00Z') },
      ];
      const result = successResponse(data);

      expect(result.data[0].fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
      expect(result.data[1].fechaCreacion).toBe('2025-01-16T10:00:00.000Z');
    });

    it('should include message when provided', () => {
      const data = { id: 1 };
      const message = 'Operation successful';
      const result = successResponse(data, message);

      expect(result).toEqual({
        success: true,
        data,
        message,
      });
    });

    it('should include pagination when provided', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { page: 1, limit: 10, total: 2, totalPages: 1 };
      const result = successResponse(data, null, pagination);

      expect(result).toEqual({
        success: true,
        data,
        pagination,
      });
    });

    it('should include both message and pagination', () => {
      const data = [{ id: 1 }];
      const message = 'Users retrieved';
      const pagination = { page: 1, limit: 10, total: 1, totalPages: 1 };
      const result = successResponse(data, message, pagination);

      expect(result).toEqual({
        success: true,
        data,
        message,
        pagination,
      });
    });
  });

  describe('errorResponse', () => {
    it('should create error response with code and message', () => {
      const code = 'VALIDATION_FAILED';
      const message = 'Invalid input data';
      const result = errorResponse(code, message);

      expect(result).toEqual({
        success: false,
        error: {
          code,
          message,
        },
      });
    });

    it('should include details when provided', () => {
      const code = 'VALIDATION_FAILED';
      const message = 'Invalid input data';
      const details = { field: 'dni', reason: 'Must be 8 digits' };
      const result = errorResponse(code, message, details);

      expect(result).toEqual({
        success: false,
        error: {
          code,
          message,
          details,
        },
      });
    });
  });

  describe('paginatedResponse', () => {
    it('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = paginatedResponse({
        data,
        page: 1,
        limit: 10,
        total: 25,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('should convert pagination values to numbers', () => {
      const data = [{ id: 1 }];
      const result = paginatedResponse({
        data,
        page: '1',
        limit: '10',
        total: '25',
      });

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(typeof result.pagination.page).toBe('number');
      expect(typeof result.pagination.limit).toBe('number');
      expect(typeof result.pagination.total).toBe('number');
    });

    it('should calculate totalPages correctly', () => {
      const data = [];
      const result = paginatedResponse({
        data,
        page: 1,
        limit: 10,
        total: 15,
      });

      expect(result.pagination.totalPages).toBe(2);
    });

    it('should handle exact page division', () => {
      const data = [];
      const result = paginatedResponse({
        data,
        page: 1,
        limit: 10,
        total: 20,
      });

      expect(result.pagination.totalPages).toBe(2);
    });

    it('should include message when provided', () => {
      const data = [{ id: 1 }];
      const message = 'Users retrieved successfully';
      const result = paginatedResponse({
        data,
        page: 1,
        limit: 10,
        total: 1,
        message,
      });

      expect(result.message).toBe(message);
    });

    it('should serialize dates in paginated data', () => {
      const data = [{ id: 1, fechaCreacion: new Date('2025-01-15T10:00:00Z') }];
      const result = paginatedResponse({
        data,
        page: 1,
        limit: 10,
        total: 1,
      });

      expect(result.data[0].fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
    });
  });

  describe('serializeData', () => {
    it('should serialize dates in objects', () => {
      const data = {
        id: 1,
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      };
      const result = serializeData(data);

      expect(result.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should serialize dates in arrays', () => {
      const data = [
        { id: 1, fechaCreacion: new Date('2025-01-15T10:00:00Z') },
        { id: 2, fechaCreacion: new Date('2025-01-16T10:00:00Z') },
      ];
      const result = serializeData(data);

      expect(result[0].fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
      expect(result[1].fechaCreacion).toBe('2025-01-16T10:00:00.000Z');
    });

    it('should handle null data', () => {
      expect(serializeData(null)).toBeNull();
    });

    it('should handle primitive values', () => {
      expect(serializeData('test')).toBe('test');
      expect(serializeData(123)).toBe(123);
      expect(serializeData(true)).toBe(true);
    });
  });
});
