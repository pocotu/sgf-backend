/**
 * Ranking Service
 * Maneja la lógica de negocio para cálculo de rankings
 */

class RankingService {
  /**
   * @param {Object} gradeRepository - Repositorio de notas
   * @param {Object} enrollmentRepository - Repositorio de matrículas
   */
  constructor(gradeRepository, enrollmentRepository) {
    this.gradeRepository = gradeRepository;
    this.enrollmentRepository = enrollmentRepository;
  }

  /**
   * Calcular ranking de un grupo
   * @param {number} grupoId - ID del grupo
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object>} Ranking del grupo
   */
  async calculateGroupRanking(grupoId, evaluacionId = null) {
    // Obtener estudiantes matriculados en el grupo
    const matriculas = await this.enrollmentRepository.model.findMany({
      where: {
        grupoId: parseInt(grupoId, 10),
        estado: 'MATRICULADO',
      },
      include: {
        estudiante: {
          include: {
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
      },
    });

    if (matriculas.length === 0) {
      return {
        grupoId: parseInt(grupoId, 10),
        evaluacionId,
        promedioGrupo: 0,
        ranking: [],
      };
    }

    // Calcular promedio y cursos aprobados para cada estudiante
    const estudiantesConPromedios = await Promise.all(
      matriculas.map(async matricula => {
        const estudianteId = matricula.estudianteId;

        // Calcular promedio según si es evaluación específica o general
        let promedio;
        if (evaluacionId) {
          promedio = await this.gradeRepository.calculateAverageByEvaluation(
            evaluacionId,
            estudianteId
          );
        } else {
          promedio = await this.gradeRepository.calculateGeneralAverage(estudianteId, grupoId);
        }

        // Calcular cursos aprobados (nota >= 11)
        const cursosAprobados = await this.calculateApprovedCourses(
          estudianteId,
          grupoId,
          evaluacionId
        );

        return {
          estudianteId,
          codigoInterno: matricula.estudiante.codigoInterno,
          nombreCompleto: `${matricula.estudiante.usuario.nombres} ${matricula.estudiante.usuario.apellidos}`,
          promedio: promedio || 0,
          cursosAprobados,
        };
      })
    );

    // Ordenar por promedio descendente
    estudiantesConPromedios.sort((a, b) => b.promedio - a.promedio);

    // Asignar posiciones
    const ranking = estudiantesConPromedios.map((estudiante, index) => ({
      posicion: index + 1,
      ...estudiante,
    }));

    // Calcular promedio general del grupo
    const promedioGrupo =
      estudiantesConPromedios.reduce((sum, est) => sum + est.promedio, 0) /
      estudiantesConPromedios.length;

    return {
      grupoId: parseInt(grupoId, 10),
      evaluacionId,
      promedioGrupo: parseFloat(promedioGrupo.toFixed(2)),
      totalEstudiantes: ranking.length,
      ranking,
    };
  }

  /**
   * Obtener posición de un estudiante en el ranking
   * @param {number} estudianteId - ID del estudiante
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object>} Posición del estudiante
   */
  async getStudentPosition(estudianteId, evaluacionId = null) {
    // Obtener matrícula activa del estudiante
    const matricula = await this.enrollmentRepository.findActiveByStudent(estudianteId);

    if (!matricula) {
      return null;
    }

    const grupoId = matricula.grupoId;

    // Calcular ranking del grupo
    const rankingData = await this.calculateGroupRanking(grupoId, evaluacionId);

    // Encontrar posición del estudiante
    const estudianteEnRanking = rankingData.ranking.find(est => est.estudianteId === estudianteId);

    if (!estudianteEnRanking) {
      return null;
    }

    // Calcular diferencia con el primer lugar
    const primerLugar = rankingData.ranking[0];
    const diferenciaConPrimero = primerLugar.promedio - estudianteEnRanking.promedio;

    return {
      estudianteId,
      grupoId,
      evaluacionId,
      posicion: estudianteEnRanking.posicion,
      totalEstudiantes: rankingData.totalEstudiantes,
      promedio: estudianteEnRanking.promedio,
      cursosAprobados: estudianteEnRanking.cursosAprobados,
      promedioGrupo: rankingData.promedioGrupo,
      diferenciaConPrimero: parseFloat(diferenciaConPrimero.toFixed(2)),
    };
  }

  /**
   * Calcular cursos aprobados (nota >= 11)
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<number>} Cantidad de cursos aprobados
   */
  async calculateApprovedCourses(estudianteId, grupoId, evaluacionId = null) {
    const filters = {
      estudianteId,
    };

    if (evaluacionId) {
      filters.evaluacionId = evaluacionId;
    } else {
      // Si no hay evaluacionId específica, filtrar por grupo a través de evaluación
      filters.evaluacion = {
        grupoId: parseInt(grupoId, 10),
      };
    }

    // Obtener todas las notas del estudiante
    const notas = await this.gradeRepository.model.findMany({
      where: filters,
      select: {
        nota: true,
        cursoId: true,
      },
    });

    // Agrupar por curso y obtener el promedio de cada curso
    const notasPorCurso = {};
    notas.forEach(nota => {
      if (!notasPorCurso[nota.cursoId]) {
        notasPorCurso[nota.cursoId] = [];
      }
      notasPorCurso[nota.cursoId].push(parseFloat(nota.nota));
    });

    // Contar cursos con promedio >= 11
    let cursosAprobados = 0;
    for (const cursoId in notasPorCurso) {
      const notasCurso = notasPorCurso[cursoId];
      const promedioCurso = notasCurso.reduce((sum, nota) => sum + nota, 0) / notasCurso.length;
      if (promedioCurso >= 11) {
        cursosAprobados++;
      }
    }

    return cursosAprobados;
  }
}

module.exports = RankingService;
