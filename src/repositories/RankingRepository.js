/**
 * Ranking Repository
 * Operaciones optimizadas de base de datos para rankings usando RANK()
 */

const prisma = require('../config/database');

class RankingRepository {
  /**
   * Obtener ranking de grupo usando función RANK() de SQL
   * Query optimizada con una sola llamada a la BD
   * @param {number} grupoId - ID del grupo (opcional para ranking global)
   * @param {number} evaluacionId - ID de evaluación específica (opcional)
   * @returns {Promise<Array>} Ranking ordenado con posiciones
   */
  async getRankingByGroup(grupoId = null, evaluacionId = null) {
    let whereClause = '';
    const params = [];

    if (grupoId) {
      whereClause += ' AND m.grupo_id = ?';
      params.push(parseInt(grupoId, 10));
    }

    if (evaluacionId) {
      whereClause += ' AND ev.evaluacion_id = ?';
      params.push(parseInt(evaluacionId, 10));
    }

    const query = `
      SELECT 
        e.estudiante_id AS estudianteId,
        e.codigo_interno AS codigoInterno,
        e.modalidad,
        u.nombres,
        u.apellidos,
        CONCAT(u.nombres, ' ', u.apellidos) AS nombreCompleto,
        AVG(n.nota) AS promedio,
        COUNT(DISTINCT n.nota_id) AS totalNotas,
        COUNT(DISTINCT CASE WHEN n.nota >= 11 THEN n.curso_id END) AS cursosAprobados,
        COUNT(DISTINCT CASE WHEN n.nota < 11 THEN n.curso_id END) AS cursosDesaprobados,
        MIN(n.nota) AS notaMinima,
        MAX(n.nota) AS notaMaxima,
        RANK() OVER (ORDER BY AVG(n.nota) DESC) AS posicion
      FROM estudiantes e
      INNER JOIN usuarios u ON e.usuario_id = u.usuario_id
      INNER JOIN matriculas m ON e.estudiante_id = m.estudiante_id AND m.estado = 'MATRICULADO'
      INNER JOIN evaluaciones ev ON m.grupo_id = ev.grupo_id
      INNER JOIN notas n ON e.estudiante_id = n.estudiante_id AND ev.evaluacion_id = n.evaluacion_id
      WHERE 1=1 ${whereClause}
      GROUP BY e.estudiante_id, e.codigo_interno, e.modalidad, u.nombres, u.apellidos
      HAVING COUNT(n.nota_id) > 0
      ORDER BY promedio DESC, nombreCompleto ASC;
    `;

    const result = await prisma.$queryRawUnsafe(query, ...params);

    // Transformar resultados (convertir BigInt y Decimal a números)
    return result.map(row => ({
      estudianteId: Number(row.estudianteId),
      codigoInterno: row.codigoInterno,
      modalidad: row.modalidad,
      nombres: row.nombres,
      apellidos: row.apellidos,
      nombreCompleto: row.nombreCompleto,
      promedio: row.promedio ? parseFloat(row.promedio) : 0,
      totalNotas: Number(row.totalNotas),
      cursosAprobados: Number(row.cursosAprobados),
      cursosDesaprobados: Number(row.cursosDesaprobados),
      notaMinima: row.notaMinima ? parseFloat(row.notaMinima) : 0,
      notaMaxima: row.notaMaxima ? parseFloat(row.notaMaxima) : 0,
      posicion: Number(row.posicion),
    }));
  }

  /**
   * Obtener posición de un estudiante en el ranking
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo (opcional)
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object|null>} Posición del estudiante o null
   */
  async getStudentPosition(estudianteId, grupoId = null, evaluacionId = null) {
    const ranking = await this.getRankingByGroup(grupoId, evaluacionId);
    const studentRank = ranking.find(r => r.estudianteId === parseInt(estudianteId, 10));

    if (!studentRank) {
      return null;
    }

    return {
      ...studentRank,
      totalEstudiantes: ranking.length,
      percentil: ((ranking.length - studentRank.posicion + 1) / ranking.length) * 100,
    };
  }

  /**
   * Calcular estadísticas del grupo
   * @param {number} grupoId - ID del grupo
   * @param {number} evaluacionId - ID de evaluación (opcional)
   * @returns {Promise<Object>} Estadísticas del grupo
   */
  async getGroupStats(grupoId, evaluacionId = null) {
    const ranking = await this.getRankingByGroup(grupoId, evaluacionId);

    if (ranking.length === 0) {
      return {
        totalEstudiantes: 0,
        promedioGrupo: 0,
        mejorPromedio: 0,
        peorPromedio: 0,
        aprobados: 0,
        desaprobados: 0,
      };
    }

    const promedios = ranking.map(r => r.promedio);
    const promedioGrupo = promedios.reduce((sum, p) => sum + p, 0) / promedios.length;
    const aprobados = ranking.filter(r => r.promedio >= 11).length;

    return {
      totalEstudiantes: ranking.length,
      promedioGrupo: parseFloat(promedioGrupo.toFixed(2)),
      mejorPromedio: Math.max(...promedios),
      peorPromedio: Math.min(...promedios),
      aprobados,
      desaprobados: ranking.length - aprobados,
      tasaAprobacion: parseFloat(((aprobados / ranking.length) * 100).toFixed(2)),
    };
  }
}

module.exports = RankingRepository;
