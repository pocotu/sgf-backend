#!/usr/bin/env node
/**
 * Script para verificar que .env.test esté configurado correctamente
 * Se ejecuta automáticamente antes de los tests
 */

const fs = require('fs');
const path = require('path');

const envTestPath = path.join(__dirname, '..', '.env.test');

console.log('[CHECK] Verificando configuracion de testing...\n');

// Verificar que existe .env.test
if (!fs.existsSync(envTestPath)) {
  console.error('[ERROR] No se encontro el archivo .env.test\n');
  console.log('[INFO] Para configurar el entorno de testing:');
  console.log('   1. Copiar el archivo de ejemplo:');
  console.log('      cp .env.test.example .env.test\n');
  console.log('   2. Editar .env.test y configurar tu password de MySQL');
  console.log('      DATABASE_URL=mysql://root:tu_password@localhost:3306/academias_db_test\n');
  console.log('   3. Ejecutar el setup:');
  console.log('      npm run test:setup\n');
  process.exit(1);
}

// Leer .env.test
const envTestContent = fs.readFileSync(envTestPath, 'utf-8');

// Verificar que no tenga el placeholder
if (envTestContent.includes('your_password')) {
  console.error('[ERROR] .env.test contiene el placeholder "your_password"\n');
  console.log(
    '[INFO] Edita el archivo .env.test y reemplaza "your_password" con tu password de MySQL:'
  );
  console.log('   DATABASE_URL=mysql://root:tu_password@localhost:3306/academias_db_test\n');
  process.exit(1);
}

// Verificar que tenga DATABASE_URL
if (!envTestContent.includes('DATABASE_URL=')) {
  console.error('[ERROR] .env.test no contiene DATABASE_URL\n');
  console.log('[INFO] Asegurate de que .env.test tenga la variable DATABASE_URL configurada.\n');
  process.exit(1);
}

// Verificar que apunte a academias_db_test
if (!envTestContent.includes('academias_db_test')) {
  console.warn('[WARN] DATABASE_URL no apunta a "academias_db_test"');
  console.warn('   Asegurate de usar una base de datos separada para tests.\n');
}

console.log('[OK] Configuracion de testing verificada correctamente');
console.log('   Archivo: .env.test');
console.log('   Base de datos: academias_db_test\n');
