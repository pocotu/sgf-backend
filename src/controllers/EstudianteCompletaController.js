/**
 * Estudiante Completa Controller
 * Maneja las peticiones HTTP para la vista estudiantes_completa
 */

const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

class EstudianteCompletaController {
  /**
   * @param {Object} estudianteCompletaRepository - Repositorio para la vista estudiantes_completa
   */
  constructor(estudianteCompletaRepository) {
    this.estudianteCompletaRepository = estudianteCompletaRepository;
  }

  /**
   * GET /api/estudiantes-completa
   * Listar todos los estudiantes con información completa (JOIN usuarios + estudiantes)
   */
  list = asyncHandler(async (req, res) => {
    const { modalidad, search, estado } = req.query;

    const filters = {};
    if (modalidad) {
      filters.modalidad = modalidad;
    }
    if (estado) {
      filters.estadoUsuario = estado;
    }
    if (search) {
      filters.OR = [
        { nombres: { contains: search, mode: 'insensitive' } },
        { apellidos: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search } },
        { codigoInterno: { contains: search } },
      ];
    }

    const estudiantes = await this.estudianteCompletaRepository.findAll(filters);

    return res.json(
      successResponse(estudiantes, `${estudiantes.length} estudiante(s) encontrado(s)`)
    );
  });

  /**
   * GET /api/estudiantes-completa/:id
   * Obtener un estudiante específico por ID
   */
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const estudiante = await this.estudianteCompletaRepository.findById(parseInt(id, 10));

    if (!estudiante) {
      const { NotFoundError } = require('../utils/errors');
      throw new NotFoundError('Estudiante no encontrado');
    }

    return res.json(successResponse(estudiante, 'Estudiante encontrado'));
  });

  /**
   * GET /api/estudiantes-completa/dni/:dni
   * Buscar estudiante por DNI
   */
  getByDni = asyncHandler(async (req, res) => {
    const { dni } = req.params;

    const estudiante = await this.estudianteCompletaRepository.findByDni(dni);

    if (!estudiante) {
      const { NotFoundError } = require('../utils/errors');
      throw new NotFoundError('Estudiante no encontrado con ese DNI');
    }

    return res.json(successResponse(estudiante, 'Estudiante encontrado'));
  });
}

module.exports = EstudianteCompletaController;
