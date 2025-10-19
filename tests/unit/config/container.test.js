// Test implementation of Container class

// Extract the Container class from the module
class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  register(name, factory) {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for ${name} must be a function`);
    }
    this.services.set(name, { factory, singleton: false });
    return this;
  }

  singleton(name, factory) {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for ${name} must be a function`);
    }
    this.services.set(name, { factory, singleton: true });
    return this;
  }

  resolve(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in container`);
    }
    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }
    const instance = service.factory(this);
    if (service.singleton) {
      this.singletons.set(name, instance);
    }
    return instance;
  }

  has(name) {
    return this.services.has(name);
  }

  clear() {
    this.services.clear();
    this.singletons.clear();
  }
}

describe('Container', () => {
  let container;

  beforeEach(() => {
    container = new Container();
  });

  describe('register', () => {
    it('should register a transient service', () => {
      const factory = () => ({ name: 'Test' });

      container.register('TestService', factory);

      expect(container.has('TestService')).toBe(true);
    });

    it('should throw error if factory is not a function', () => {
      expect(() => container.register('TestService', 'not a function')).toThrow(
        'Factory for TestService must be a function'
      );
    });

    it('should return container for chaining', () => {
      const result = container.register('TestService', () => ({}));

      expect(result).toBe(container);
    });
  });

  describe('singleton', () => {
    it('should register a singleton service', () => {
      const factory = () => ({ name: 'Test' });

      container.singleton('TestService', factory);

      expect(container.has('TestService')).toBe(true);
    });

    it('should throw error if factory is not a function', () => {
      expect(() => container.singleton('TestService', 'not a function')).toThrow(
        'Factory for TestService must be a function'
      );
    });

    it('should return container for chaining', () => {
      const result = container.singleton('TestService', () => ({}));

      expect(result).toBe(container);
    });
  });

  describe('resolve', () => {
    it('should resolve a transient service', () => {
      container.register('TestService', () => ({ id: Math.random() }));

      const instance1 = container.resolve('TestService');
      const instance2 = container.resolve('TestService');

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1.id).not.toBe(instance2.id); // Different instances
    });

    it('should resolve a singleton service', () => {
      container.singleton('TestService', () => ({ id: Math.random() }));

      const instance1 = container.resolve('TestService');
      const instance2 = container.resolve('TestService');

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1.id).toBe(instance2.id); // Same instance
    });

    it('should throw error if service not found', () => {
      expect(() => container.resolve('NonExistentService')).toThrow(
        'Service NonExistentService not found in container'
      );
    });

    it('should pass container to factory', () => {
      container.singleton('DependencyService', () => ({ name: 'Dependency' }));
      container.register('TestService', c => ({
        dependency: c.resolve('DependencyService'),
      }));

      const instance = container.resolve('TestService');

      expect(instance.dependency).toBeDefined();
      expect(instance.dependency.name).toBe('Dependency');
    });
  });

  describe('has', () => {
    it('should return true if service is registered', () => {
      container.register('TestService', () => ({}));

      expect(container.has('TestService')).toBe(true);
    });

    it('should return false if service is not registered', () => {
      expect(container.has('NonExistentService')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all services and singletons', () => {
      container.singleton('TestService', () => ({}));
      container.resolve('TestService'); // Create singleton instance

      container.clear();

      expect(container.has('TestService')).toBe(false);
    });
  });
});
