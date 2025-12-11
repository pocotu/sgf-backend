/**
 * User Controller
 * Maneja las peticiones HTTP relacionadas con gestión de usuarios
 */

const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class UserController {
  /**
   * @param {Object} registerUserUseCase - Caso de uso para registrar usuario
   * @param {Object} getUsersUseCase - Caso de uso para listar usuarios
   * @param {Object} getUserByIdUseCase - Caso de uso para obtener usuario por ID
   * @param {Object} updateUserUseCase - Caso de uso para actualizar usuario
   * @param {Object} deleteUserUseCase - Caso de uso para eliminar usuario
   */
  constructor(
    registerUserUseCase,
    getUsersUseCase,
    getUserByIdUseCase,
    updateUserUseCase,
    deleteUserUseCase
  ) {
    this.registerUserUseCase = registerUserUseCase;
    this.getUsersUseCase = getUsersUseCase;
    this.getUserByIdUseCase = getUserByIdUseCase;
    this.updateUserUseCase = updateUserUseCase;
    this.deleteUserUseCase = deleteUserUseCase;
  }

  /**
   * POST /api/users
   * Crear nuevo usuario
   */
  create = asyncHandler(async (req, res) => {
    const userData = req.body;

    const user = await this.registerUserUseCase.execute(userData);

    return res.status(201).json(
      successResponse(user, 'Usuario creado exitosamente')
    );
  });

  /**
   * GET /api/users
   * Listar usuarios con filtros y paginación
   */
  list = asyncHandler(async (req, res) => {
    const { rol, estado, search, page, limit } = req.query;

    const filters = { rol, estado, search };
    const pagination = { page, limit };

    const result = await this.getUsersUseCase.execute(filters, pagination);

    return res.status(200).json(
      paginatedResponse({
        data: result.usuarios,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        message: 'Usuarios obtenidos exitosamente',
      })
    );
  });

  /**
   * GET /api/users/:id
   * Obtener usuario por ID
   */
  getById = asyncHandler(async (req, res) => {
    const usuarioId = parseInt(req.params.id, 10);

    const user = await this.getUserByIdUseCase.execute(usuarioId);

    return res.status(200).json(
      successResponse(user, 'Usuario obtenido exitosamente')
    );
  });

  /**
   * PUT /api/users/:id
   * Actualizar usuario
   */
  update = asyncHandler(async (req, res) => {
    const usuarioId = parseInt(req.params.id, 10);
    const updateData = req.body;

    const user = await this.updateUserUseCase.execute(usuarioId, updateData);

    return res.status(200).json(
      successResponse(user, 'Usuario actualizado exitosamente')
    );
  });

  /**
   * DELETE /api/users/:id
   * Eliminar usuario (soft delete)
   */
  delete = asyncHandler(async (req, res) => {
    const usuarioId = parseInt(req.params.id, 10);

    const user = await this.deleteUserUseCase.execute(usuarioId);

    return res.status(200).json(
      successResponse(user, 'Usuario eliminado exitosamente')
    );
  });
}

module.exports = UserController;
