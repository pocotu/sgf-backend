const request = require('supertest');
const app = require('../../../src/app');
const prisma = require('../../../src/config/database');
const bcrypt = require('bcryptjs');

describe('Attendance Integration Tests', () => {
  let adminToken;
  let docenteToken;
  let estudiante;
  let grupo;

  beforeAll(async () => {
    // Limpiar datos de prueba
    await prisma.asistencia.deleteMany({});
    await prisma.matricula.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.grupo.deleteMany({});
    await prisma.usuario.deleteMany({
      where: {
        dni: {
          in: ['11111111', '22222222', '33333333'],
        },
      },
    });

    // Crear usuarios de prueba
    const hashedPassword = await bcrypt.hash('Password123', 10);

    const _adminUser = await prisma.usuario.create({
      data: {
        dni: '11111111',
        correo: 'admin@test.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'admin',
        nombres: 'Admin',
        apellidos: 'Test',
        estado: 'activo',
      },
    });

    const _docenteUser = await prisma.usuario.create({
      data: {
        dni: '22222222',
        correo: 'docente@test.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'docente',
        nombres: 'Docente',
        apellidos: 'Test',
        estado: 'activo',
      },
    });

    const estudianteUser = await prisma.usuario.create({
      data: {
        dni: '33333333',
        correo: 'estudiante@test.com',
        contrasenaHash: hashedPassword,
        requiereCambioPassword: false,
        rol: 'estudiante',
        nombres: 'Estudiante',
        apellidos: 'Test',
        estado: 'activo',
      },
    });

    // Crear estudiante
    estudiante = await prisma.estudiante.create({
      data: {
        usuarioId: estudianteUser.usuarioId,
        codigoInterno: '2025-A-ORD-001',
        modalidad: 'ORDINARIO',
      },
    });

    // Crear grupo
    grupo = await prisma.grupo.create({
      data: {
        area: 'A',
        modalidad: 'ORDINARIO',
        nombreGrupo: 'Grupo Test',
        dias: 'Lunes, Miércoles, Viernes',
        horaInicio: new Date('1970-01-01T08:00:00'),
        horaFin: new Date('1970-01-01T12:00:00'),
        capacidad: 30,
        estado: 'ACTIVO',
      },
    });

    // Matricular estudiante
    await prisma.matricula.create({
      data: {
        estudianteId: estudiante.estudianteId,
        grupoId: grupo.grupoId,
        fechaMatricula: new Date(),
        montoPagado: 500,
        estado: 'MATRICULADO',
      },
    });

    // Obtener tokens
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: '11111111', password: 'Password123' });
    adminToken = adminLogin.body.data.token;

    const docenteLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: '22222222', password: 'Password123' });
    docenteToken = docenteLogin.body.data.token;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.asistencia.deleteMany({});
    await prisma.matricula.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.grupo.deleteMany({});
    await prisma.usuario.deleteMany({
      where: {
        dni: {
          in: ['11111111', '22222222', '33333333'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/attendances - Register individual attendance', () => {
    it('should register attendance successfully', async () => {
      const attendanceData = {
        estudianteId: estudiante.estudianteId,
        grupoId: grupo.grupoId,
        fechaClase: '2025-01-15',
        estado: 'PRESENTE',
        horaRegistro: '08:00',
      };

      const response = await request(app)
        .post('/api/v1/attendances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(attendanceData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('PRESENTE');
    });

    it('should prevent duplicate attendance', async () => {
      const attendanceData = {
        estudianteId: estudiante.estudianteId,
        grupoId: grupo.grupoId,
        fechaClase: '2025-01-15',
        estado: 'PRESENTE',
      };

      const response = await request(app)
        .post('/api/v1/attendances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(attendanceData);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/v1/attendances').send({});

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/attendances/bulk - Register bulk attendance', () => {
    beforeEach(async () => {
      // Limpiar asistencias para este test
      await prisma.asistencia.deleteMany({
        where: { fechaClase: new Date('2025-01-20') },
      });
    });

    it('should register multiple attendances', async () => {
      const bulkData = {
        grupoId: grupo.grupoId,
        fechaClase: '2025-01-20',
        asistencias: [
          {
            estudianteId: estudiante.estudianteId,
            estado: 'PRESENTE',
            horaRegistro: '08:00',
          },
        ],
      };

      const response = await request(app)
        .post('/api/v1/attendances/bulk')
        .set('Authorization', `Bearer ${docenteToken}`)
        .send(bulkData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.registradas).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/attendances - List attendances', () => {
    it('should list attendances with filters', async () => {
      const response = await request(app)
        .get('/api/v1/attendances')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ grupoId: grupo.grupoId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/attendances/summary/student/:estudianteId', () => {
    it('should get attendance summary for student', async () => {
      const response = await request(app)
        .get(`/api/v1/attendances/summary/student/${estudiante.estudianteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ grupoId: grupo.grupoId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalClases');
      expect(response.body.data).toHaveProperty('porcentajeAsistencia');
    });
  });

  describe('GET /api/v1/attendances/summary/group/:grupoId', () => {
    it('should get attendance summary for group', async () => {
      const response = await request(app)
        .get(`/api/v1/attendances/summary/group/${grupo.grupoId}`)
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
