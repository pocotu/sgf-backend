/**
 * Ejemplos de uso de utilidades de respuesta y serialización
 *
 * Este archivo muestra cómo usar las utilidades para crear respuestas
 * API consistentes según Requirement 14
 */

const { successResponse, errorResponse, paginatedResponse } = require('../src/utils/response');

const {
  serializeUsuario,
  serializeEstudiante,
  serializeGrupo,
  serializeArray,
} = require('../src/utils/serializers');

// ============================================================================
// EJEMPLO 1: Respuesta exitosa simple
// ============================================================================
console.log('=== EJEMPLO 1: Respuesta exitosa simple ===');

const usuario = {
  usuarioId: 1,
  dni: '12345678',
  nombres: 'Juan',
  apellidos: 'Pérez',
  correo: 'juan@example.com',
  rol: 'estudiante',
  fechaCreacion: new Date('2025-01-15T10:00:00Z'),
  fechaActualizacion: new Date('2025-01-16T15:30:00Z'),
};

const response1 = successResponse(usuario, 'Usuario obtenido exitosamente');
console.log(JSON.stringify(response1, null, 2));
// Output:
// {
//   "success": true,
//   "data": {
//     "usuarioId": 1,
//     "dni": "12345678",
//     "nombres": "Juan",
//     "apellidos": "Pérez",
//     "correo": "juan@example.com",
//     "rol": "estudiante",
//     "fechaCreacion": "2025-01-15T10:00:00.000Z",  // ← Serializado a ISO 8601
//     "fechaActualizacion": "2025-01-16T15:30:00.000Z"  // ← Serializado a ISO 8601
//   },
//   "message": "Usuario obtenido exitosamente"
// }

// ============================================================================
// EJEMPLO 2: Respuesta con campos calculados (nombreCompleto)
// ============================================================================
console.log('\n=== EJEMPLO 2: Respuesta con campos calculados ===');

const usuarioSerializado = serializeUsuario(usuario);
const response2 = successResponse(usuarioSerializado, 'Usuario obtenido');
console.log(JSON.stringify(response2, null, 2));
// Output incluye:
// {
//   "data": {
//     ...
//     "nombreCompleto": "Juan Pérez"  // ← Campo calculado agregado
//   }
// }

// ============================================================================
// EJEMPLO 3: Respuesta de error
// ============================================================================
console.log('\n=== EJEMPLO 3: Respuesta de error ===');

const errorResp = errorResponse('VALIDATION_FAILED', 'DNI debe tener 8 dígitos', {
  field: 'dni',
  value: '123',
});
console.log(JSON.stringify(errorResp, null, 2));
// Output:
// {
//   "success": false,
//   "error": {
//     "code": "VALIDATION_FAILED",
//     "message": "DNI debe tener 8 dígitos",
//     "details": {
//       "field": "dni",
//       "value": "123"
//     }
//   }
// }

// ============================================================================
// EJEMPLO 4: Respuesta paginada
// ============================================================================
console.log('\n=== EJEMPLO 4: Respuesta paginada ===');

const usuarios = [
  {
    usuarioId: 1,
    nombres: 'Juan',
    apellidos: 'Pérez',
    fechaCreacion: new Date('2025-01-15T10:00:00Z'),
  },
  {
    usuarioId: 2,
    nombres: 'María',
    apellidos: 'García',
    fechaCreacion: new Date('2025-01-16T10:00:00Z'),
  },
];

const response4 = paginatedResponse({
  data: usuarios,
  page: 1,
  limit: 10,
  total: 25,
  message: 'Usuarios obtenidos exitosamente',
});
console.log(JSON.stringify(response4, null, 2));
// Output:
// {
//   "success": true,
//   "data": [
//     {
//       "usuarioId": 1,
//       "nombres": "Juan",
//       "apellidos": "Pérez",
//       "fechaCreacion": "2025-01-15T10:00:00.000Z"  // ← Serializado
//     },
//     {
//       "usuarioId": 2,
//       "nombres": "María",
//       "apellidos": "García",
//       "fechaCreacion": "2025-01-16T10:00:00.000Z"  // ← Serializado
//     }
//   ],
//   "message": "Usuarios obtenidos exitosamente",
//   "pagination": {
//     "page": 1,
//     "limit": 10,
//     "total": 25,
//     "totalPages": 3  // ← Calculado automáticamente
//   }
// }

// ============================================================================
// EJEMPLO 5: Grupo con cuposDisponibles
// ============================================================================
console.log('\n=== EJEMPLO 5: Grupo con cuposDisponibles ===');

const grupo = {
  grupoId: 1,
  nombreGrupo: 'Grupo A',
  capacidad: 30,
  matriculasActivas: 15,
  fechaCreacion: new Date('2025-01-15T10:00:00Z'),
};

const grupoSerializado = serializeGrupo(grupo);
const response5 = successResponse(grupoSerializado, 'Grupo obtenido');
console.log(JSON.stringify(response5, null, 2));
// Output incluye:
// {
//   "data": {
//     "grupoId": 1,
//     "nombreGrupo": "Grupo A",
//     "capacidad": 30,
//     "matriculasActivas": 15,
//     "cuposDisponibles": 15,  // ← Campo calculado (30 - 15)
//     "fechaCreacion": "2025-01-15T10:00:00.000Z"
//   }
// }

// ============================================================================
// EJEMPLO 6: Estudiante con usuario anidado
// ============================================================================
console.log('\n=== EJEMPLO 6: Estudiante con usuario anidado ===');

const estudiante = {
  estudianteId: 1,
  codigoInterno: '2025-A-ORD-001',
  modalidad: 'ORDINARIO',
  usuario: {
    usuarioId: 1,
    nombres: 'Juan',
    apellidos: 'Pérez',
    dni: '12345678',
    fechaCreacion: new Date('2025-01-15T10:00:00Z'),
  },
  fechaCreacion: new Date('2025-01-15T10:00:00Z'),
};

const estudianteSerializado = serializeEstudiante(estudiante);
const response6 = successResponse(estudianteSerializado, 'Estudiante obtenido');
console.log(JSON.stringify(response6, null, 2));
// Output incluye:
// {
//   "data": {
//     "estudianteId": 1,
//     "codigoInterno": "2025-A-ORD-001",
//     "modalidad": "ORDINARIO",
//     "nombreCompleto": "Juan Pérez",  // ← Campo calculado del estudiante
//     "usuario": {
//       "usuarioId": 1,
//       "nombres": "Juan",
//       "apellidos": "Pérez",
//       "dni": "12345678",
//       "nombreCompleto": "Juan Pérez",  // ← Campo calculado del usuario
//       "fechaCreacion": "2025-01-15T10:00:00.000Z"
//     },
//     "fechaCreacion": "2025-01-15T10:00:00.000Z"
//   }
// }

// ============================================================================
// EJEMPLO 7: Array de objetos con serialización
// ============================================================================
console.log('\n=== EJEMPLO 7: Array de objetos con serialización ===');

const grupos = [
  {
    grupoId: 1,
    nombreGrupo: 'Grupo A',
    capacidad: 30,
    matriculasActivas: 20,
  },
  {
    grupoId: 2,
    nombreGrupo: 'Grupo B',
    capacidad: 30,
    matriculasActivas: 5,
  },
];

const gruposSerializados = serializeArray(grupos, serializeGrupo);
const response7 = successResponse(gruposSerializados, 'Grupos obtenidos');
console.log(JSON.stringify(response7, null, 2));
// Output incluye cuposDisponibles para cada grupo:
// {
//   "data": [
//     {
//       "grupoId": 1,
//       "nombreGrupo": "Grupo A",
//       "capacidad": 30,
//       "matriculasActivas": 20,
//       "cuposDisponibles": 10  // ← 30 - 20
//     },
//     {
//       "grupoId": 2,
//       "nombreGrupo": "Grupo B",
//       "capacidad": 30,
//       "matriculasActivas": 5,
//       "cuposDisponibles": 25  // ← 30 - 5
//     }
//   ]
// }

// ============================================================================
// EJEMPLO 8: Uso en un controlador
// ============================================================================
console.log('\n=== EJEMPLO 8: Uso en un controlador ===');

// Ejemplo de cómo usar en un controlador real:
/*
class GroupController {
  async list(req, res) {
    const { grupos, pagination } = await groupRepository.list(filters);
    
    // Serializar grupos con cuposDisponibles
    const serializedGrupos = serializeArray(grupos, serializeGrupo);
    
    // Retornar respuesta paginada con fechas en ISO 8601
    return res.json(paginatedResponse({
      data: serializedGrupos,
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      message: 'Grupos obtenidos exitosamente'
    }));
  }
  
  async getById(req, res) {
    const grupo = await groupRepository.findById(id);
    
    // Serializar grupo individual
    const serialized = serializeGrupo(grupo);
    
    // Retornar respuesta exitosa
    return res.json(successResponse(
      serialized,
      'Grupo obtenido exitosamente'
    ));
  }
}
*/

console.log('\n=== Todos los ejemplos completados ===');
