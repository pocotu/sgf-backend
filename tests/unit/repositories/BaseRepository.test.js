const BaseRepository = require('../../../src/repositories/BaseRepository');

describe('BaseRepository', () => {
  let mockModel;
  let repository;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    repository = new BaseRepository(mockModel);
  });

  describe('constructor', () => {
    it('should throw error if model is not provided', () => {
      expect(() => new BaseRepository()).toThrow('Model is required for BaseRepository');
    });

    it('should create instance with model', () => {
      expect(repository.model).toBe(mockModel);
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const data = { name: 'Test' };
      const expected = { id: 1, ...data };
      mockModel.create.mockResolvedValue(expected);

      const result = await repository.create(data);

      expect(mockModel.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('should find record by id', async () => {
      const expected = { id: 1, name: 'Test' };
      mockModel.findUnique.mockResolvedValue(expected);

      const result = await repository.findById(1);

      expect(mockModel.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should find all records', async () => {
      const expected = [{ id: 1 }, { id: 2 }];
      mockModel.findMany.mockResolvedValue(expected);

      const result = await repository.findAll();

      expect(mockModel.findMany).toHaveBeenCalledWith({});
      expect(result).toEqual(expected);
    });

    it('should find all records with options', async () => {
      const options = { where: { active: true } };
      mockModel.findMany.mockResolvedValue([]);

      await repository.findAll(options);

      expect(mockModel.findMany).toHaveBeenCalledWith(options);
    });
  });

  describe('update', () => {
    it('should update record by id', async () => {
      const data = { name: 'Updated' };
      const expected = { id: 1, ...data };
      mockModel.update.mockResolvedValue(expected);

      const result = await repository.update(1, data);

      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    it('should delete record by id', async () => {
      const expected = { id: 1 };
      mockModel.delete.mockResolvedValue(expected);

      const result = await repository.delete(1);

      expect(mockModel.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expected);
    });
  });

  describe('count', () => {
    it('should count all records', async () => {
      mockModel.count.mockResolvedValue(5);

      const result = await repository.count();

      expect(mockModel.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toBe(5);
    });

    it('should count records with where clause', async () => {
      const where = { active: true };
      mockModel.count.mockResolvedValue(3);

      const result = await repository.count(where);

      expect(mockModel.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(3);
    });
  });

  describe('exists', () => {
    it('should return true if record exists', async () => {
      mockModel.count.mockResolvedValue(1);

      const result = await repository.exists({ id: 1 });

      expect(result).toBe(true);
    });

    it('should return false if record does not exist', async () => {
      mockModel.count.mockResolvedValue(0);

      const result = await repository.exists({ id: 999 });

      expect(result).toBe(false);
    });
  });
});
