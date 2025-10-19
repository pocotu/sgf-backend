/**
 * Dependency Injection Container
 * Simple IoC container para gestionar dependencias
 */

class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  /**
   * Registrar un servicio (transient - nueva instancia cada vez)
   */
  register(name, factory) {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for ${name} must be a function`);
    }
    this.services.set(name, { factory, singleton: false });
    return this;
  }

  /**
   * Registrar un singleton (misma instancia siempre)
   */
  singleton(name, factory) {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for ${name} must be a function`);
    }
    this.services.set(name, { factory, singleton: true });
    return this;
  }

  /**
   * Resolver una dependencia
   */
  resolve(name) {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service ${name} not found in container`);
    }

    // Si es singleton y ya existe, retornar instancia existente
    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Crear nueva instancia
    const instance = service.factory(this);

    // Si es singleton, guardar instancia
    if (service.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  /**
   * Verificar si un servicio esta registrado
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Limpiar container (util para testing)
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
  }
}

// Crear instancia global del container
const container = new Container();

module.exports = container;
