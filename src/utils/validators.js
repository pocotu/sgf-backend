/**
 * Utilidades de validación de datos
 */

/**
 * Validar DNI peruano (8 dígitos numéricos)
 * @param {string} dni - DNI a validar
 * @returns {boolean} true si es válido
 */
const isValidDni = dni => {
  if (!dni) {
    return false;
  }
  const dniRegex = /^\d{8}$/;
  return dniRegex.test(dni);
};

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
const isValidEmail = email => {
  if (!email) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar formato de fecha ISO 8601 (YYYY-MM-DD)
 * @param {string} date - Fecha a validar
 * @returns {boolean} true si es válido
 */
const isValidDate = date => {
  if (!date) {
    return false;
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(Number);

  // Validar mes
  if (month < 1 || month > 12) {
    return false;
  }

  // Validar día según el mes
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
};

/**
 * Validar formato de hora (HH:mm en 24 horas)
 * @param {string} time - Hora a validar
 * @returns {boolean} true si es válido
 */
const isValidTime = time => {
  if (!time) {
    return false;
  }
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

/**
 * Validar que una hora sea mayor que otra
 * @param {string} startTime - Hora de inicio (HH:mm)
 * @param {string} endTime - Hora de fin (HH:mm)
 * @returns {boolean} true si endTime > startTime
 */
const isTimeAfter = (startTime, endTime) => {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return endMinutes > startMinutes;
};

/**
 * Validar contraseña segura
 * Mínimo 8 caracteres, una mayúscula, una minúscula y un número
 * @param {string} password - Contraseña a validar
 * @returns {boolean} true si es válida
 */
const isValidPassword = password => {
  if (!password || password.length < 8) {
    return false;
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Validar rango de nota (0-20)
 * @param {number} grade - Nota a validar
 * @returns {boolean} true si está en rango válido
 */
const isValidGrade = grade => {
  if (typeof grade !== 'number') {
    return false;
  }
  return grade >= 0 && grade <= 20;
};

/**
 * Validar número de semana (1-52)
 * @param {number} weekNumber - Número de semana a validar
 * @returns {boolean} true si está en rango válido
 */
const isValidWeekNumber = weekNumber => {
  if (typeof weekNumber !== 'number') {
    return false;
  }
  return weekNumber >= 1 && weekNumber <= 52;
};

/**
 * Validar área académica (A, B, C, D)
 * @param {string} area - Área a validar
 * @returns {boolean} true si es válida
 */
const isValidArea = area => {
  const validAreas = ['A', 'B', 'C', 'D'];
  return validAreas.includes(area);
};

/**
 * Validar modalidad
 * @param {string} modalidad - Modalidad a validar
 * @returns {boolean} true si es válida
 */
const isValidModalidad = modalidad => {
  const validModalidades = ['ORDINARIO', 'PRIMERA_OPCION', 'DIRIMENCIA'];
  return validModalidades.includes(modalidad);
};

/**
 * Validar rol de usuario
 * @param {string} rol - Rol a validar
 * @returns {boolean} true si es válido
 */
const isValidRole = rol => {
  const validRoles = ['admin', 'docente', 'estudiante'];
  return validRoles.includes(rol);
};

module.exports = {
  isValidDni,
  isValidEmail,
  isValidDate,
  isValidTime,
  isTimeAfter,
  isValidPassword,
  isValidGrade,
  isValidWeekNumber,
  isValidArea,
  isValidModalidad,
  isValidRole,
};
