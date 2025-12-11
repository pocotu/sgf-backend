/**
 * Utilidades para serialización y transformación de datos
 * Implementa campos calculados y formato consistente de respuestas
 */

/**
 * Serializar fechas a formato ISO 8601 con timezone
 * @param {Date|string} date - Fecha a serializar
 * @returns {string|null} Fecha en formato ISO 8601
 */
const serializeDate = date => {
  if (!date) {
    return null;
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    return dateObj.toISOString();
  } catch (_error) {
    return null;
  }
};

/**
 * Serializar objeto con fechas a formato ISO 8601
 * @param {Object} obj - Objeto a serializar
 * @param {Array<string>} dateFields - Campos que son fechas
 * @returns {Object} Objeto con fechas serializadas
 */
const serializeDates = (obj, dateFields = []) => {
  if (!obj) {
    return obj;
  }

  const serialized = { ...obj };

  // Campos de fecha comunes
  const commonDateFields = [
    'fechaCreacion',
    'fechaActualizacion',
    'fechaMatricula',
    'fechaRetiro',
    'fechaClase',
    'fechaEvaluacion',
    'createdAt',
    'updatedAt',
  ];

  const allDateFields = [...new Set([...commonDateFields, ...dateFields])];

  allDateFields.forEach(field => {
    if (serialized[field]) {
      serialized[field] = serializeDate(serialized[field]);
    }
  });

  return serialized;
};

/**
 * Calcular nombre completo de usuario
 * @param {Object} usuario - Objeto usuario con nombres y apellidos
 * @returns {string} Nombre completo
 */
const getNombreCompleto = usuario => {
  if (!usuario) {
    return '';
  }
  const { nombres = '', apellidos = '' } = usuario;
  return `${nombres} ${apellidos}`.trim();
};

/**
 * Agregar campo nombreCompleto a objeto con usuario
 * @param {Object} obj - Objeto que contiene usuario
 * @returns {Object} Objeto con nombreCompleto agregado
 */
const addNombreCompleto = obj => {
  if (!obj) {
    return obj;
  }

  const result = { ...obj };

  if (obj.usuario) {
    result.nombreCompleto = getNombreCompleto(obj.usuario);
  } else if (obj.nombres && obj.apellidos) {
    result.nombreCompleto = getNombreCompleto(obj);
  }

  return result;
};

/**
 * Calcular cupos disponibles de un grupo
 * @param {Object} grupo - Objeto grupo con capacidad y matriculasActivas
 * @returns {number} Cupos disponibles
 */
const calcularCuposDisponibles = grupo => {
  if (!grupo) {
    return 0;
  }
  const { capacidad = 0, matriculasActivas = 0 } = grupo;
  return Math.max(0, capacidad - matriculasActivas);
};

/**
 * Agregar campo cuposDisponibles a grupo
 * @param {Object} grupo - Objeto grupo
 * @returns {Object} Grupo con cuposDisponibles agregado
 */
const addCuposDisponibles = grupo => {
  if (!grupo) {
    return grupo;
  }

  const result = { ...grupo };

  if (typeof result.capacidad !== 'undefined') {
    result.cuposDisponibles = calcularCuposDisponibles(result);
  }

  return result;
};

/**
 * Calcular porcentaje de asistencia
 * @param {Object} asistencia - Objeto con totales de asistencia
 * @returns {number} Porcentaje de asistencia
 */
const calcularPorcentajeAsistencia = asistencia => {
  if (!asistencia) {
    return 0;
  }

  const { presentes = 0, tardanzas = 0, totalClases = 0 } = asistencia;

  if (totalClases === 0) {
    return 0;
  }

  const asistenciasValidas = presentes + tardanzas;
  return Number(((asistenciasValidas / totalClases) * 100).toFixed(2));
};

/**
 * Agregar porcentaje de asistencia a objeto
 * @param {Object} obj - Objeto con datos de asistencia
 * @returns {Object} Objeto con porcentajeAsistencia agregado
 */
const addPorcentajeAsistencia = obj => {
  if (!obj) {
    return obj;
  }

  const result = { ...obj };

  if (typeof result.totalClases !== 'undefined') {
    result.porcentajeAsistencia = calcularPorcentajeAsistencia(result);
  }

  return result;
};

/**
 * Serializar usuario con campos calculados
 * @param {Object} usuario - Usuario a serializar
 * @returns {Object} Usuario serializado
 */
const serializeUsuario = usuario => {
  if (!usuario) {
    return null;
  }

  let serialized = serializeDates(usuario);
  serialized = addNombreCompleto(serialized);

  return serialized;
};

/**
 * Serializar estudiante con campos calculados
 * @param {Object} estudiante - Estudiante a serializar
 * @returns {Object} Estudiante serializado
 */
const serializeEstudiante = estudiante => {
  if (!estudiante) {
    return null;
  }

  let serialized = serializeDates(estudiante);

  if (serialized.usuario) {
    serialized.usuario = serializeUsuario(serialized.usuario);
    serialized = addNombreCompleto(serialized);
  }

  return serialized;
};

/**
 * Serializar grupo con campos calculados
 * @param {Object} grupo - Grupo a serializar
 * @returns {Object} Grupo serializado
 */
const serializeGrupo = grupo => {
  if (!grupo) {
    return null;
  }

  let serialized = serializeDates(grupo);
  serialized = addCuposDisponibles(serialized);

  return serialized;
};

/**
 * Serializar matrícula con campos calculados
 * @param {Object} matricula - Matrícula a serializar
 * @returns {Object} Matrícula serializada
 */
const serializeMatricula = matricula => {
  if (!matricula) {
    return null;
  }

  const serialized = serializeDates(matricula, ['fechaMatricula', 'fechaRetiro']);

  if (serialized.estudiante) {
    serialized.estudiante = serializeEstudiante(serialized.estudiante);
  }

  if (serialized.grupo) {
    serialized.grupo = serializeGrupo(serialized.grupo);
  }

  return serialized;
};

/**
 * Serializar asistencia con campos calculados
 * @param {Object} asistencia - Asistencia a serializar
 * @returns {Object} Asistencia serializada
 */
const serializeAsistencia = asistencia => {
  if (!asistencia) {
    return null;
  }

  let serialized = serializeDates(asistencia, ['fechaClase']);
  serialized = addPorcentajeAsistencia(serialized);

  if (serialized.estudiante) {
    serialized.estudiante = serializeEstudiante(serialized.estudiante);
  }

  if (serialized.grupo) {
    serialized.grupo = serializeGrupo(serialized.grupo);
  }

  return serialized;
};

/**
 * Serializar evaluación con campos calculados
 * @param {Object} evaluacion - Evaluación a serializar
 * @returns {Object} Evaluación serializada
 */
const serializeEvaluacion = evaluacion => {
  if (!evaluacion) {
    return null;
  }

  const serialized = serializeDates(evaluacion, ['fechaEvaluacion']);

  if (serialized.grupo) {
    serialized.grupo = serializeGrupo(serialized.grupo);
  }

  return serialized;
};

/**
 * Serializar nota con campos calculados
 * @param {Object} nota - Nota a serializar
 * @returns {Object} Nota serializada
 */
const serializeNota = nota => {
  if (!nota) {
    return null;
  }

  const serialized = serializeDates(nota);

  if (serialized.estudiante) {
    serialized.estudiante = serializeEstudiante(serialized.estudiante);
  }

  if (serialized.evaluacion) {
    serialized.evaluacion = serializeEvaluacion(serialized.evaluacion);
  }

  if (serialized.curso) {
    serialized.curso = serializeDates(serialized.curso);
  }

  return serialized;
};

/**
 * Serializar curso con campos calculados
 * @param {Object} curso - Curso a serializar
 * @returns {Object} Curso serializado
 */
const serializeCurso = curso => {
  if (!curso) {
    return null;
  }
  return serializeDates(curso);
};

/**
 * Serializar array de objetos
 * @param {Array} array - Array a serializar
 * @param {Function} serializer - Función serializadora
 * @returns {Array} Array serializado
 */
const serializeArray = (array, serializer) => {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.map(item => serializer(item));
};

module.exports = {
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
};
