/**
 * Tests for Health Controller
 */

const HealthController = require('../../../src/controllers/HealthController');

describe('HealthController', () => {
  let healthController;
  let mockPrisma;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Mock Prisma
    mockPrisma = {
      $queryRaw: jest.fn(),
    };

    // Mock request
    mockReq = {
      ip: '127.0.0.1',
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    healthController = new HealthController(mockPrisma);
  });

  describe('getHealth', () => {
    it('should return basic health status', async () => {
      await healthController.getHealth(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          timestamp: expect.any(String),
          environment: expect.any(String),
          version: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should not throw errors', async () => {
      // Even with null prisma, getHealth should not throw
      const badController = new HealthController(null);

      await expect(badController.getHealth(mockReq, mockRes)).resolves.not.toThrow();
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health with all checks', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      await healthController.getDetailedHealth(mockReq, mockRes);

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          timestamp: expect.any(String),
          environment: expect.any(String),
          version: expect.any(String),
          uptime: expect.any(Number),
          checks: expect.objectContaining({
            database: expect.objectContaining({
              status: 'OK',
              responseTime: expect.any(String),
            }),
            memory: expect.objectContaining({
              status: 'OK',
              heapUsed: expect.any(String),
              heapTotal: expect.any(String),
              rss: expect.any(String),
            }),
            process: expect.objectContaining({
              status: 'OK',
              pid: expect.any(Number),
              nodeVersion: expect.any(String),
              platform: expect.any(String),
            }),
          }),
          responseTime: expect.any(String),
        })
      );
    });

    it('should return DEGRADED status when database fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

      await healthController.getDetailedHealth(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DEGRADED',
          checks: expect.objectContaining({
            database: expect.objectContaining({
              status: 'ERROR',
              error: 'Database connection failed',
            }),
          }),
        })
      );
    });

    it('should handle database check failure as DEGRADED', async () => {
      mockPrisma.$queryRaw.mockImplementation(() => {
        throw new Error('Critical error');
      });

      await healthController.getDetailedHealth(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DEGRADED',
          checks: expect.objectContaining({
            database: expect.objectContaining({
              status: 'ERROR',
            }),
          }),
        })
      );
    });
  });

  describe('getReadiness', () => {
    it('should return READY when database is accessible', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      await healthController.getReadiness(mockReq, mockRes);

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'READY',
          timestamp: expect.any(String),
        })
      );
    });

    it('should return NOT_READY when database is not accessible', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database not ready'));

      await healthController.getReadiness(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'NOT_READY',
          error: 'Database not ready',
        })
      );
    });
  });

  describe('getLiveness', () => {
    it('should always return ALIVE', async () => {
      await healthController.getLiveness(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ALIVE',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });
  });
});
