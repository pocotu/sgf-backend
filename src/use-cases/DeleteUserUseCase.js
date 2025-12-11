/**
 * Delete User Use Case
 * Soft delete de usuario
 */

const { NotFoundError } = require('../utils/errors');

class DeleteUserUseCase {
  /**
   * @param {Object} userRepository - Repositorio de usuarios
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>} Usuario eliminado (soft delete)
   */
  async execute(usuarioId) {
    // Verificar que el usuario existe
    const existingUser = await this.userRepository.findById(usuarioId);
    if (!existingUser) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Soft delete: cambiar estado a inactivo
    const deletedUser = await this.userRepository.update(usuarioId, {
      estado: 'inactivo',
    });

    // Retornar usuario sin el hash de contraseña
    const { contrasenaHash: _, ...userWithoutPassword } = deletedUser;
    return userWithoutPassword;
  }
}

module.exports = DeleteUserUseCase;
