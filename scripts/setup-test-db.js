#!/usr/bin/env node
/**
 * Script para configurar la base de datos de test
 * Ejecutar con: npm run test:setup
 *
 * Prisma se encarga de:
 * - Crear la BD si no existe
 * - Aplicar migraciones
 * - Generar el cliente
 */

const { execSync } = require('child_process');
const path = require('path');

// Cargar variables de entorno de test
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

console.log('[SETUP] Configurando base de datos de test...\n');
console.log('[INFO] Base de datos:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), '\n');

try {
  // Prisma migrate dev crea la BD automáticamente si no existe
  console.log('[MIGRATE] Aplicando migraciones (Prisma creara la BD si no existe)...');
  execSync('npx prisma migrate dev --skip-seed', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
  console.log('[OK] Migraciones aplicadas\n');

  // Ejecutar seed
  console.log('[SEED] Poblando datos de prueba...');
  execSync('node prisma/seed.js', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
  console.log('[OK] Datos de prueba creados\n');

  console.log('[OK] Base de datos de test configurada correctamente!');
  console.log('\n[INFO] Comandos utiles:');
  console.log('   npm run test:reset  - Resetear BD de test');
  console.log('   npm test            - Ejecutar tests');
} catch (error) {
  console.error('[ERROR] Error configurando base de datos de test:', error.message);
  process.exit(1);
}
