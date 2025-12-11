# Validation Middleware - Guía de Uso

Este documento explica cómo usar el middleware de validación centralizada en el proyecto.

## Descripción General

El middleware de validación proporciona una forma consistente y reutilizable de validar datos de entrada en las rutas de la API. Soporta validación de:

- Request body (`validate`)
- Query parameters (`validateQuery`)
- Route parameters (`validateParams`)
- Validaciones personalizadas (como horarios con `validateSchedule`)

## Tipos de Validación Disponibles

```javascript
const { VALIDATION_TYPES } = require('../middleware/validation');

// Tipos disponibles:
VALIDATION_TYPES.DNI           // DNI peruano (8 dígitos)
VALIDATION_TYPES.EMAIL         // Email válido
VALIDATION_TYPES.DATE          // Fecha ISO 8601 (YYYY-MM-DD)
VALIDATION_TYPES.TIME          // Hora HH:mm (24 horas)
VALIDATION_TYPES.PASSWORD      // Contraseña segura (8+ chars, mayúscula, minúscula, número)
VALIDATION_TYPES.GRADE         // Nota 0-20
VALIDATION_TYPES.WEEK_NUMBER   // Número de semana 1-52
VALIDATION_TYPES.AREA          // Área académica (A, B, C, D)
VALIDATION_TYPES.MODALIDAD     // Modalidad (ORDINARIO, PRIMERA_OPCION, DIRIMENCIA)
VALIDATION_TYPES.ROLE          // Rol (admin, docente, estudiante)
VALIDATION_TYPES.STRING        // String genérico
VALIDATION_TYPES.NUMBER        // Número
VALIDATION_TYPES.BOOLEAN       // Booleano
VALIDATION_TYPES.ARRAY         // Array
VALIDATION_TYPES.OBJECT        // Objeto
```

## Uso Básico

### 1. Validación de Request Body

```javascript
const { validate, VALIDATION_TYPES } = require('../middleware/validation');

// Definir esquema de validación
const createUserSchema = {
  dni: {
    required: true,
    type: VALIDATION_TYPES.DNI,
  },
  correo: {
    required: false,  // Opcional
    type: VALIDATION_TYPES.EMAIL,
  },
  nombres: {
    required: true,
    type: VALIDATION_TYPES.STRING,
    minLength: 2,
    maxLength: 100,
  },
  rol: {
    required: true,
    type: VALIDATION_TYPES.ROLE,
  },
};

// Usar en ruta
router.post('/users', validate(createUserSchema), userController.create);
```

### 2. Validación de Query Parameters

```javascript
const { validateQuery, VALIDATION_TYPES } = require('../middleware/validation');

const listUsersQuerySchema = {
  page: {
    required: false,
    type: VALIDATION_TYPES.NUMBER,
    min: 1,
  },
  limit: {
    required: false,
    type: VALIDATION_TYPES.NUMBER,
    min: 1,
    max: 100,
  },
  rol: {
    required: false,
    type: VALIDATION_TYPES.ROLE,
  },
};

router.get('/users', validateQuery(listUsersQuerySchema), userController.list);
```

### 3. Validación de Route Parameters

```javascript
const { validateParams, VALIDATION_TYPES } = require('../middleware/validation');

const userIdParamSchema = {
  id: {
    required: true,
    type: VALIDATION_TYPES.NUMBER,
    min: 1,
  },
};

router.get('/users/:id', validateParams(userIdParamSchema), userController.getById);
```

### 4. Validación de Horarios

```javascript
const { validate, validateSchedule, VALIDATION_TYPES } = require('../middleware/validation');

const createGroupSchema = {
  horaInicio: {
    required: true,
    type: VALIDATION_TYPES.TIME,
  },
  horaFin: {
    required: true,
    type: VALIDATION_TYPES.TIME,
  },
  // ... otros campos
};

// Aplicar ambas validaciones
router.post(
  '/groups',
  validate(createGroupSchema),
  validateSchedule(),  // Valida que horaFin > horaInicio
  groupController.create
);
```

## Opciones de Validación

### Campos Requeridos vs Opcionales

```javascript
{
  campoRequerido: {
    required: true,  // Debe estar presente
    type: VALIDATION_TYPES.STRING,
  },
  campoOpcional: {
    required: false,  // Puede estar ausente
    type: VALIDATION_TYPES.EMAIL,
  },
}
```

### Restricciones de Longitud (Strings)

```javascript
{
  nombre: {
    required: true,
    type: VALIDATION_TYPES.STRING,
    minLength: 2,      // Mínimo 2 caracteres
    maxLength: 100,    // Máximo 100 caracteres
  },
}
```

### Restricciones de Rango (Números)

```javascript
{
  edad: {
    required: true,
    type: VALIDATION_TYPES.NUMBER,
    min: 18,    // Mínimo 18
    max: 120,   // Máximo 120
  },
}
```

### Validación Personalizada

```javascript
{
  estado: {
    required: true,
    type: VALIDATION_TYPES.STRING,
    custom: (value) => {
      const validStates = ['PRESENTE', 'TARDANZA', 'AUSENTE'];
      if (!validStates.includes(value)) {
        return 'Estado debe ser: PRESENTE, TARDANZA o AUSENTE';
      }
      return true;  // Válido
    },
  },
}
```

## Uso de Esquemas Predefinidos

El proyecto incluye esquemas predefinidos en `src/validators/schemas.js`:

```javascript
const { userSchemas } = require('../validators/schemas');
const { validate } = require('../middleware/validation');

// Usar esquema predefinido
router.post('/users', validate(userSchemas.create), userController.create);
router.put('/users/:id', validate(userSchemas.update), userController.update);
```

Esquemas disponibles:
- `userSchemas` - Usuarios
- `studentSchemas` - Estudiantes
- `courseSchemas` - Cursos
- `groupSchemas` - Grupos
- `enrollmentSchemas` - Matrículas
- `attendanceSchemas` - Asistencias
- `evaluationSchemas` - Evaluaciones
- `gradeSchemas` - Notas
- `authSchemas` - Autenticación

## Respuestas de Error

Cuando la validación falla, el middleware retorna un error 400 con el siguiente formato:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Errores de validación en los datos enviados",
    "details": {
      "dni": "DNI debe tener exactamente 8 dígitos numéricos",
      "correo": "Formato de correo electrónico inválido",
      "edad": "edad debe ser mayor o igual a 18"
    }
  }
}
```

## Ejemplo Completo: Ruta de Usuarios

```javascript
const express = require('express');
const router = express.Router();
const { validate, validateQuery, validateParams } = require('../middleware/validation');
const { userSchemas } = require('../validators/schemas');
const { VALIDATION_TYPES } = require('../middleware/validation');

// Esquema para parámetros de ID
const idParamSchema = {
  id: { required: true, type: VALIDATION_TYPES.NUMBER, min: 1 },
};

// Esquema para query de listado
const listQuerySchema = {
  page: { required: false, type: VALIDATION_TYPES.NUMBER, min: 1 },
  limit: { required: false, type: VALIDATION_TYPES.NUMBER, min: 1, max: 100 },
  rol: { required: false, type: VALIDATION_TYPES.ROLE },
};

const configureUserRoutes = (userController, authService) => {
  const { authenticateJWT, authorizeRole } = require('../middleware/auth');

  router.use(authenticateJWT(authService));

  // POST /api/users - Crear usuario
  router.post(
    '/',
    authorizeRole('admin'),
    validate(userSchemas.create),  // Validar body
    userController.create
  );

  // GET /api/users - Listar usuarios
  router.get(
    '/',
    authorizeRole('admin'),
    validateQuery(listQuerySchema),  // Validar query params
    userController.list
  );

  // GET /api/users/:id - Obtener usuario
  router.get(
    '/:id',
    validateParams(idParamSchema),  // Validar route params
    userController.getById
  );

  // PUT /api/users/:id - Actualizar usuario
  router.put(
    '/:id',
    validateParams(idParamSchema),
    validate(userSchemas.update),
    userController.update
  );

  // DELETE /api/users/:id - Eliminar usuario
  router.delete(
    '/:id',
    authorizeRole('admin'),
    validateParams(idParamSchema),
    userController.delete
  );

  return router;
};

module.exports = configureUserRoutes;
```

## Mejores Prácticas

1. **Definir esquemas reutilizables**: Crea esquemas en `schemas.js` para reutilizar en múltiples rutas.

2. **Validar en el orden correcto**: Aplica validaciones antes de la lógica de negocio:
   ```javascript
   router.post(
     '/resource',
     authenticateJWT(),      // 1. Autenticación
     authorizeRole('admin'), // 2. Autorización
     validate(schema),       // 3. Validación
     controller.create       // 4. Lógica de negocio
   );
   ```

3. **Usar validaciones específicas**: Prefiere tipos específicos (DNI, EMAIL) sobre STRING genérico.

4. **Combinar validaciones**: Puedes aplicar múltiples validaciones:
   ```javascript
   router.post(
     '/groups',
     validate(groupSchema),
     validateSchedule(),
     controller.create
   );
   ```

5. **Mensajes claros**: Usa validaciones personalizadas para mensajes específicos del dominio.

## Testing

El middleware incluye tests completos en `tests/unit/middleware/validation.test.js`. Para ejecutar:

```bash
npm test -- tests/unit/middleware/validation.test.js
```

## Referencias

- Validadores base: `src/utils/validators.js`
- Middleware: `src/middleware/validation.js`
- Esquemas: `src/validators/schemas.js`
- Tests: `tests/unit/middleware/validation.test.js`
