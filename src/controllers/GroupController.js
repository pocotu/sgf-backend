/**
 * Group Controller
 * Maneja las peticiones HTTP relacionadas con gestión de grupos
 */

const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class GroupController {
  /**
   * @param {Object} createGroupUseCase - Caso de uso para crear grupo
   * @param {Object} getGroupsUseCase - Caso de uso para listar grupos
   * @param {Object} getGroupByIdUseCase - Caso de uso para obtener grupo
   * @param {Object} updateGroupUseCase - Caso de uso para actualizar grupo
   * @param {Object} activateDeactivateGroupUseCase - Caso de uso cambiar estado
   */
  constructor(
    createGroupUseCase,
    getGroupsUseCase,
    getGroupByIdUseCase,
    updateGroupUseCase,
    activateDeactivateGroupUseCase
  ) {
    this.createGroupUseCase = createGroupUseCase;
    this.getGroupsUseCase = getGroupsUseCase;
    this.getGroupByIdUseCase = getGroupByIdUseCase;
    this.updateGroupUseCase = updateGroupUseCase;
    this.activateDeactivateGroupUseCase = activateDeactivateGroupUseCase;
  }

  /**
   * POST /api/groups
   * Crear nuevo grupo
   */
  create = asyncHandler(async (req, res) => {
    const groupData = req.body;

    const group = await this.createGroupUseCase.execute(groupData);

    return res.status(201).json(successResponse(group, 'Grupo creado exitosamente'));
  });

  /**
   * GET /api/groups
   * Listar grupos con filtros y paginación
   */
  list = asyncHandler(async (req, res) => {
    const { modalidad, area, estado, search, page, limit } = req.query;

    const filters = { modalidad, area, estado, search };
    const pagination = { page, limit };

    const result = await this.getGroupsUseCase.execute(filters, pagination);

    return res.status(200).json(
      paginatedResponse({
        data: result.grupos,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        message: 'Grupos obtenidos exitosamente',
      })
    );
  });

  /**
   * GET /api/groups/:id
   * Obtener grupo por ID
   */
  getById = asyncHandler(async (req, res) => {
    const grupoId = parseInt(req.params.id, 10);

    const group = await this.getGroupByIdUseCase.execute(grupoId);

    return res.status(200).json(successResponse(group, 'Grupo obtenido exitosamente'));
  });

  /**
   * PUT /api/groups/:id
   * Actualizar grupo
   */
  update = asyncHandler(async (req, res) => {
    const grupoId = parseInt(req.params.id, 10);
    const updateData = req.body;

    const group = await this.updateGroupUseCase.execute(grupoId, updateData);

    return res.status(200).json(successResponse(group, 'Grupo actualizado exitosamente'));
  });

  /**
   * PATCH /api/groups/:id/status
   * Cambiar estado del grupo (ACTIVO/INACTIVO)
   */
  changeStatus = asyncHandler(async (req, res) => {
    const grupoId = parseInt(req.params.id, 10);
    const { estado } = req.body;

    const group = await this.activateDeactivateGroupUseCase.execute(grupoId, estado);

    return res
      .status(200)
      .json(successResponse(group, 'Estado del grupo actualizado exitosamente'));
  });
}

module.exports = GroupController;
