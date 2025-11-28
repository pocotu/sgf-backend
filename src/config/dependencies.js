/**
 * Dependency Registration
 * Configuracion de todas las dependencias del sistema
 */

const container = require('./container');

// Repositories
const UserRepository = require('../repositories/UserRepository');

/**
 * Registrar todas las dependencias
 */
function registerDependencies() {
  // Repositories (Singleton - una instancia compartida)
  container.singleton('UserRepository', () => new UserRepository());

  /*
   * Services (se agregaran cuando se implementen)
   * container.singleton('AuthService', (c) => new AuthService(c.resolve('UserRepository')));
   */

  /*
   * Use Cases (se agregaran cuando se implementen)
   * container.register('LoginUseCase', (c) => new LoginUseCase(c.resolve('AuthService')));
   */

  return container;
}

module.exports = { registerDependencies, container };
