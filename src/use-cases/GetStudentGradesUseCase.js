/**
 * Get Student Grades Use Case
 * Obtener notas de un estudiante con cálculo de promedios
 */

class GetStudentGradesUseCase {
  /**
   * @param {Object} gradeRepository - Repositorio de notas
   */
  constructor(gradeRepository) {
    this.gradeRepository = gradeRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {number} estudianteId - ID del estudiante
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Notas y promedios del estudiante
   */
  async execute(estudianteId, filters = {}) {
    const { grupoId, evaluacionId } = filters;

    // Obtener notas del estudiante
    const notas = await this.gradeRepository.getByStudent(estudianteId, filters);

    // Calcular promedio general
    const promedioGeneral = await this.gradeRepository.calculateGeneralAverage(
      estudianteId,
      grupoId
    );

    // Si se especifica una evaluación, calcular promedio de esa evaluación
    let promedioEvaluacion = null;
    if (evaluacionId) {
      promedioEvaluacion = await this.gradeRepository.calculateAverageByEvaluation(
        evaluacionId,
        estudianteId
      );
    }

    // Agrupar notas por evaluación
    const notasPorEvaluacion = {};
    const promediosPorEvaluacion = {};

    for (const nota of notas) {
      const evalId = nota.evaluacionId;

      if (!notasPorEvaluacion[evalId]) {
        notasPorEvaluacion[evalId] = {
          evaluacionId: evalId,
          numeroSemana: nota.evaluacion.numeroSemana,
          fechaEvaluacion: nota.evaluacion.fechaEvaluacion,
          notas: [],
        };
      }

      notasPorEvaluacion[evalId].notas.push({
        notaId: nota.notaId,
        curso: nota.curso,
        nota: parseFloat(nota.nota),
        observaciones: nota.observaciones,
      });
    }

    // Calcular promedio por evaluación
    for (const evalId in notasPorEvaluacion) {
      const promedio = await this.gradeRepository.calculateAverageByEvaluation(
        parseInt(evalId, 10),
        estudianteId
      );
      promediosPorEvaluacion[evalId] = promedio;
      notasPorEvaluacion[evalId].promedio = promedio;
    }

    return {
      estudianteId,
      grupoId: grupoId || null,
      promedioGeneral,
      promedioEvaluacion,
      totalNotas: notas.length,
      notasPorEvaluacion: Object.values(notasPorEvaluacion),
    };
  }
}

module.exports = GetStudentGradesUseCase;
