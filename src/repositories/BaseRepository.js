/**
 * Base Repository Pattern
 * Abstraccion base para operaciones CRUD con Prisma
 */

class BaseRepository {
  constructor(model) {
    if (!model) {
      throw new Error('Model is required for BaseRepository');
    }
    this.model = model;
  }

  /**
   * Crear un nuevo registro
   */
  create(data) {
    return this.model.create({ data });
  }

  /**
   * Buscar por ID
   */
  findById(id) {
    return this.model.findUnique({ where: { [this.getIdField()]: id } });
  }

  /**
   * Buscar todos con opciones
   */
  findAll(options = {}) {
    return this.model.findMany(options);
  }

  /**
   * Buscar uno con condiciones
   */
  findOne(where) {
    return this.model.findFirst({ where });
  }

  /**
   * Actualizar por ID
   */
  update(id, data) {
    return this.model.update({
      where: { [this.getIdField()]: id },
      data,
    });
  }

  /**
   * Eliminar por ID (hard delete)
   */
  delete(id) {
    return this.model.delete({
      where: { [this.getIdField()]: id },
    });
  }

  /**
   * Soft delete - actualizar estado a inactivo
   * @param {number} id - ID del registro
   * @returns {Promise<Object>} Registro actualizado
   */
  softDelete(id) {
    return this.model.update({
      where: { [this.getIdField()]: id },
      data: { estado: 'inactivo' },
    });
  }

  /**
   * Contar registros
   */
  count(where = {}) {
    return this.model.count({ where });
  }

  /**
   * Verificar si existe
   */
  async exists(where) {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Obtener nombre del campo ID (override en subclases si es necesario)
   */
  getIdField() {
    return 'id';
  }
}

module.exports = BaseRepository;
