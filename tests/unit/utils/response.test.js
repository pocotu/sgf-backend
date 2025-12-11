const {
  successResponse,
  errorResponse,
  paginatedResponse,
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

      expect(result).toEqual({
        success: true,
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
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
  });
});
