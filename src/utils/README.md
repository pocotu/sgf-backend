# Utilidades del Sistema

Este directorio contiene utilidades compartidas para el sistema backend.

## response.js - Respuestas API Consistentes

Implementa el formato estándar de respuestas según **Requirement 14**.

### Funciones Principales

#### `successResponse(data, message, pagination)`

Crea una respuesta exitosa con formato consistente.

**Parámetros:**
- `data` (Object|Array): Datos a retornar
- `message` (string, opcional): Mensaje descriptivo
- `pagination` (Object, opcional): Información de paginación

**Retorna:**
```javascript
{
  success: true,
  data: {...},
  message: "Mensaje opcional",
  pagination: {...} // opcional
}
```

**Ejemplo:**
```javascript
const { successResponse } = require('../utils/response');

// Respuesta simple
return res.json(successResponse(usuario, 'Usuario creado exitosamente'));

// Con paginación
return res.json(successResponse(usuarios, null, {
  page: 1,
  limit: 10,
  total: 100,
  totalPages: 10
}));
```

#### `errorResponse(code, message, details)`

Crea una respuesta de error con formato consistente.

**Parámetros:**
- `code` (string): Código de error (ej: 'VALIDATION_FAILED')
- `message` (string): Mensaje descriptivo del error
- `details` (Object, opcional): Detalles adicionales del error

**Retorna:**
```javascript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Mensaje descriptivo",
    details: {...} // opcional
  }
}
```

**Ejemplo:**
```javascript
const { errorResponse } = require('../utils/response');

return res.status(400).json(
  errorResponse(
    'VALIDATION_FAILED',
    'Datos inválidos',
    { dni: 'Debe tener 8 dígitos' }
  )
);
```

#### `paginatedResponse({ data, page, limit, total, message })`

Crea una respuesta paginada con cálculo automático de totalPages.

**Parámetros:**
- `data` (Array): Datos de la página actual
- `page` (number): Número de página actual
- `limit` (number): Límite de registros por página
- `total` (number): Total de registros
- `message` (string, opcional): Mensaje descriptivo

**Retorna:**
```javascript
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}
```

**Ejemplo:**
```javascript
const { paginatedResponse } = require('../utils/response');

const { usuarios, pagination } = await userRepository.list(filters, { page, limit });

return res.json(paginatedResponse({
  data: usuarios,
  page: pagination.page,
  limit: pagination.limit,
  total: pagination.total,
  message: 'Usuarios obtenidos exitosamente'
}));
```

### Serialización Automática de Fechas

Todas las respuestas serializan automáticamente las fechas a formato **ISO 8601 con timezone** según **Requirement 14.4**.

**Campos de fecha comunes que se serializan automáticamente:**
- `fechaCreacion`
- `fechaActualizacion`
- `fechaMatricula`
- `fechaRetiro`
- `fechaClase`
- `fechaEvaluacion`
- `createdAt`
- `updatedAt`

**Ejemplo:**
```javascript
const data = {
  usuarioId: 1,
  fechaCreacion: new Date('2025-01-15T10:00:00Z')
};

const response = successResponse(data);
// response.data.fechaCreacion = "2025-01-15T10:00:00.000Z"
```

## serializers.js - Transformación de Datos

Implementa campos calculados y serialización de datos según **Requirement 14.5**.

### Funciones de Serialización por Entidad

#### `serializeUsuario(usuario)`

Serializa un usuario agregando `nombreCompleto` y fechas en ISO 8601.

**Ejemplo:**
```javascript
const { serializeUsuario } = require('../utils/serializers');

const usuario = {
  usuarioId: 1,
  nombres: 'Juan',
  apellidos: 'Pérez',
  fechaCreacion: new Date()
};

const serialized = serializeUsuario(usuario);
// serialized.nombreCompleto = "Juan Pérez"
// serialized.fechaCreacion = "2025-01-15T10:00:00.000Z"
```

#### `serializeEstudiante(estudiante)`

Serializa un estudiante con usuario anidado y `nombreCompleto`.

#### `serializeGrupo(grupo)`

Serializa un grupo agregando `cuposDisponibles`.

**Ejemplo:**
```javascript
const { serializeGrupo } = require('../utils/serializers');

const grupo = {
  grupoId: 1,
  capacidad: 30,
  matriculasActivas: 15
};

const serialized = serializeGrupo(grupo);
// serialized.cuposDisponibles = 15
```

#### `serializeAsistencia(asistencia)`

Serializa asistencia agregando `porcentajeAsistencia`.

**Ejemplo:**
```javascript
const { serializeAsistencia } = require('../utils/serializers');

const asistencia = {
  presentes: 8,
  tardanzas: 2,
  totalClases: 10
};

const serialized = serializeAsistencia(asistencia);
// serialized.porcentajeAsistencia = 100
```

### Funciones de Cálculo

#### `calcularCuposDisponibles(grupo)`

Calcula cupos disponibles: `capacidad - matriculasActivas`.

#### `calcularPorcentajeAsistencia(asistencia)`

Calcula porcentaje: `(presentes + tardanzas) / totalClases * 100`.

#### `getNombreCompleto(usuario)`

Concatena nombres y apellidos.

### Uso en Controladores

```javascript
const { successResponse } = require('../utils/response');
const { serializeGrupo, serializeArray } = require('../utils/serializers');

class GroupController {
  async list(req, res) {
    const { grupos, pagination } = await groupRepository.list(filters);
    
    // Serializar grupos con cuposDisponibles
    const serializedGrupos = serializeArray(grupos, serializeGrupo);
    
    return res.json(paginatedResponse({
      data: serializedGrupos,
      ...pagination
    }));
  }
}
```

## validators.js - Validaciones de Datos

Funciones de validación para DNI, email, fechas, horas, etc.

Ver documentación en el archivo para detalles.

## errors.js - Clases de Error Personalizadas

Clases de error para manejo consistente de errores en el sistema.

Ver documentación en el archivo para detalles.

## Mejores Prácticas

### 1. Usar siempre las funciones de respuesta

❌ **Incorrecto:**
```javascript
return res.json({ data: usuario });
```

✅ **Correcto:**
```javascript
return res.json(successResponse(usuario, 'Usuario creado'));
```

### 2. Serializar datos antes de retornar

❌ **Incorrecto:**
```javascript
return res.json(successResponse(grupo));
```

✅ **Correcto:**
```javascript
const serialized = serializeGrupo(grupo);
return res.json(successResponse(serialized));
```

### 3. Usar paginatedResponse para listas

❌ **Incorrecto:**
```javascript
return res.json(successResponse(usuarios));
```

✅ **Correcto:**
```javascript
return res.json(paginatedResponse({
  data: usuarios,
  page: 1,
  limit: 10,
  total: 100
}));
```

### 4. Incluir mensajes descriptivos

✅ **Correcto:**
```javascript
return res.json(successResponse(
  usuario,
  'Usuario creado exitosamente'
));
```

### 5. Usar códigos de error consistentes

✅ **Correcto:**
```javascript
return res.status(400).json(errorResponse(
  'VALIDATION_FAILED',
  'DNI debe tener 8 dígitos',
  { field: 'dni' }
));
```

## Testing

Todas las utilidades tienen tests unitarios completos en:
- `tests/unit/utils/response.test.js`
- `tests/unit/utils/serializers.test.js`
- `tests/unit/utils/validators.test.js`
- `tests/unit/utils/errors.test.js`

Ejecutar tests:
```bash
npm test -- tests/unit/utils/
```
