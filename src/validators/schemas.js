/**
 * Esquemas de validación para diferentes entidades
 * Estos esquemas se usan con el middleware de validación
 */

const { VALIDATION_TYPES } = require('../middleware/validation');

/**
 * Esquemas para Usuario
 */
const userSchemas = {
  create: {
    dni: {
      required: true,
      type: VALIDATION_TYPES.DNI,
    },
    correo: {
      required: false,
      type: VALIDATION_TYPES.EMAIL,
    },
    nombres: {
      required: true,
      type: VALIDATION_TYPES.STRING,
      minLength: 2,
      maxLength: 100,
    },
    apellidos: {
      required: true,
      type: VALIDATION_TYPES.STRING,
      minLength: 2,
      maxLength: 100,
    },
    telefono: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      minLength: 7,
      maxLength: 15,
    },
    rol: {
      required: true,
      type: VALIDATION_TYPES.ROLE,
    },
  },
  update: {
    correo: {
      required: false,
      type: VALIDATION_TYPES.EMAIL,
    },
    nombres: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      minLength: 2,
      maxLength: 100,
    },
    apellidos: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      minLength: 2,
      maxLength: 100,
    },
    telefono: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      minLength: 7,
      maxLength: 15,
    },
  },
};

/**
 * Esquemas para Estudiante
 */
const studentSchemas = {
  create: {
    usuarioId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    modalidad: {
      required: true,
      type: VALIDATION_TYPES.MODALIDAD,
    },
  },
  update: {
    modalidad: {
      required: false,
      type: VALIDATION_TYPES.MODALIDAD,
    },
  },
};

/**
 * Esquemas para Curso
 */
const courseSchemas = {
  create: {
    nombre: {
      required: true,
      type: VALIDATION_TYPES.STRING,
      minLength: 2,
      maxLength: 100,
    },
    area: {
      required: true,
      type: VALIDATION_TYPES.AREA,
    },
    descripcion: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      maxLength: 500,
    },
  },
  update: {
    nombre: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      minLength: 2,
      maxLength: 100,
    },
    area: {
      required: false,
      type: VALIDATION_TYPES.AREA,
    },
    descripcion: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      maxLength: 500,
    },
  },
};

/**
 * Esquemas para Grupo
 */
const groupSchemas = {
  create: {
    area: {
      required: true,
      type: VALIDATION_TYPES.AREA,
    },
    modalidad: {
      required: true,
      type: VALIDATION_TYPES.MODALIDAD,
    },
    nombreGrupo: {
      required: true,
      type: VALIDATION_TYPES.STRING,
      minLength: 1,
      maxLength: 50,
    },
    dias: {
      required: true,
      type: VALIDATION_TYPES.STRING,
      minLength: 1,
      maxLength: 100,
    },
    horaInicio: {
      required: true,
      type: VALIDATION_TYPES.TIME,
    },
    horaFin: {
      required: true,
      type: VALIDATION_TYPES.TIME,
    },
    capacidad: {
      required: false,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
      max: 100,
    },
  },
  update: {
    nombreGrupo: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      minLength: 1,
      maxLength: 50,
    },
    dias: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      minLength: 1,
      maxLength: 100,
    },
    horaInicio: {
      required: false,
      type: VALIDATION_TYPES.TIME,
    },
    horaFin: {
      required: false,
      type: VALIDATION_TYPES.TIME,
    },
    capacidad: {
      required: false,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
      max: 100,
    },
  },
};

/**
 * Esquemas para Matrícula
 */
const enrollmentSchemas = {
  create: {
    estudianteId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    grupoId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    montoPagado: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 0,
    },
  },
  withdraw: {
    motivoRetiro: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      maxLength: 500,
    },
  },
};

/**
 * Esquemas para Asistencia
 */
const attendanceSchemas = {
  create: {
    estudianteId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    grupoId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    fechaClase: {
      required: true,
      type: VALIDATION_TYPES.DATE,
    },
    estado: {
      required: true,
      type: VALIDATION_TYPES.STRING,
      custom: value => {
        const validStates = ['PRESENTE', 'TARDANZA', 'AUSENTE'];
        return validStates.includes(value) || 'Estado debe ser: PRESENTE, TARDANZA o AUSENTE';
      },
    },
    horaRegistro: {
      required: false,
      type: VALIDATION_TYPES.TIME,
    },
    observaciones: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      maxLength: 500,
    },
  },
  bulk: {
    grupoId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    fechaClase: {
      required: true,
      type: VALIDATION_TYPES.DATE,
    },
    asistencias: {
      required: true,
      type: VALIDATION_TYPES.ARRAY,
      custom: value => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Debe proporcionar al menos una asistencia';
        }
        return true;
      },
    },
  },
};

/**
 * Esquemas para Evaluación
 */
const evaluationSchemas = {
  create: {
    grupoId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    numeroSemana: {
      required: true,
      type: VALIDATION_TYPES.WEEK_NUMBER,
    },
    fechaEvaluacion: {
      required: true,
      type: VALIDATION_TYPES.DATE,
    },
    descripcion: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      maxLength: 500,
    },
    duracionMinutos: {
      required: false,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
      max: 480,
    },
  },
  update: {
    numeroSemana: {
      required: false,
      type: VALIDATION_TYPES.WEEK_NUMBER,
    },
    fechaEvaluacion: {
      required: false,
      type: VALIDATION_TYPES.DATE,
    },
    descripcion: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      maxLength: 500,
    },
    duracionMinutos: {
      required: false,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
      max: 480,
    },
  },
};

/**
 * Esquemas para Nota
 */
const gradeSchemas = {
  create: {
    evaluacionId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    estudianteId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    cursoId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    nota: {
      required: true,
      type: VALIDATION_TYPES.GRADE,
    },
    observaciones: {
      required: false,
      type: VALIDATION_TYPES.STRING,
      maxLength: 500,
    },
  },
  bulk: {
    evaluacionId: {
      required: true,
      type: VALIDATION_TYPES.NUMBER,
      min: 1,
    },
    notas: {
      required: true,
      type: VALIDATION_TYPES.ARRAY,
      custom: value => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Debe proporcionar al menos una nota';
        }
        return true;
      },
    },
  },
};

/**
 * Esquemas para Autenticación
 */
const authSchemas = {
  login: {
    identifier: {
      required: true,
      type: VALIDATION_TYPES.STRING,
      minLength: 1,
    },
    password: {
      required: true,
      type: VALIDATION_TYPES.STRING,
      minLength: 1,
    },
  },
  changePassword: {
    newPassword: {
      required: true,
      type: VALIDATION_TYPES.PASSWORD,
    },
  },
  refreshToken: {
    refreshToken: {
      required: true,
      type: VALIDATION_TYPES.STRING,
      minLength: 1,
    },
  },
};

module.exports = {
  userSchemas,
  studentSchemas,
  courseSchemas,
  groupSchemas,
  enrollmentSchemas,
  attendanceSchemas,
  evaluationSchemas,
  gradeSchemas,
  authSchemas,
};
