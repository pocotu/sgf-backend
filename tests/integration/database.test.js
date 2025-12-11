const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Database Integration Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Database Connection', () => {
    it('should connect to test database', async () => {
      const result = await prisma.$queryRaw`SELECT DATABASE() as db`;
      expect(result[0].db).toBe('academias_db_test');
    });

    it('should have all tables created', async () => {
      const tables = await prisma.$queryRaw`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'academias_db_test'
        ORDER BY TABLE_NAME
      `;

      const tableNames = tables.map(t => t.TABLE_NAME);
      expect(tableNames).toContain('usuarios');
      expect(tableNames).toContain('estudiantes');
      expect(tableNames).toContain('cursos');
      expect(tableNames).toContain('grupos');
      expect(tableNames).toContain('matriculas');
      expect(tableNames).toContain('asistencias');
      expect(tableNames).toContain('evaluaciones');
      expect(tableNames).toContain('notas');
    });
  });

  describe('Usuario Model', () => {
    it('should create and query users', async () => {
      // Clean up test users first
      await prisma.usuario.deleteMany({
        where: {
          dni: {
            in: ['12345678', '23456789', '34567890'],
          },
        },
      });

      // Create test users
      await prisma.usuario.create({
        data: {
          dni: '12345678',
          correo: 'admin@sga-p.edu.pe',
          contrasenaHash: 'hash',
          rol: 'admin',
          nombres: 'Admin',
          apellidos: 'User',
          estado: 'activo',
        },
      });

      await prisma.usuario.create({
        data: {
          dni: '23456789',
          correo: 'docente@sga-p.edu.pe',
          contrasenaHash: 'hash',
          rol: 'docente',
          nombres: 'Docente',
          apellidos: 'User',
          estado: 'activo',
        },
      });

      await prisma.usuario.create({
        data: {
          dni: '34567890',
          correo: 'estudiante@sga-p.edu.pe',
          contrasenaHash: 'hash',
          rol: 'estudiante',
          nombres: 'Estudiante',
          apellidos: 'User',
          estado: 'activo',
        },
      });

      const usuarios = await prisma.usuario.findMany({
        where: {
          dni: {
            in: ['12345678', '23456789', '34567890'],
          },
        },
      });
      expect(usuarios.length).toBe(3);

      // Clean up
      await prisma.usuario.deleteMany({
        where: {
          dni: {
            in: ['12345678', '23456789', '34567890'],
          },
        },
      });
    });

    it('should find admin user', async () => {
      // Create admin user for this test
      await prisma.usuario.deleteMany({
        where: { dni: '12345678' },
      });

      await prisma.usuario.create({
        data: {
          dni: '12345678',
          correo: 'admin@sga-p.edu.pe',
          contrasenaHash: 'hash',
          rol: 'admin',
          nombres: 'Admin',
          apellidos: 'User',
          estado: 'activo',
        },
      });

      const admin = await prisma.usuario.findUnique({
        where: { dni: '12345678' },
      });

      expect(admin).toBeDefined();
      expect(admin.rol).toBe('admin');
      expect(admin.correo).toBe('admin@sga-p.edu.pe');

      // Clean up
      await prisma.usuario.deleteMany({
        where: { dni: '12345678' },
      });
    });

    it('should find docente user', async () => {
      // Create docente user for this test
      await prisma.usuario.deleteMany({
        where: { dni: '23456789' },
      });

      await prisma.usuario.create({
        data: {
          dni: '23456789',
          correo: 'docente@sga-p.edu.pe',
          contrasenaHash: 'hash',
          rol: 'docente',
          nombres: 'Docente',
          apellidos: 'User',
          estado: 'activo',
        },
      });

      const docente = await prisma.usuario.findUnique({
        where: { dni: '23456789' },
      });

      expect(docente).toBeDefined();
      expect(docente.rol).toBe('docente');

      // Clean up
      await prisma.usuario.deleteMany({
        where: { dni: '23456789' },
      });
    });

    it('should find estudiante user', async () => {
      // Create estudiante user for this test
      await prisma.usuario.deleteMany({
        where: { dni: '34567890' },
      });

      await prisma.usuario.create({
        data: {
          dni: '34567890',
          correo: 'estudiante@sga-p.edu.pe',
          contrasenaHash: 'hash',
          rol: 'estudiante',
          nombres: 'Estudiante',
          apellidos: 'User',
          estado: 'activo',
        },
      });

      const estudiante = await prisma.usuario.findUnique({
        where: { dni: '34567890' },
      });

      expect(estudiante).toBeDefined();
      expect(estudiante.rol).toBe('estudiante');

      // Clean up
      await prisma.usuario.deleteMany({
        where: { dni: '34567890' },
      });
    });

    it('should enforce unique DNI constraint', async () => {
      // Clean up first
      await prisma.usuario.deleteMany({
        where: { dni: '12345678' },
      });

      // Create first user
      await prisma.usuario.create({
        data: {
          dni: '12345678',
          correo: 'first@test.com',
          contrasenaHash: 'hash',
          rol: 'estudiante',
          nombres: 'Test',
          apellidos: 'User',
          estado: 'activo',
        },
      });

      // Try to create duplicate - should fail
      await expect(
        prisma.usuario.create({
          data: {
            dni: '12345678', // DNI duplicado
            correo: 'otro@test.com',
            contrasenaHash: 'hash',
            rol: 'estudiante',
            nombres: 'Test',
            apellidos: 'User',
            estado: 'activo',
          },
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.usuario.deleteMany({
        where: { dni: '12345678' },
      });
    });

    it('should enforce unique email constraint', async () => {
      // Limpiar usuarios de prueba si existen
      await prisma.usuario.deleteMany({
        where: {
          dni: {
            in: ['88888888', '99999999'],
          },
        },
      });

      // Primero crear un usuario con correo
      await prisma.usuario.create({
        data: {
          dni: '88888888',
          correo: 'unique@test.com',
          contrasenaHash: 'hash',
          rol: 'estudiante',
          nombres: 'First',
          apellidos: 'User',
        },
      });

      // Intentar crear otro con el mismo correo debe fallar
      await expect(
        prisma.usuario.create({
          data: {
            dni: '99999999',
            correo: 'unique@test.com', // Email duplicado
            contrasenaHash: 'hash',
            rol: 'estudiante',
            nombres: 'Test',
            apellidos: 'User',
          },
        })
      ).rejects.toThrow();

      // Limpiar después del test
      await prisma.usuario.deleteMany({
        where: {
          dni: {
            in: ['88888888', '99999999'],
          },
        },
      });
    });

    it('should allow multiple users without email (null)', async () => {
      // Limpiar usuarios de prueba si existen
      await prisma.usuario.deleteMany({
        where: {
          dni: {
            in: ['77777777', '66666666'],
          },
        },
      });

      // Crear primer usuario sin correo
      const user1 = await prisma.usuario.create({
        data: {
          dni: '77777777',
          correo: null, // Sin correo
          contrasenaHash: 'hash',
          rol: 'estudiante',
          nombres: 'Student',
          apellidos: 'One',
        },
      });

      // Crear segundo usuario sin correo (debe permitirse)
      const user2 = await prisma.usuario.create({
        data: {
          dni: '66666666',
          correo: null, // Sin correo también
          contrasenaHash: 'hash',
          rol: 'estudiante',
          nombres: 'Student',
          apellidos: 'Two',
        },
      });

      expect(user1.correo).toBeNull();
      expect(user2.correo).toBeNull();
      expect(user1.dni).not.toBe(user2.dni);

      // Limpiar después del test
      await prisma.usuario.deleteMany({
        where: {
          dni: {
            in: ['77777777', '66666666'],
          },
        },
      });
    });
  });

  describe('Database Indexes', () => {
    it('should have indexes on usuarios table', async () => {
      const indexes = await prisma.$queryRaw`
        SHOW INDEX FROM usuarios 
        WHERE Key_name != 'PRIMARY'
      `;

      const indexNames = indexes.map(i => i.Key_name);
      expect(indexNames).toContain('usuarios_dni_key');
      expect(indexNames).toContain('usuarios_correo_key');
      expect(indexNames).toContain('idx_usuarios_dni');
      expect(indexNames).toContain('idx_usuarios_correo');
      expect(indexNames).toContain('idx_usuarios_rol');
      expect(indexNames).toContain('idx_usuarios_estado');
    });
  });

  describe('Database Enums', () => {
    it('should have Rol enum values', async () => {
      const result = await prisma.$queryRaw`
        SHOW COLUMNS FROM usuarios WHERE Field = 'rol'
      `;

      const enumValues = result[0].Type;
      expect(enumValues).toContain('admin');
      expect(enumValues).toContain('docente');
      expect(enumValues).toContain('estudiante');
    });

    it('should have EstadoUsuario enum values', async () => {
      const result = await prisma.$queryRaw`
        SHOW COLUMNS FROM usuarios WHERE Field = 'estado'
      `;

      const enumValues = result[0].Type;
      expect(enumValues).toContain('activo');
      expect(enumValues).toContain('inactivo');
    });
  });
});
