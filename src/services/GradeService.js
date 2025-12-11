/**
 * Grade Service
 * Maneja la lógica de negocio para gestión de notas
 */

const { ValidationError, BusinessLogicError } = require('../utils/errors');

class GradeService {
  /**
   * @param {Object} gradeRepository - Repositorio de notas
   * @param {Object} enrollmentRepository - Repositorio de matrículas
   * @param {Object} evaluationRepository - Repositorio de evaluaciones
   * @param {Object} courseRepository - Repositorio de cursos
   */
  constructor(gradeRepository, enrollmentRepository, evaluationRepository, courseRepository) {
    this.gradeRepository = gradeRepository;
    this.enrollmentRepository = enrollmentRepository;
    this.evaluationRepository = evaluationRepository;
    this.courseRepository = courseRepository;
  }

  /**
   * Validar datos de nota
   * @param {Object} gradeData - Datos de la nota
   */
  validateGradeData(gradeData) {
    const errors = {};

    // Validar evaluacionId
    if (!gradeData.evaluacionId) {
      errors.evaluacionId = 'ID de evaluación es requerido';
    } else {
      const evaluacionId = parseInt(gradeData.evaluacionId, 10);
      if (isNaN(evaluacionId) || evaluacionId <= 0) {
        errors.evaluacionId = 'ID de evaluación debe ser un número válido';
      }
    }

    // Validar estudianteId
    if (!gradeData.estudianteId) {
      errors.estudianteId = 'ID de estudiante es requerido';
    } else {
      const estudianteId = parseInt(gradeData.estudianteId, 10);
      if (isNaN(estudianteId) || estudianteId <= 0) {
        errors.estudianteId = 'ID de estudiante debe ser un número válido';
      }
    }

    // Validar cursoId
    if (!gradeData.cursoId) {
      errors.cursoId = 'ID de curso es requerido';
    } else {
      const cursoId = parseInt(gradeData.cursoId, 10);
      if (isNaN(cursoId) || cursoId <= 0) {
        errors.cursoId = 'ID de curso debe ser un número válido';
      }
    }

    // Validar nota (rango 0-20)
    if (gradeData.nota === undefined || gradeData.nota === null) {
      errors.nota = 'Nota es requerida';
    } else {
      const nota = parseFloat(gradeData.nota);
      if (isNaN(nota) || nota < 0 || nota > 20) {
        errors.nota = 'Nota debe estar en el rango 0-20';
      }
    }

    // Validar observaciones si se proporcionan
    if (gradeData.observaciones && gradeData.observaciones.length > 500) {
      errors.observaciones = 'Observaciones no pueden exceder 500 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Errores de validación', errors);
    }
  }

  /**
   * Validar que la evaluación existe
   * @param {number} evaluacionId - ID de la evaluación
   * @returns {Promise<Object>} Evaluación con grupo
   */
  async validateEvaluationExists(evaluacionId) {
    const evaluacion = await this.evaluationRepository.model.findUnique({
      where: { evaluacionId: parseInt(evaluacionId, 10) },
      include: {
        grupo: {
          select: {
            grupoId: true,
            area: true,
            modalidad: true,
            nombreGrupo: true,
          },
        },
      },
    });

    if (!evaluacion) {
      throw new BusinessLogicError('La evaluación especificada no existe', 'EVALUATION_NOT_FOUND');
    }
    return evaluacion;
  }

  /**
   * Validar que el estudiante está matriculado en el grupo de la evaluación
   * @param {number} estudianteId - ID del estudiante
   * @param {number} grupoId - ID del grupo
   */
  async validateStudentEnrolled(estudianteId, grupoId) {
    const matricula = await this.enrollmentRepository.findOne({
      estudianteId,
      grupoId,
      estado: 'MATRICULADO',
    });

    if (!matricula) {
      throw new BusinessLogicError(
        'El estudiante no está matriculado en el grupo de esta evaluación',
        'STUDENT_NOT_ENROLLED'
      );
    }

    return matricula;
  }

  /**
   * Validar que el curso pertenece al área del grupo
   * @param {number} cursoId - ID del curso
   * @param {string} areaGrupo - Área del grupo
   */
  async validateCourseArea(cursoId, areaGrupo) {
    const curso = await this.courseRepository.findById(cursoId);

    if (!curso) {
      throw new BusinessLogicError('El curso especificado no existe', 'COURSE_NOT_FOUND');
    }

    if (curso.area !== areaGrupo) {
      throw new BusinessLogicError(
        `El curso pertenece al área ${curso.area}, pero el grupo es del área ${areaGrupo}`,
        'COURSE_AREA_MISMATCH'
      );
    }

    return curso;
  }

  /**
   * Validar que no existe una nota duplicada
   * @param {number} evaluacionId - ID de la evaluación
   * @param {number} estudianteId - ID del estudiante
   * @param {number} cursoId - ID del curso
   */
  async validateNoDuplicate(evaluacionId, estudianteId, cursoId) {
    const exists = await this.gradeRepository.existsDuplicate(evaluacionId, estudianteId, cursoId);

    if (exists) {
      throw new BusinessLogicError(
        'Ya existe una nota registrada para este estudiante, curso y evaluación',
        'GRADE_DUPLICATE'
      );
    }
  }

  /**
   * Validar todas las reglas de negocio para registrar una nota
   * @param {Object} gradeData - Datos de la nota
   * @returns {Promise<Object>} Datos validados (evaluación, matrícula, curso)
   */
  async validateGradeBusinessRules(gradeData) {
    // Validar que la evaluación existe
    const evaluacion = await this.validateEvaluationExists(gradeData.evaluacionId);

    // Validar que el estudiante está matriculado en el grupo
    const matricula = await this.validateStudentEnrolled(
      gradeData.estudianteId,
      evaluacion.grupoId
    );

    // Validar que el curso pertenece al área del grupo
    const curso = await this.validateCourseArea(gradeData.cursoId, evaluacion.grupo.area);

    // Validar que no existe duplicado
    await this.validateNoDuplicate(
      gradeData.evaluacionId,
      gradeData.estudianteId,
      gradeData.cursoId
    );

    return { evaluacion, matricula, curso };
  }
}

module.exports = GradeService;
