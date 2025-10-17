/**
 * Este archivo inicia el servidor Express configurado en app.js
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Iniciar servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
  const server = app.listen(PORT, HOST, () => {
    const nodeEnv = process.env.NODE_ENV || 'development';

    if (nodeEnv === 'production') {
      console.log('[OK] El servidor se ha iniciado correctamente.');
    } else {
      console.log('================================================================');
      console.log('   SGA-P Backend - Sistema de Gestion Academias              ');
      console.log('================================================================');
      console.log('');
      console.log(`[*] Entorno:      ${nodeEnv}`);
      console.log(`[*] Host:         ${HOST}`);
      console.log(`[*] Puerto:       ${PORT}`);
      console.log(`[*] URL Base API: ${API_PREFIX}`);
      console.log(`[*] Health Check: /health`);
      console.log('');
      console.log('[OK] Servidor listo para recibir peticiones');
      console.log('');
    }
  });

  // Manejo de cierre graceful
  const gracefulShutdown = signal => {
    console.log(`\n[!] ${signal} recibido, cerrando servidor...`);
    server.close(() => {
      console.log('[OK] Servidor cerrado correctamente');
      process.exit(0);
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      console.error('[WARNING] Forzando cierre del servidor');
      process.exit(1);
    }, 10000);
  };

  // Escuchar señales de terminación
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Manejo de errores no capturados
  process.on('uncaughtException', err => {
    console.error('[ERROR] Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
}

module.exports = app;
