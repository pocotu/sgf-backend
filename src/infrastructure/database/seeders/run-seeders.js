/**
 * Script para ejecutar seeders de base de datos
 * Este es un placeholder hasta que se implementen los seeders reales
 */

require('dotenv').config();

function runSeeders() {
  console.log('🌱 Ejecutando seeders...');
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base de datos: ${process.env.DB_NAME || 'academias_db'}`);

  /*
   * TODO: Implementar lógica de seeders
   * Por ahora, solo simula la ejecución exitosa
   */

  console.log('✅ Seeders ejecutados exitosamente');
  process.exit(0);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  try {
    runSeeders();
  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    process.exit(1);
  }
}

module.exports = runSeeders;
