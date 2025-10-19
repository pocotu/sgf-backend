/* eslint-disable no-undef */
/**
 * Prisma Seed Script
 *
 * Este script se ejecuta con: npm run seed
 * Crea datos iniciales para desarrollo y testing
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Iniciando seeding de la base de datos...\n');

  // Limpiar datos existentes (opcional, comentar si no deseas limpiar)
  console.log('[SEED] Limpiando datos existentes...');
  // await prisma.usuario.deleteMany();
  // console.log('[SEED] Datos limpiados\n');

  // ========================================
  // USUARIOS
  // ========================================
  console.log('[SEED] Creando usuarios...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const docentePassword = await bcrypt.hash('docente123', 10);
  const estudiantePassword = await bcrypt.hash('estudiante123', 10);

  // Usuario Admin
  const admin = await prisma.usuario.upsert({
    where: { dni: '12345678' },
    update: {},
    create: {
      dni: '12345678',
      correo: 'admin@sga-p.edu.pe',
      contrasenaHash: adminPassword,
      rol: 'admin',
      nombres: 'Administrador',
      apellidos: 'Sistema',
      telefono: '987654321',
    },
  });
  console.log('  [OK] Admin creado:', admin.correo);

  // Usuario Docente
  const docente = await prisma.usuario.upsert({
    where: { dni: '23456789' },
    update: {},
    create: {
      dni: '23456789',
      correo: 'docente@sga-p.edu.pe',
      contrasenaHash: docentePassword,
      rol: 'docente',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez García',
      telefono: '987654322',
    },
  });
  console.log('  [OK] Docente creado:', docente.correo);

  // Usuario Estudiante
  const estudiante = await prisma.usuario.upsert({
    where: { dni: '34567890' },
    update: {},
    create: {
      dni: '34567890',
      correo: 'estudiante@sga-p.edu.pe',
      contrasenaHash: estudiantePassword,
      rol: 'estudiante',
      nombres: 'María Elena',
      apellidos: 'Quispe Huamán',
      telefono: '987654323',
    },
  });
  console.log('  [OK] Estudiante creado:', estudiante.correo);

  console.log('\n[SEED] Seeding completado exitosamente!\n');

  // Mostrar resumen
  console.log('[SUMMARY] Resumen:');
  console.log('  - Usuarios creados: 3');
  console.log('\n[CREDENTIALS] Credenciales de prueba:');
  console.log('  Admin:      DNI: 12345678 | Password: admin123');
  console.log('  Docente:    DNI: 23456789 | Password: docente123');
  console.log('  Estudiante: DNI: 34567890 | Password: estudiante123');
  console.log('');
}

main()
  .catch(e => {
    console.error('[ERROR] Error durante el seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
