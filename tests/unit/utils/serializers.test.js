const {
  serializeDate,
  serializeDates,
  getNombreCompleto,
  addNombreCompleto,
  calcularCuposDisponibles,
  addCuposDisponibles,
  calcularPorcentajeAsistencia,
  addPorcentajeAsistencia,
  serializeUsuario,
  serializeEstudiante,
  serializeGrupo,
  serializeMatricula,
  serializeAsistencia,
  serializeEvaluacion,
  serializeNota,
  serializeCurso,
  serializeArray,
} = require('../../../src/utils/serializers');

describe('Serializers', () => {
  describe('serializeDate', () => {
    it('should serialize Date object to ISO 8601 string', () => {
      const date = new Date('2025-01-15T10:30:00Z');
      const result = serializeDate(date);
      expect(result).toBe('2025-01-15T10:30:00.000Z');
    });

    it('should serialize date string to ISO 8601 string', () => {
      const dateString = '2025-01-15';
      const result = serializeDate(dateString);
      expect(result).toMatch(/2025-01-15T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should return null for null input', () => {
      expect(serializeDate(null)).toBeNull();
    });

    it('should return null for invalid date', () => {
      expect(serializeDate('invalid-date')).toBeNull();
    });
  });

  describe('serializeDates', () => {
    it('should serialize common date fields', () => {
      const obj = {
        id: 1,
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
        fechaActualizacion: new Date('2025-01-16T10:00:00Z'),
        nombre: 'Test',
      };

      const result = serializeDates(obj);

      expect(result.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
      expect(result.fechaActualizacion).toBe('2025-01-16T10:00:00.000Z');
      expect(result.nombre).toBe('Test');
    });

    it('should serialize custom date fields', () => {
      const obj = {
        id: 1,
        customDate: new Date('2025-01-15T10:00:00Z'),
      };

      const result = serializeDates(obj, ['customDate']);

      expect(result.customDate).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should handle null object', () => {
      expect(serializeDates(null)).toBeNull();
    });
  });

  describe('getNombreCompleto', () => {
    it('should concatenate nombres and apellidos', () => {
      const usuario = {
        nombres: 'Juan',
        apellidos: 'Pérez',
      };

      expect(getNombreCompleto(usuario)).toBe('Juan Pérez');
    });

    it('should handle missing apellidos', () => {
      const usuario = {
        nombres: 'Juan',
      };

      expect(getNombreCompleto(usuario)).toBe('Juan');
    });

    it('should handle null usuario', () => {
      expect(getNombreCompleto(null)).toBe('');
    });
  });

  describe('addNombreCompleto', () => {
    it('should add nombreCompleto from usuario object', () => {
      const obj = {
        id: 1,
        usuario: {
          nombres: 'Juan',
          apellidos: 'Pérez',
        },
      };

      const result = addNombreCompleto(obj);

      expect(result.nombreCompleto).toBe('Juan Pérez');
    });

    it('should add nombreCompleto from direct nombres/apellidos', () => {
      const obj = {
        id: 1,
        nombres: 'Juan',
        apellidos: 'Pérez',
      };

      const result = addNombreCompleto(obj);

      expect(result.nombreCompleto).toBe('Juan Pérez');
    });

    it('should handle null object', () => {
      expect(addNombreCompleto(null)).toBeNull();
    });
  });

  describe('calcularCuposDisponibles', () => {
    it('should calculate available spots correctly', () => {
      const grupo = {
        capacidad: 30,
        matriculasActivas: 15,
      };

      expect(calcularCuposDisponibles(grupo)).toBe(15);
    });

    it('should return 0 when group is full', () => {
      const grupo = {
        capacidad: 30,
        matriculasActivas: 30,
      };

      expect(calcularCuposDisponibles(grupo)).toBe(0);
    });

    it('should return 0 when over capacity', () => {
      const grupo = {
        capacidad: 30,
        matriculasActivas: 35,
      };

      expect(calcularCuposDisponibles(grupo)).toBe(0);
    });

    it('should handle null grupo', () => {
      expect(calcularCuposDisponibles(null)).toBe(0);
    });
  });

  describe('addCuposDisponibles', () => {
    it('should add cuposDisponibles field', () => {
      const grupo = {
        grupoId: 1,
        capacidad: 30,
        matriculasActivas: 15,
      };

      const result = addCuposDisponibles(grupo);

      expect(result.cuposDisponibles).toBe(15);
    });

    it('should handle null grupo', () => {
      expect(addCuposDisponibles(null)).toBeNull();
    });
  });

  describe('calcularPorcentajeAsistencia', () => {
    it('should calculate attendance percentage correctly', () => {
      const asistencia = {
        presentes: 8,
        tardanzas: 2,
        totalClases: 10,
      };

      expect(calcularPorcentajeAsistencia(asistencia)).toBe(100);
    });

    it('should calculate with only presentes', () => {
      const asistencia = {
        presentes: 7,
        tardanzas: 0,
        totalClases: 10,
      };

      expect(calcularPorcentajeAsistencia(asistencia)).toBe(70);
    });

    it('should return 0 when totalClases is 0', () => {
      const asistencia = {
        presentes: 0,
        tardanzas: 0,
        totalClases: 0,
      };

      expect(calcularPorcentajeAsistencia(asistencia)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const asistencia = {
        presentes: 2,
        tardanzas: 1,
        totalClases: 9,
      };

      expect(calcularPorcentajeAsistencia(asistencia)).toBe(33.33);
    });

    it('should handle null asistencia', () => {
      expect(calcularPorcentajeAsistencia(null)).toBe(0);
    });
  });

  describe('addPorcentajeAsistencia', () => {
    it('should add porcentajeAsistencia field', () => {
      const obj = {
        presentes: 8,
        tardanzas: 2,
        totalClases: 10,
      };

      const result = addPorcentajeAsistencia(obj);

      expect(result.porcentajeAsistencia).toBe(100);
    });

    it('should handle null object', () => {
      expect(addPorcentajeAsistencia(null)).toBeNull();
    });
  });

  describe('serializeUsuario', () => {
    it('should serialize usuario with nombreCompleto and dates', () => {
      const usuario = {
        usuarioId: 1,
        nombres: 'Juan',
        apellidos: 'Pérez',
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      };

      const result = serializeUsuario(usuario);

      expect(result.nombreCompleto).toBe('Juan Pérez');
      expect(result.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should handle null usuario', () => {
      expect(serializeUsuario(null)).toBeNull();
    });
  });

  describe('serializeEstudiante', () => {
    it('should serialize estudiante with nested usuario', () => {
      const estudiante = {
        estudianteId: 1,
        codigoInterno: '2025-A-ORD-001',
        usuario: {
          nombres: 'Juan',
          apellidos: 'Pérez',
          fechaCreacion: new Date('2025-01-15T10:00:00Z'),
        },
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      };

      const result = serializeEstudiante(estudiante);

      expect(result.nombreCompleto).toBe('Juan Pérez');
      expect(result.usuario.nombreCompleto).toBe('Juan Pérez');
      expect(result.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should handle null estudiante', () => {
      expect(serializeEstudiante(null)).toBeNull();
    });
  });

  describe('serializeGrupo', () => {
    it('should serialize grupo with cuposDisponibles', () => {
      const grupo = {
        grupoId: 1,
        capacidad: 30,
        matriculasActivas: 15,
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      };

      const result = serializeGrupo(grupo);

      expect(result.cuposDisponibles).toBe(15);
      expect(result.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should handle null grupo', () => {
      expect(serializeGrupo(null)).toBeNull();
    });
  });

  describe('serializeMatricula', () => {
    it('should serialize matricula with nested objects', () => {
      const matricula = {
        matriculaId: 1,
        fechaMatricula: new Date('2025-01-15'),
        estudiante: {
          estudianteId: 1,
          usuario: {
            nombres: 'Juan',
            apellidos: 'Pérez',
          },
        },
        grupo: {
          grupoId: 1,
          capacidad: 30,
          matriculasActivas: 15,
        },
      };

      const result = serializeMatricula(matricula);

      expect(result.estudiante.nombreCompleto).toBe('Juan Pérez');
      expect(result.grupo.cuposDisponibles).toBe(15);
      expect(result.fechaMatricula).toMatch(/2025-01-15/);
    });

    it('should handle null matricula', () => {
      expect(serializeMatricula(null)).toBeNull();
    });
  });

  describe('serializeAsistencia', () => {
    it('should serialize asistencia with porcentajeAsistencia', () => {
      const asistencia = {
        asistenciaId: 1,
        fechaClase: new Date('2025-01-15'),
        presentes: 8,
        tardanzas: 2,
        totalClases: 10,
        estudiante: {
          estudianteId: 1,
          usuario: {
            nombres: 'Juan',
            apellidos: 'Pérez',
          },
        },
      };

      const result = serializeAsistencia(asistencia);

      expect(result.porcentajeAsistencia).toBe(100);
      expect(result.fechaClase).toMatch(/2025-01-15/);
      expect(result.estudiante.nombreCompleto).toBe('Juan Pérez');
    });

    it('should handle null asistencia', () => {
      expect(serializeAsistencia(null)).toBeNull();
    });
  });

  describe('serializeEvaluacion', () => {
    it('should serialize evaluacion with dates', () => {
      const evaluacion = {
        evaluacionId: 1,
        fechaEvaluacion: new Date('2025-01-15'),
        grupo: {
          grupoId: 1,
          capacidad: 30,
          matriculasActivas: 15,
        },
      };

      const result = serializeEvaluacion(evaluacion);

      expect(result.fechaEvaluacion).toMatch(/2025-01-15/);
      expect(result.grupo.cuposDisponibles).toBe(15);
    });

    it('should handle null evaluacion', () => {
      expect(serializeEvaluacion(null)).toBeNull();
    });
  });

  describe('serializeNota', () => {
    it('should serialize nota with nested objects', () => {
      const nota = {
        notaId: 1,
        nota: 18.5,
        estudiante: {
          estudianteId: 1,
          usuario: {
            nombres: 'Juan',
            apellidos: 'Pérez',
          },
        },
        curso: {
          cursoId: 1,
          fechaCreacion: new Date('2025-01-15T10:00:00Z'),
        },
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      };

      const result = serializeNota(nota);

      expect(result.estudiante.nombreCompleto).toBe('Juan Pérez');
      expect(result.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
      expect(result.curso.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should handle null nota', () => {
      expect(serializeNota(null)).toBeNull();
    });
  });

  describe('serializeCurso', () => {
    it('should serialize curso with dates', () => {
      const curso = {
        cursoId: 1,
        nombre: 'Matemática',
        fechaCreacion: new Date('2025-01-15T10:00:00Z'),
      };

      const result = serializeCurso(curso);

      expect(result.fechaCreacion).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should handle null curso', () => {
      expect(serializeCurso(null)).toBeNull();
    });
  });

  describe('serializeArray', () => {
    it('should serialize array of objects', () => {
      const usuarios = [
        {
          usuarioId: 1,
          nombres: 'Juan',
          apellidos: 'Pérez',
        },
        {
          usuarioId: 2,
          nombres: 'María',
          apellidos: 'García',
        },
      ];

      const result = serializeArray(usuarios, serializeUsuario);

      expect(result).toHaveLength(2);
      expect(result[0].nombreCompleto).toBe('Juan Pérez');
      expect(result[1].nombreCompleto).toBe('María García');
    });

    it('should return empty array for non-array input', () => {
      expect(serializeArray(null, serializeUsuario)).toEqual([]);
      expect(serializeArray({}, serializeUsuario)).toEqual([]);
    });
  });
});
