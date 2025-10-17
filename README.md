# SGA-P Backend

> Sistema de Gestión Integral para Academias Preuniversitarias - API REST

## Stack Tecnológico

- **Runtime:** Node.js 22+
- **Framework:** Express.js 5.1
- **Base de Datos:** MySQL 8.0
- **Autenticación:** JWT (jsonwebtoken)
- **Seguridad:** bcryptjs, helmet, cors
- **Validación:** Joi
- **Testing:** Jest + Supertest
- **Logs:** Winston
- **Rate Limiting:** express-rate-limit

## Estructura del Proyecto

```
sgf-backend/
├── src/                          # Código fuente principal
│   ├── config/                   # Configuración del sistema
│   │
│   ├── routes/                   # Definición de rutas REST
│   │
│   ├── middleware/               # Middleware Express
│   │
│   ├── controllers/              # Controladores HTTP
│   │
│   ├── services/                 # Lógica de negocio
│   │
│   ├── repositories/             # Acceso a datos
│   │
│   ├── models/                   # Modelos de datos
│   ├── utils/                    # Utilidades
│   ├── app.js                    # Configuración Express
│   └── server.js                 # Punto de entrada del servidor
│
├── migrations/                   # Migraciones de BD
├── seeders/                      # Datos iniciales
├── scripts/                      # Scripts de utilidad
├── logs/                         # Archivos de logs
│
├── uploads/                      # Archivos subidos
│   ├── documents/                # Documentos
│   ├── photos/                   # Fotos de perfil
│   └── temp/                     # Temporales
│
├── tests/                        # Tests
│   ├── unit/                     # Tests unitarios
│   ├── integration/              # Tests de integración
│   └── fixtures/                 # Datos de prueba
│
├── .env.example                  # Variables de entorno ejemplo
├── package.json                  # Dependencias
└── README.md                     # Este archivo
```

## Arquitectura Clean Architecture

El proyecto sigue el patrón Clean Architecture con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend React)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      src/server.js                           │
│  • Inicia servidor Express                                   │
│  • Escucha en puerto configurado                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       src/app.js                             │
│  • Middleware de seguridad (helmet, cors)                    │
│  • Rate limiting                                             │
│  • Parser de body JSON                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ Route Handler
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE RUTAS (routes/)                    │
│  • auth.routes.js                                            │
│  • student.routes.js                                         │
│  • course.routes.js                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Middleware Chain
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                CAPA DE MIDDLEWARE (middleware/)              │
│  • authMiddleware.js      → Verifica JWT                     │
│  • roleMiddleware.js      → Verifica permisos                │
│  • validatorMiddleware.js → Valida datos                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Validated Request
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE CONTROLADORES (controllers/)            │
│  • AuthController.js                                         │
│  • StudentController.js                                      │
│  • CourseController.js                                       │
│                                                              │
│  Responsabilidad:                                            │
│  • Recibir request HTTP                                      │
│  • Llamar al servicio correspondiente                        │
│  • Formatear respuesta HTTP                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Business Logic Call
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                CAPA DE SERVICIOS (services/)                 │
│  • AuthService.js                                            │
│  • StudentService.js                                         │
│  • GradeService.js                                           │
│                                                              │
│  Responsabilidad:                                            │
│  • Lógica de negocio                                         │
│  • Validaciones de reglas de negocio                         │
│  • Orquestación de repositorios                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ Data Access Call
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE REPOSITORIOS (repositories/)            │
│  • UserRepository.js                                         │
│  • StudentRepository.js                                      │
│  • CourseRepository.js                                       │
│                                                              │
│  Responsabilidad:                                            │
│  • Queries SQL                                               │
│  • Acceso a base de datos                                    │
│  • Mapeo de datos                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL Query
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   BASE DE DATOS MySQL 8.0                    │
│                                                              │
│  Tablas:                                                     │
│  • USUARIOS        • GRUPOS                                  │
│  • ESTUDIANTES     • MATRICULAS                              │
│  • CURSOS          • ASISTENCIAS                             │
│  • EVALUACIONES    • NOTAS                                   │
└─────────────────────────────────────────────────────────────┘
```

## Modelo de Base de Datos

### Tablas Principales

1. **USUARIOS**: Gestión de usuarios del sistema (admin, docente, estudiante)
2. **ESTUDIANTES**: Información de estudiantes con modalidad UNSAAC
3. **CURSOS**: Cursos organizados por área académica (A, B, C, D)
4. **GRUPOS**: Grupos con modalidad, área, horarios y capacidad
5. **MATRICULAS**: Control de inscripciones estudiante-grupo
6. **ASISTENCIAS**: Registro de asistencia (Presente, Tardanza, Ausente)
7. **EVALUACIONES**: Simulacros semanales estilo UNSAAC
8. **NOTAS**: Calificaciones por curso (escala 0-20)

## Instalación y Configuración

### Requisitos Previos

- Node.js 22+ instalado
- MySQL 8.0+ instalado y ejecutándose
- npm o yarn como gestor de paquetes

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd sgf-backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=sgf_database
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

4. **Crear base de datos**

```bash
mysql -u root -p
CREATE DATABASE sgf_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Ejecutar migraciones**

```bash
npm run migrate
```

6. **Ejecutar seeders (opcional)**

```bash
npm run seed
```

## Ejecución

### Modo Desarrollo

```bash
npm run dev
```

Servidor con hot reload en `http://localhost:3000`

### Modo Producción

```bash
npm start
```

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage
```

## API Endpoints

### Autenticación

- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### Estudiantes

- `GET /api/v1/students` - Listar estudiantes
- `GET /api/v1/students/:id` - Obtener estudiante
- `POST /api/v1/students` - Crear estudiante
- `PUT /api/v1/students/:id` - Actualizar estudiante
- `DELETE /api/v1/students/:id` - Eliminar estudiante

### Cursos

- `GET /api/v1/courses` - Listar cursos
- `GET /api/v1/courses/:id` - Obtener curso
- `POST /api/v1/courses` - Crear curso
- `PUT /api/v1/courses/:id` - Actualizar curso
- `DELETE /api/v1/courses/:id` - Eliminar curso

### Grupos

- `GET /api/v1/groups` - Listar grupos
- `GET /api/v1/groups/:id` - Obtener grupo
- `POST /api/v1/groups` - Crear grupo
- `PUT /api/v1/groups/:id` - Actualizar grupo
- `DELETE /api/v1/groups/:id` - Eliminar grupo

### Matrículas

- `GET /api/v1/enrollments` - Listar matrículas
- `POST /api/v1/enrollments` - Matricular estudiante
- `DELETE /api/v1/enrollments/:id` - Anular matrícula

### Asistencias

- `GET /api/v1/attendances` - Listar asistencias
- `POST /api/v1/attendances` - Registrar asistencia
- `PUT /api/v1/attendances/:id` - Actualizar asistencia

### Evaluaciones y Notas

- `GET /api/v1/evaluations` - Listar evaluaciones
- `POST /api/v1/evaluations` - Crear evaluación
- `GET /api/v1/grades` - Listar notas
- `POST /api/v1/grades` - Registrar notas

### Rankings y Reportes

- `GET /api/v1/rankings/:groupId` - Ranking de grupo
- `GET /api/v1/reports/academic` - Reporte académico
- `GET /api/v1/reports/attendance` - Reporte de asistencia

### Dashboards

- `GET /api/v1/dashboard/admin` - Dashboard administrador
- `GET /api/v1/dashboard/teacher` - Dashboard docente
- `GET /api/v1/dashboard/student` - Dashboard estudiante

## Autenticación y Autorización

El sistema implementa autenticación JWT con 3 roles:

- **Admin**: Acceso completo al sistema
- **Docente**: Gestión de grupos, asistencia y notas
- **Estudiante**: Consulta de información personal

### Ejemplo de uso

```javascript
// Headers requeridos
Authorization: Bearer <token>
```

## Testing

### Estructura de Tests

```
tests/
├── unit/                    # Tests unitarios
│   ├── services/
│   ├── repositories/
│   └── utils/
├── integration/             # Tests de integración
│   ├── auth.test.js
│   ├── students.test.js
│   └── courses.test.js
└── fixtures/                # Datos de prueba
```

### Cobertura Objetivo

- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## Scripts Disponibles

```bash
npm start              # Iniciar servidor en producción
npm run dev            # Iniciar servidor en desarrollo
npm test               # Ejecutar tests
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Generar reporte de cobertura
npm run migrate        # Ejecutar migraciones
npm run seed           # Ejecutar seeders
npm run lint           # Ejecutar linter
npm run lint:fix       # Arreglar errores de linting automáticamente
npm run format         # Formatear código con Prettier
npm run format:check   # Verificar formato sin modificar
```

## 🚀 CI/CD - Protección del Repositorio

El proyecto cuenta con protección automática del código mediante GitHub Actions.

### ✅ Workflows Activos

- ✅ **Lint**: Verifica código con ESLint y Prettier en cada PR
- ✅ **Test**: Ejecuta tests con coverage en cada PR
- ✅ **Branch Protection**: Requiere aprobación y checks pasando antes de merge

### 📊 Estado Actual

- ✅ Linting: 0 errores
- ✅ Tests: 4/4 pasando
- ✅ Workflows: 2/2 funcionando

### 🔒 Configurar Branch Protection

Para activar la protección en GitHub:

1. Ir a **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Marcar:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass before merging
   - ✅ Status checks: `lint`, `test`
   - ✅ Include administrators
4. Save changes
5. Repetir para branch `develop`

**Resultado:** Nadie puede hacer push directo a `main` o `develop` sin PR aprobado y checks pasando.

📖 **Guía de configuración**: [Quick Start CI/CD](./docs/QUICK_START_CI_CD.md)

## Desarrollo por Sprints

### Sprint 2: Autenticación (Completado)

- Sistema JWT con 3 roles
- Middleware de autenticación y autorización
- CRUD de usuarios

### Sprint 3: Estudiantes, Cursos, Grupos (En Progreso)

- CRUD de estudiantes con modalidades
- CRUD de cursos por área académica
- CRUD de grupos con horarios

### Sprint 4: Matrículas y Asistencias (Pendiente)

- Sistema de matrículas con validaciones
- Control de asistencia con 3 estados

### Sprint 5: Evaluaciones y Notas (Pendiente)

- Programación de simulacros
- Registro de notas (escala 0-20)

### Sprint 6: Rankings y Reportes (Pendiente)

- Sistema de rankings automático
- Reportes académicos y de asistencia

### Sprint 7: Dashboards (Pendiente)

- Dashboard por rol de usuario
- Métricas y visualizaciones
