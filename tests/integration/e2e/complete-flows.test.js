/**
 * End-to-End Integration Tests
 * Tests complete user flows through the system
 */

const request = require('supertest');
const app = require('../../../src/app');
const prisma = require('../../../src/config/database');
const bcrypt = require('bcryptjs');

describe('E2E Integration Tests - Complete Flows', () => {
  let adminToken;
  let docenteToken;
  let estudianteToken;
  let adminUser;
  let docenteUser;
  let estudianteUser;
  let estudiante;
  let curso;
  let grupo;
  let matricula;
  let evaluacion;

  beforeAll(async () => {
    // Clean up all test data
    await prisma.nota.deleteMany({});
    await prisma.asistencia.deleteMany({});
    await prisma.evaluacion.deleteMany({});
    await prisma.matricula.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.grupo.deleteMany({});
    await prisma.curso.deleteMany({});
    await prisma.usuario.deleteMany({
      where: {
        dni: {
          in: ['10000001', '10000002', '10000003'],
        },
      },
    });

    // Create test users
    const hashedPassword = await bcrypt.hash('Password123', 10);

    adminUser = await prisma.usuario.create({
      data: {
        dni: '10000001',
        correo: 'admin.e2e@test.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'admin',
        nombres: 'Admin',
        apellidos: 'E2E Test',
        estado: 'activo',
      },
    });

    docenteUser = await prisma.usuario.create({
      data: {
        dni: '10000002',
        correo: 'docente.e2e@test.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'docente',
        nombres: 'Docente',
        apellidos: 'E2E Test',
        estado: 'activo',
      },
    });

    estudianteUser = await prisma.usuario.create({
      data: {
        dni: '10000003',
        correo: 'estudiante.e2e@test.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'estudiante',
        nombres: 'Estudiante',
        apellidos: 'E2E Test',
        estado: 'activo',
      },
    });

    // Get authentication tokens
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: '10000001', password: 'Password123' });
    adminToken = adminLogin.body.data.token;

    const docenteLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: '10000002', password: 'Password123' });
    docenteToken = docenteLogin.body.data.token;

    const estudianteLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: '10000003', password: 'Password123' });
    estudianteToken = estudianteLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.nota.deleteMany({});
    await prisma.asistencia.deleteMany({});
    await prisma.evaluacion.deleteMany({});
    await prisma.matricula.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.grupo.deleteMany({});
    await prisma.curso.deleteMany({});
    await prisma.usuario.deleteMany({
      where: {
        dni: {
          in: ['10000001', '10000002', '10000003', '10000004'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Flow 1: Complete Authentication Flow', () => {
    let newUserDni;
    let tempToken;

    it('Step 1: Admin creates a new user with default password', async () => {
      newUserDni = '10000004';
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dni: newUserDni,
          correo: 'newuser.e2e@test.com',
          nombres: 'New',
          apellidos: 'User',
          telefono: '987654321',
          rol: 'estudiante',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requiereCambioPassword).toBe(true);
      expect(response.body.data.dni).toBe(newUserDni);
    });

    it('Step 2: New user logs in with default password (DNI)', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        identifier: newUserDni,
        password: newUserDni, // Default password is DNI
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.requiresPasswordChange).toBe(true);
      expect(response.body).toHaveProperty('tempToken');
      tempToken = response.body.tempToken;
    });

    it('Step 3: User changes password on first login', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password-first-login')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          newPassword: 'NewSecurePass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('Step 4: User logs in with new password', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        identifier: newUserDni,
        password: 'NewSecurePass123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.requiresPasswordChange).toBeUndefined();
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('Step 5: User can refresh their token', async () => {
      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        identifier: newUserDni,
        password: 'NewSecurePass123',
      });

      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await request(app).post('/api/v1/auth/refresh-token').send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });
  });

  describe('Flow 2: Complete Student Enrollment Flow', () => {
    it('Step 1: Admin creates a course', async () => {
      const response = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Matemática E2E',
          area: 'A',
          descripcion: 'Curso de matemática para pruebas E2E',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe('Matemática E2E');
      curso = response.body.data;
    });

    it('Step 2: Admin creates a group', async () => {
      const response = await request(app)
        .post('/api/v1/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          area: 'A',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Grupo E2E Test',
          dias: 'Lunes, Miércoles, Viernes',
          horaInicio: '08:00',
          horaFin: '12:00',
          capacidad: 30,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombreGrupo).toBe('Grupo E2E Test');
      expect(response.body.data.estado).toBe('ACTIVO');
      grupo = response.body.data;
    });

    it('Step 3: Admin creates a student profile', async () => {
      const response = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          usuarioId: estudianteUser.usuarioId,
          modalidad: 'ORDINARIO',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.modalidad).toBe('ORDINARIO');
      // Codigo interno can have X for area when no area is specified initially
      expect(response.body.data.codigoInterno).toMatch(/^\d{4}-[A-DX]-(ORD|PRI|DIR)-\d{3}$/);
      estudiante = response.body.data;
    });

    it('Step 4: Admin enrolls student in group', async () => {
      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estudianteId: estudiante.estudianteId,
          grupoId: grupo.grupoId,
          montoPagado: 500.0,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('MATRICULADO');
      expect(response.body.data.estudianteId).toBe(estudiante.estudianteId);
      expect(response.body.data.grupoId).toBe(grupo.grupoId);
      matricula = response.body.data;
    });

    it('Step 5: Verify enrollment appears in list', async () => {
      const response = await request(app)
        .get('/api/v1/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ grupoId: grupo.grupoId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const enrollment = response.body.data.find(e => e.estudianteId === estudiante.estudianteId);
      expect(enrollment).toBeDefined();
      expect(enrollment.estado).toBe('MATRICULADO');
    });

    it('Step 6: Verify group shows reduced capacity', async () => {
      const response = await request(app)
        .get(`/api/v1/groups/${grupo.grupoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cuposDisponibles).toBe(29); // 30 - 1
    });

    it('Step 7: Prevent duplicate enrollment', async () => {
      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estudianteId: estudiante.estudianteId,
          grupoId: grupo.grupoId,
          montoPagado: 500.0,
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ENROLLMENT_ALREADY_ENROLLED');
    });
  });

  describe('Flow 3: Complete Attendance Registration Flow', () => {
    const fechaClase1 = '2025-01-15';
    const fechaClase2 = '2025-01-17';
    const fechaClase3 = '2025-01-20';

    it('Step 1: Docente registers individual attendance', async () => {
      const response = await request(app)
        .post('/api/v1/attendances')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          estudianteId: estudiante.estudianteId,
          grupoId: grupo.grupoId,
          fechaClase: fechaClase1,
          estado: 'PRESENTE',
          horaRegistro: '08:00',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('PRESENTE');
    });

    it('Step 2: Docente registers bulk attendance for another day', async () => {
      const response = await request(app)
        .post('/api/v1/attendances/bulk')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          grupoId: grupo.grupoId,
          fechaClase: fechaClase2,
          asistencias: [
            {
              estudianteId: estudiante.estudianteId,
              estado: 'TARDANZA',
              horaRegistro: '08:20',
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.registradas).toBe(1);
    });

    it('Step 3: Register absence for third day', async () => {
      const response = await request(app)
        .post('/api/v1/attendances')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          estudianteId: estudiante.estudianteId,
          grupoId: grupo.grupoId,
          fechaClase: fechaClase3,
          estado: 'AUSENTE',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('AUSENTE');
    });

    it('Step 4: Docente views attendance list', async () => {
      const response = await request(app)
        .get('/api/v1/attendances')
        .set('Authorization', `Bearer ${docenteToken}`)
        .query({
          grupoId: grupo.grupoId,
          estudianteId: estudiante.estudianteId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
    });

    it('Step 5: Get attendance summary for student', async () => {
      const response = await request(app)
        .get(`/api/v1/attendances/summary/student/${estudiante.estudianteId}`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .query({ grupoId: grupo.grupoId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalClases).toBe(3);
      expect(response.body.data.presentes).toBe(1);
      expect(response.body.data.tardanzas).toBe(1);
      expect(response.body.data.ausentes).toBe(1);
      // Percentage = (1 + 1) / 3 * 100 = 66.67%
      expect(response.body.data.porcentajeAsistencia).toBeCloseTo(66.67, 1);
    });

    it('Step 6: Student can view their own attendance summary', async () => {
      const response = await request(app)
        .get(`/api/v1/attendances/summary/student/${estudiante.estudianteId}`)
        .set('Authorization', `Bearer ${estudianteToken}`)
        .query({ grupoId: grupo.grupoId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalClases).toBe(3);
    });

    it('Step 7: Get attendance summary for entire group', async () => {
      const response = await request(app)
        .get(`/api/v1/attendances/summary/group/${grupo.grupoId}`)
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Flow 4: Complete Grade Registration and Ranking Flow', () => {
    let curso2;

    it('Step 1: Admin creates another course for the same area', async () => {
      const response = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Física E2E',
          area: 'A',
          descripcion: 'Curso de física para pruebas E2E',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      curso2 = response.body.data;
    });

    it('Step 2: Admin schedules an evaluation', async () => {
      const response = await request(app)
        .post('/api/v1/evaluations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grupoId: grupo.grupoId,
          numeroSemana: 1,
          fechaEvaluacion: '2025-01-25',
          descripcion: 'Evaluación Semanal 1 - E2E',
          duracionMinutos: 120,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('PROGRAMADA');
      expect(response.body.data.numeroSemana).toBe(1);
      evaluacion = response.body.data;
    });

    it('Step 3: Docente registers individual grade', async () => {
      const response = await request(app)
        .post('/api/v1/grades')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          evaluacionId: evaluacion.evaluacionId,
          estudianteId: estudiante.estudianteId,
          cursoId: curso.cursoId,
          nota: 18.5,
          observaciones: 'Excelente desempeño',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      // Nota can be returned as Decimal object or string depending on serialization
      const nota = response.body.data.nota;
      const notaValue =
        typeof nota === 'object' ? parseFloat(nota.d[0] + nota.d[1] / 10000000) : parseFloat(nota);
      expect(notaValue).toBeCloseTo(18.5, 1);
    });

    it('Step 4: Docente registers bulk grades for second course', async () => {
      const response = await request(app)
        .post('/api/v1/grades/bulk')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          evaluacionId: evaluacion.evaluacionId,
          notas: [
            {
              estudianteId: estudiante.estudianteId,
              cursoId: curso2.cursoId,
              nota: 16.0,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      // Check that bulk registration was successful
      expect(response.body.data).toBeDefined();
    });

    it('Step 5: Prevent duplicate grade registration', async () => {
      const response = await request(app)
        .post('/api/v1/grades')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          evaluacionId: evaluacion.evaluacionId,
          estudianteId: estudiante.estudianteId,
          cursoId: curso.cursoId,
          nota: 19.0,
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('GRADE_DUPLICATE');
    });

    it('Step 6: Student views their grades', async () => {
      const response = await request(app)
        .get(`/api/v1/grades/student/${estudiante.estudianteId}`)
        .set('Authorization', `Bearer ${estudianteToken}`)
        .query({ grupoId: grupo.grupoId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('promedioGeneral');
      expect(response.body.data.promedioGeneral).toBeCloseTo(17.25, 1); // (18.5 + 16) / 2
      // Check that grades data is returned (structure may vary)
      expect(response.body.data).toBeDefined();
    });

    it('Step 7: Docente views grades list', async () => {
      const response = await request(app)
        .get('/api/v1/grades')
        .set('Authorization', `Bearer ${docenteToken}`)
        .query({ evaluacionId: evaluacion.evaluacionId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2); // Two grades registered
    });

    it('Step 8: View group ranking', async () => {
      const response = await request(app)
        .get(`/api/v1/rankings/group/${grupo.grupoId}`)
        .set('Authorization', `Bearer ${docenteToken}`)
        .query({ evaluacionId: evaluacion.evaluacionId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ranking');
      expect(Array.isArray(response.body.data.ranking)).toBe(true);
      expect(response.body.data).toHaveProperty('promedioGrupo');

      const studentRanking = response.body.data.ranking.find(
        r => r.estudianteId === estudiante.estudianteId
      );
      expect(studentRanking).toBeDefined();
      expect(studentRanking.posicion).toBe(1);
    });

    it('Step 9: Student views their position in ranking', async () => {
      const response = await request(app)
        .get(`/api/v1/rankings/student/${estudiante.estudianteId}`)
        .set('Authorization', `Bearer ${estudianteToken}`)
        .query({ evaluacionId: evaluacion.evaluacionId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posicion).toBe(1);
      expect(response.body.data.diferenciaConPrimero).toBe(0);
      expect(response.body.data).toHaveProperty('promedio');
      expect(response.body.data).toHaveProperty('promedioGrupo');
    });

    it('Step 10: Admin updates evaluation status', async () => {
      // First transition to EN_CURSO
      const enCursoResponse = await request(app)
        .put(`/api/v1/evaluations/${evaluacion.evaluacionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado: 'EN_CURSO',
        });

      expect(enCursoResponse.status).toBe(200);
      expect(enCursoResponse.body.success).toBe(true);
      expect(enCursoResponse.body.data.estado).toBe('EN_CURSO');

      // Then transition to FINALIZADA
      const finalizadaResponse = await request(app)
        .put(`/api/v1/evaluations/${evaluacion.evaluacionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estado: 'FINALIZADA',
        });

      expect(finalizadaResponse.status).toBe(200);
      expect(finalizadaResponse.body.success).toBe(true);
      expect(finalizadaResponse.body.data.estado).toBe('FINALIZADA');
    });
  });

  describe('Flow 5: Authorization and Access Control', () => {
    it('Student cannot create users', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          dni: '99999999',
          nombres: 'Test',
          apellidos: 'User',
          rol: 'estudiante',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('Student cannot enroll other students', async () => {
      const response = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          estudianteId: estudiante.estudianteId,
          grupoId: grupo.grupoId,
          montoPagado: 500,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('Student cannot register attendance', async () => {
      const response = await request(app)
        .post('/api/v1/attendances')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          estudianteId: estudiante.estudianteId,
          grupoId: grupo.grupoId,
          fechaClase: '2025-01-30',
          estado: 'PRESENTE',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('Student cannot register grades', async () => {
      const response = await request(app)
        .post('/api/v1/grades')
        .set('Authorization', `Bearer ${estudianteToken}`)
        .send({
          evaluacionId: evaluacion.evaluacionId,
          estudianteId: estudiante.estudianteId,
          cursoId: curso.cursoId,
          nota: 20,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('Docente can register attendance', async () => {
      const response = await request(app)
        .post('/api/v1/attendances')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          estudianteId: estudiante.estudianteId,
          grupoId: grupo.grupoId,
          fechaClase: '2025-01-30',
          estado: 'PRESENTE',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('Docente cannot create users', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          dni: '88888888',
          nombres: 'Test',
          apellidos: 'User',
          rol: 'estudiante',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Flow 6: Data Validation and Business Rules', () => {
    it('Cannot register grade outside valid range', async () => {
      const response = await request(app)
        .post('/api/v1/grades')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send({
          evaluacionId: evaluacion.evaluacionId,
          estudianteId: estudiante.estudianteId,
          cursoId: curso.cursoId,
          nota: 25, // Invalid: > 20
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Cannot create group with invalid schedule', async () => {
      const response = await request(app)
        .post('/api/v1/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          area: 'B',
          modalidad: 'ORDINARIO',
          nombreGrupo: 'Invalid Group',
          dias: 'Lunes',
          horaInicio: '12:00',
          horaFin: '08:00', // Invalid: end before start
          capacidad: 30,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Cannot create evaluation with invalid week number', async () => {
      const response = await request(app)
        .post('/api/v1/evaluations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grupoId: grupo.grupoId,
          numeroSemana: 60, // Invalid: > 52
          fechaEvaluacion: '2025-02-01',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Cannot create user with invalid DNI', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dni: '123', // Invalid: not 8 digits
          nombres: 'Test',
          apellidos: 'User',
          rol: 'estudiante',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
