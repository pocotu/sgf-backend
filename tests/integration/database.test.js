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
    it('should have seeded users', async () => {
      const usuarios = await prisma.usuario.findMany();
      expect(usuarios.length).toBeGreaterThanOrEqual(3);
    });

    it('should find admin user', async () => {
      const admin = await prisma.usuario.findUnique({
        where: { dni: '12345678' },
      });

      expect(admin).toBeDefined();
      expect(admin.rol).toBe('admin');
      expect(admin.correo).toBe('admin@sga-p.edu.pe');
    });

    it('should find docente user', async () => {
      const docente = await prisma.usuario.findUnique({
        where: { dni: '23456789' },
      });

      expect(docente).toBeDefined();
      expect(docente.rol).toBe('docente');
    });

    it('should find estudiante user', async () => {
      const estudiante = await prisma.usuario.findUnique({
        where: { dni: '34567890' },
      });

      expect(estudiante).toBeDefined();
      expect(estudiante.rol).toBe('estudiante');
    });

    it('should enforce unique DNI constraint', async () => {
      await expect(
        prisma.usuario.create({
          data: {
            dni: '12345678', // DNI duplicado
            correo: 'otro@test.com',
            contrasenaHash: 'hash',
            rol: 'estudiante',
            nombres: 'Test',
            apellidos: 'User',
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      await expect(
        prisma.usuario.create({
          data: {
            dni: '99999999',
            correo: 'admin@sga-p.edu.pe', // Email duplicado
            contrasenaHash: 'hash',
            rol: 'estudiante',
            nombres: 'Test',
            apellidos: 'User',
          },
        })
      ).rejects.toThrow();
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
