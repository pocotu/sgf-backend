/**
 * Update User Use Case
 * Actualizar usuario (prevenir cambios en DNI, usuarioId, rol)
 */

const { NotFoundError, BusinessLogicError } = require('../utils/errors');

class UpdateUserUseCase {
  /**
   * @param {Object} userRepository - Repositorio de usuarios
   * @param {Object} userService - Servicio de usuarios
   */
  constructor(userRepository, userService) {
    this.userRepository = userRepository;
    this.userService = userService;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} usuarioId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async execute(usuarioId, updateData) {
    // Verificar que el usuario existe
    const existingUser = await this.userRepository.findById(usuarioId);
    if (!existingUser) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Prevenir cambios en campos protegidos
    if (updateData.dni !== undefined) {
      throw new BusinessLogicError(
        'No se permite cambiar el DNI',
        'USER_DNI_IMMUTABLE'
      );
    }

    if (updateData.usuarioId !== undefined) {
      throw new BusinessLogicError(
        'No se permite cambiar el ID de usuario',
        'USER_ID_IMMUTABLE'
      );
    }

    if (updateData.rol !== undefined) {
      throw new BusinessLogicError(
        'No se permite cambiar el rol',
        'USER_ROLE_IMMUTABLE'
      );
    }

    // Validar datos de actualización
    await this.userService.validateUserData(updateData, true);

    // Verificar unicidad de correo si se está actualizando
    if (updateData.correo) {
      await this.userService.checkUniqueness(null, updateData.correo, usuarioId);
    }

    // Preparar datos para actualizar (solo campos permitidos)
    const allowedFields = ['correo', 'nombres', 'apellidos', 'telefono', 'estado'];
    const dataToUpdate = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        dataToUpdate[field] = updateData[field];
      }
    });

    // Actualizar usuario
    const updatedUser = await this.userRepository.update(usuarioId, dataToUpdate);

    // Retornar usuario sin el hash de contraseña
    const { contrasenaHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}

module.exports = UpdateUserUseCase;
