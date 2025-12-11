/**
 * Get User By Id Use Case
 * Obtener usuario por ID
 */

const { NotFoundError } = require('../utils/errors');

class GetUserByIdUseCase {
  /**
   * @param {Object} userRepository - Repositorio de usuarios
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>} Usuario encontrado
   */
  async execute(usuarioId) {
    const user = await this.userRepository.findById(usuarioId);

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Retornar usuario sin el hash de contraseña
    const { contrasenaHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = GetUserByIdUseCase;
