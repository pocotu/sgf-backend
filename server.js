// Punto de entrada del servidor SGA-P
// Este archivo solo sirve como punto de entrada, toda la lógica está en app.js

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 SGA-P Server iniciado en puerto ${PORT}`);
  });
}

module.exports = app;
