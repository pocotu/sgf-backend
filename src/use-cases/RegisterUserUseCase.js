/**
 * Register User Use Case
 * Crear usuario con contraseña = DNI
 */

const bcrypt = require('bcryptjs');

class RegisterUserUseCase {
  /**
   * @param {Object} userRepository - Repositorio de usuarios
   * @param {Object} userService - Servicio de usuarios
   */
  constructor(userRepository, userService) {
    this.userRepository = userRepository;
    this.userService = userService;
    this.bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async execute(userData) {
    // Validar datos del usuario
    await this.userService.validateUserData(userData);

    // Verificar unicidad de DNI y correo
    await this.userService.checkUniqueness(userData.dni, userData.correo);

    // Hash de la contraseña (DNI por defecto)
    const contrasenaHash = await bcrypt.hash(
      userData.dni,
      this.bcryptSaltRounds
    );

    // Preparar datos para crear usuario
    const userToCreate = {
      dni: userData.dni,
      correo: userData.correo || null,
      contrasenaHash,
      requiereCambioPassword: true,
      rol: userData.rol,
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      telefono: userData.telefono || null,
      estado: 'activo',
    };

    // Crear usuario
    const user = await this.userRepository.create(userToCreate);

    // Retornar usuario sin el hash de contraseña
    const { contrasenaHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = RegisterUserUseCase;
