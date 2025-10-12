/**
 * Punto de entrada del servidor SGA-P Backend
 * Este archivo inicia el servidor Express configurado en app.js
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Iniciar servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log('================================================================');
    // eslint-disable-next-line no-console
    console.log('   SGA-P Backend - Sistema de Gestion Academias              ');
    // eslint-disable-next-line no-console
    console.log('================================================================');
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log(`[*] Entorno:      ${process.env.NODE_ENV || 'development'}`);
    // eslint-disable-next-line no-console
    console.log(`[*] Puerto:       ${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`[*] URL Base API: http://localhost:${PORT}${API_PREFIX}`);
    // eslint-disable-next-line no-console
    console.log(`[*] Health Check: http://localhost:${PORT}/health`);
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log('[OK] Servidor listo para recibir peticiones');
    // eslint-disable-next-line no-console
    console.log('');
  });

  // Manejo de cierre graceful
  const gracefulShutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n[!] ${signal} recibido, cerrando servidor...`);
    server.close(() => {
      // eslint-disable-next-line no-console
      console.log('[OK] Servidor cerrado correctamente');
      process.exit(0);
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error('[WARNING] Forzando cierre del servidor');
      process.exit(1);
    }, 10000);
  };

  // Escuchar señales de terminación
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Manejo de errores no capturados
  process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('[ERROR] Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    // eslint-disable-next-line no-console
    console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
}

module.exports = app;
