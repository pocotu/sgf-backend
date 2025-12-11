/**
 * Integration Tests for Authentication Endpoints
 */

const request = require('supertest');
const app = require('../../../src/app');
const prisma = require('../../../src/config/database');
const bcrypt = require('bcryptjs');

describe('Authentication Integration Tests', () => {
  let _testUser;

  beforeAll(async () => {
    // Clean up any existing test users first
    await prisma.usuario.deleteMany({
      where: {
        dni: {
          in: ['87654321', '11111111'],
        },
      },
    });

    // Create a test user
    const hashedPassword = await bcrypt.hash('12345678', 10);
    _testUser = await prisma.usuario.create({
      data: {
        dni: '87654321',
        correo: 'test.auth@example.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'estudiante',
        nombres: 'Test',
        apellidos: 'User',
        estado: 'activo',
      },
    });
  });

  afterAll(async () => {
    // Clean up test user - use deleteMany to avoid errors if user doesn't exist
    await prisma.usuario.deleteMany({
      where: {
        dni: {
          in: ['87654321', '11111111'],
        },
      },
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Ensure test user exists before each login test
      const existingUser = await prisma.usuario.findUnique({
        where: { dni: '87654321' },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('12345678', 10);
        await prisma.usuario.create({
          data: {
            dni: '87654321',
            correo: 'test.auth@example.com',
            contrasenaHash: hashedPassword,
            requiereCambioPassword: false,
            rol: 'estudiante',
            nombres: 'Test',
            apellidos: 'User',
            estado: 'activo',
          },
        });
      }
    });

    it('should login successfully with DNI', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        identifier: '87654321',
        password: '12345678',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toMatchObject({
        dni: '87654321',
        nombres: 'Test',
        apellidos: 'User',
        rol: 'estudiante',
      });
    });

    it('should login successfully with email', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        identifier: 'test.auth@example.com',
        password: '12345678',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        identifier: '87654321',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        identifier: '99999999',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    let validRefreshToken;
    let _refreshTestUser;

    beforeAll(async () => {
      // Clean up and create a fresh user for refresh token tests
      await prisma.usuario.deleteMany({
        where: { dni: '99887766' },
      });

      const hashedPassword = await bcrypt.hash('password123', 10);
      _refreshTestUser = await prisma.usuario.create({
        data: {
          dni: '99887766',
          correo: 'refresh.test@example.com',
          contrasenaHash: hashedPassword,
          requiereCambioPassword: false,
          rol: 'estudiante',
          nombres: 'Refresh',
          apellidos: 'Test',
          estado: 'activo',
        },
      });

      // Get a valid refresh token
      const response = await request(app).post('/api/v1/auth/login').send({
        identifier: '99887766',
        password: 'password123',
      });

      validRefreshToken = response.body.data.refreshToken;
    });

    afterAll(async () => {
      // Clean up refresh test user
      await prisma.usuario.deleteMany({
        where: { dni: '99887766' },
      });
    });

    it('should refresh token successfully', async () => {
      const response = await request(app).post('/api/v1/auth/refresh-token').send({
        refreshToken: validRefreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh-token').send({
        refreshToken: 'invalid_token',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 when refresh token is missing', async () => {
      const response = await request(app).post('/api/v1/auth/refresh-token').send({});

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/change-password-first-login', () => {
    let _userRequiringChange;
    let tempToken;

    beforeAll(async () => {
      // Create user requiring password change
      const hashedPassword = await bcrypt.hash('11111111', 10);
      _userRequiringChange = await prisma.usuario.create({
        data: {
          dni: '11111111',
          correo: 'change.password@example.com',
          contrasenaHash: hashedPassword,
          requiereCambioPassword: true,
          rol: 'estudiante',
          nombres: 'Change',
          apellidos: 'Password',
          estado: 'activo',
        },
      });

      // Get temp token
      const response = await request(app).post('/api/v1/auth/login').send({
        identifier: '11111111',
        password: '11111111',
      });

      tempToken = response.body.tempToken;
    });

    afterAll(async () => {
      // Clean up - already handled in main afterAll
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password-first-login')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          newPassword: 'NewPass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password-first-login')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          newPassword: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).post('/api/v1/auth/change-password-first-login').send({
        newPassword: 'NewPass123',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
