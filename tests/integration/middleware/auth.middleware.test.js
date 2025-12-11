/**
 * Integration Tests for Authentication and Authorization Middleware
 * Tests authenticateJWT and authorizeRole middleware
 */

const request = require('supertest');
const express = require('express');
const prisma = require('../../../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateJWT, authorizeRole } = require('../../../src/middleware/auth');
const { errorHandler } = require('../../../src/middleware/errorHandler');
const AuthService = require('../../../src/services/AuthService');
const UserRepository = require('../../../src/repositories/UserRepository');

describe('Authentication and Authorization Middleware Integration Tests', () => {
  let app;
  let authService;
  let testUsers = {};
  let validToken;
  let expiredToken;
  let invalidToken;

  // JWT configuration for tests
  const jwtConfig = {
    secret: process.env.JWT_SECRET || 'test-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    bcryptSaltRounds: 10,
  };

  beforeAll(async () => {
    // Initialize AuthService
    const userRepository = new UserRepository();
    authService = new AuthService(userRepository, jwtConfig);

    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('Test1234', 10);

    testUsers.admin = await prisma.usuario.create({
      data: {
        dni: '10000001',
        correo: 'admin.middleware@test.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'admin',
        nombres: 'Admin',
        apellidos: 'Test',
        estado: 'activo',
      },
    });

    testUsers.docente = await prisma.usuario.create({
      data: {
        dni: '10000002',
        correo: 'docente.middleware@test.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'docente',
        nombres: 'Docente',
        apellidos: 'Test',
        estado: 'activo',
      },
    });

    testUsers.estudiante = await prisma.usuario.create({
      data: {
        dni: '10000003',
        correo: 'estudiante.middleware@test.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'estudiante',
        nombres: 'Estudiante',
        apellidos: 'Test',
        estado: 'activo',
      },
    });

    // Generate tokens
    validToken = authService.generateToken(testUsers.estudiante);

    // Generate expired token (expires in -1 second)
    expiredToken = jwt.sign(
      {
        usuarioId: testUsers.estudiante.usuarioId,
        dni: testUsers.estudiante.dni,
        rol: testUsers.estudiante.rol,
      },
      jwtConfig.secret,
      { expiresIn: '-1s' }
    );

    // Invalid token (wrong signature)
    invalidToken = jwt.sign(
      {
        usuarioId: testUsers.estudiante.usuarioId,
        dni: testUsers.estudiante.dni,
        rol: testUsers.estudiante.rol,
      },
      'wrong-secret-key',
      { expiresIn: '1h' }
    );

    // Setup Express app for testing
    app = express();
    app.use(express.json());

    // Test routes
    app.get(
      '/test/authenticated',
      authenticateJWT(authService),
      (req, res) => {
        res.json({
          success: true,
          user: req.user,
        });
      }
    );

    app.get(
      '/test/admin-only',
      authenticateJWT(authService),
      authorizeRole('admin'),
      (req, res) => {
        res.json({
          success: true,
          message: 'Admin access granted',
        });
      }
    );

    app.get(
      '/test/admin-or-docente',
      authenticateJWT(authService),
      authorizeRole('admin', 'docente'),
      (req, res) => {
        res.json({
          success: true,
          message: 'Access granted',
        });
      }
    );

    app.get(
      '/test/all-roles',
      authenticateJWT(authService),
      authorizeRole('admin', 'docente', 'estudiante'),
      (req, res) => {
        res.json({
          success: true,
          message: 'Access granted to all',
        });
      }
    );

    // Error handler
    app.use(errorHandler);
  });

  afterAll(async () => {
    // Clean up test users
    await prisma.usuario.deleteMany({
      where: {
        usuarioId: {
          in: [
            testUsers.admin.usuarioId,
            testUsers.docente.usuarioId,
            testUsers.estudiante.usuarioId,
          ],
        },
      },
    });
  });

  describe('authenticateJWT Middleware', () => {
    describe('Successful Authentication', () => {
      it('should authenticate successfully with valid token', async () => {
        const response = await request(app)
          .get('/test/authenticated')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user).toMatchObject({
          usuarioId: testUsers.estudiante.usuarioId,
          dni: testUsers.estudiante.dni,
          rol: testUsers.estudiante.rol,
        });
      });

      it('should attach decoded user to req.user', async () => {
        const response = await request(app)
          .get('/test/authenticated')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty('usuarioId');
        expect(response.body.user).toHaveProperty('dni');
        expect(response.body.user).toHaveProperty('rol');
      });
    });

    describe('Invalid Token', () => {
      it('should return 401 when token is missing', async () => {
        const response = await request(app).get('/test/authenticated');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_REQUIRED');
        expect(response.body.error.message).toBe(
          'Token de autenticación requerido'
        );
      });

      it('should return 401 when Authorization header is empty', async () => {
        const response = await request(app)
          .get('/test/authenticated')
          .set('Authorization', '');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_REQUIRED');
      });

      it('should return 401 when token format is invalid (missing Bearer)', async () => {
        const response = await request(app)
          .get('/test/authenticated')
          .set('Authorization', validToken);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_INVALID');
        expect(response.body.error.message).toContain('Formato de token inválido');
      });

      it('should return 401 when token format is invalid (wrong prefix)', async () => {
        const response = await request(app)
          .get('/test/authenticated')
          .set('Authorization', `Basic ${validToken}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_INVALID');
      });

      it('should return 401 when token is malformed', async () => {
        const response = await request(app)
          .get('/test/authenticated')
          .set('Authorization', 'Bearer invalid.token.here');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_INVALID');
        expect(response.body.error.message).toBe('Token inválido');
      });

      it('should return 401 when token has invalid signature', async () => {
        const response = await request(app)
          .get('/test/authenticated')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_INVALID');
      });
    });

    describe('Expired Token', () => {
      it('should return 401 when token is expired', async () => {
        const response = await request(app)
          .get('/test/authenticated')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_EXPIRED');
        expect(response.body.error.message).toBe('Token expirado');
      });
    });
  });

  describe('authorizeRole Middleware', () => {
    describe('Authorization by Role', () => {
      it('should allow admin access to admin-only endpoint', async () => {
        const adminToken = authService.generateToken(testUsers.admin);

        const response = await request(app)
          .get('/test/admin-only')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Admin access granted');
      });

      it('should allow admin access to admin-or-docente endpoint', async () => {
        const adminToken = authService.generateToken(testUsers.admin);

        const response = await request(app)
          .get('/test/admin-or-docente')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should allow docente access to admin-or-docente endpoint', async () => {
        const docenteToken = authService.generateToken(testUsers.docente);

        const response = await request(app)
          .get('/test/admin-or-docente')
          .set('Authorization', `Bearer ${docenteToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should allow all roles access to all-roles endpoint', async () => {
        const estudianteToken = authService.generateToken(testUsers.estudiante);

        const response = await request(app)
          .get('/test/all-roles')
          .set('Authorization', `Bearer ${estudianteToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('Authorization Denied', () => {
      it('should return 403 when estudiante tries to access admin-only endpoint', async () => {
        const estudianteToken = authService.generateToken(testUsers.estudiante);

        const response = await request(app)
          .get('/test/admin-only')
          .set('Authorization', `Bearer ${estudianteToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_ACCESS_DENIED');
        expect(response.body.error.message).toBe(
          'No tiene permisos para realizar esta operación'
        );
      });

      it('should return 403 when docente tries to access admin-only endpoint', async () => {
        const docenteToken = authService.generateToken(testUsers.docente);

        const response = await request(app)
          .get('/test/admin-only')
          .set('Authorization', `Bearer ${docenteToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_ACCESS_DENIED');
      });

      it('should return 403 when estudiante tries to access admin-or-docente endpoint', async () => {
        const estudianteToken = authService.generateToken(testUsers.estudiante);

        const response = await request(app)
          .get('/test/admin-or-docente')
          .set('Authorization', `Bearer ${estudianteToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_ACCESS_DENIED');
      });
    });

    describe('Authentication Required Before Authorization', () => {
      it('should return 401 when accessing protected endpoint without token', async () => {
        const response = await request(app).get('/test/admin-only');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_REQUIRED');
      });

      it('should return 401 for invalid token before checking authorization', async () => {
        const response = await request(app)
          .get('/test/admin-only')
          .set('Authorization', 'Bearer invalid.token');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_INVALID');
      });

      it('should return 401 for expired token before checking authorization', async () => {
        const response = await request(app)
          .get('/test/admin-only')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('AUTH_TOKEN_EXPIRED');
      });
    });
  });

  describe('Middleware Chain Integration', () => {
    it('should properly chain authenticateJWT and authorizeRole middleware', async () => {
      const adminToken = authService.generateToken(testUsers.admin);

      const response = await request(app)
        .get('/test/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should stop at authentication if token is invalid', async () => {
      const response = await request(app)
        .get('/test/admin-only')
        .set('Authorization', 'Bearer invalid');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_TOKEN_INVALID');
    });

    it('should proceed to authorization only after successful authentication', async () => {
      const estudianteToken = authService.generateToken(testUsers.estudiante);

      const response = await request(app)
        .get('/test/admin-only')
        .set('Authorization', `Bearer ${estudianteToken}`);

      // Should pass authentication but fail authorization
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('AUTH_ACCESS_DENIED');
    });
  });
});
