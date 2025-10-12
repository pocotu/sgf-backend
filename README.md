# SGA-P Backend - Sistema de Gestión Integral para Academias Preuniversitarias


```
ARQUITECTURA VISUAL - BACKEND SGA-P

```
sgf-backend/
|
+-- src/                          Codigo fuente principal
|   +-- config/                   Configuracion del sistema
|   +-- routes/                   Definicion de rutas REST
|   +-- middleware/               Middleware Express
|   +-- controllers/              Controladores HTTP
|   +-- services/                 Logica de negocio
|   +-- repositories/             Acceso a datos
|   +-- models/                   Modelos de datos
|   +-- utils/                    Utilidades
|   +-- app.js                    Configuracion Express
|   +-- server.js                 Punto de entrada del servidor
|
+-- migrations/                   Migraciones de BD
+-- seeders/                      Datos iniciales
+-- scripts/                      Scripts de utilidad
+-- logs/                         Archivos de logs
|
+-- uploads/                      Archivos subidos
|   +-- documents/                Documentos
|   +-- photos/                   Fotos de perfil
|   +-- temp/                     Temporales
|
+-- tests/                        Tests
|   +-- unit/                     Tests unitarios
|   +-- integration/              Tests de integracion
|   +-- fixtures/                 Datos de prueba
|
+-- .env.example                  Variables de entorno
+-- package.json                  Dependencias
+-- README.md                     Documentacion
+-- Arquitectura.md               Este archivo
```

---

FLUJO DE ARQUITECTURA CLEAN

+---------------------------------------------------------------+
|                        CLIENTE                                |
|                    (Frontend React)                           |
+-------------------------------+-------------------------------+
                                |
                                | HTTP Request
                                v
+---------------------------------------------------------------+
|                    src/server.js                              |
|  - Inicia servidor Express                                    |
|  - Escucha en puerto configurado                              |
+-------------------------------+-------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                    src/app.js                                 |
|  - Aplica middleware de seguridad (helmet, cors)             |
|  - Aplica rate limiting                                       |
|  - Parsea body JSON                                           |
+-------------------------------+-------------------------------+
                                |
                                | Route Handler
                                v
+---------------------------------------------------------------+
|                    CAPA DE RUTAS                              |
|                   (routes/*.js)                               |
|  - auth.routes.js                                             |
|  - student.routes.js                                          |
|  - course.routes.js                                           |
+-------------------------------+-------------------------------+
                                |
                                | Middleware Chain
                                v
+---------------------------------------------------------------+
|                  CAPA DE MIDDLEWARE                           |
|                  (middleware/*.js)                            |
|  - authMiddleware.js      -> Verifica JWT                     |
|  - roleMiddleware.js      -> Verifica permisos                |
|  - validatorMiddleware.js -> Valida datos                     |
+-------------------------------+-------------------------------+
                                |
                                | Validated Request
                                v
+---------------------------------------------------------------+
|                CAPA DE CONTROLADORES                          |
|                  (controllers/*.js)                           |
|  - AuthController.js                                          |
|  - StudentController.js                                       |
|  - CourseController.js                                        |
|                                                               |
|  Responsabilidad:                                             |
|  - Recibir request HTTP                                       |
|  - Llamar al servicio correspondiente                         |
|  - Formatear respuesta HTTP                                   |
+-------------------------------+-------------------------------+
                                |
                                | Business Logic Call
                                v
+---------------------------------------------------------------+
|                  CAPA DE SERVICIOS                            |
|                   (services/*.js)                             |
|  - AuthService.js                                             |
|  - StudentService.js                                          |
|  - GradeService.js                                            |
|                                                               |
|  Responsabilidad:                                             |
|  - Logica de negocio                                          |
|  - Validaciones de reglas de negocio                          |
|  - Orquestacion de repositorios                               |
+-------------------------------+-------------------------------+
                                |
                                | Data Access Call
                                v
+---------------------------------------------------------------+
|                CAPA DE REPOSITORIOS                           |
|                 (repositories/*.js)                           |
|  - UserRepository.js                                          |
|  - StudentRepository.js                                       |
|  - CourseRepository.js                                        |
|                                                               |
|  Responsabilidad:                                             |
|  - Queries SQL                                                |
|  - Acceso a base de datos                                     |
|  - Mapeo de datos                                             |
+-------------------------------+-------------------------------+
                                |
                                | SQL Query
                                v
+---------------------------------------------------------------+
|                    BASE DE DATOS                              |
|                      MySQL 8.0                                |
|                                                               |
|  Tablas:                                                      |
|  - USUARIOS                                                   |
|  - ESTUDIANTES                                                |
|  - CURSOS                                                     |
|  - GRUPOS                                                     |
|  - MATRICULAS                                                 |
|  - ASISTENCIAS                                                |
|  - EVALUACIONES                                               |
|  - NOTAS                                                      |
+---------------------------------------------------------------+

---

MODULOS POR IMPLEMENTAR (Sprints 2-7)

Sprint 2: Autenticacion
```
src/
├── controllers/
│   └── AuthController.js
├── services/
│   └── AuthService.js
├── repositories/
│   └── UserRepository.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
└── routes/
    └── auth.routes.js
```

Sprint 3: Estudiantes, Cursos, Grupos
```
src/
├── controllers/
│   ├── StudentController.js
│   ├── CourseController.js
│   └── GroupController.js
├── services/
│   ├── StudentService.js
│   ├── CourseService.js
│   └── GroupService.js
├── repositories/
│   ├── StudentRepository.js
│   ├── CourseRepository.js
│   └── GroupRepository.js
└── routes/
    ├── student.routes.js
    ├── course.routes.js
    └── group.routes.js
```

Sprint 4: Matriculas y Asistencias
```
src/
├── controllers/
│   ├── EnrollmentController.js
│   └── AttendanceController.js
├── services/
│   ├── EnrollmentService.js
│   └── AttendanceService.js
├── repositories/
│   ├── EnrollmentRepository.js
│   └── AttendanceRepository.js
└── routes/
    ├── enrollment.routes.js
    └── attendance.routes.js
```

Sprint 5: Evaluaciones y Notas
```
src/
├── controllers/
│   ├── EvaluationController.js
│   └── GradeController.js
├── services/
│   ├── EvaluationService.js
│   └── GradeService.js
├── repositories/
│   ├── EvaluationRepository.js
│   └── GradeRepository.js
└── routes/
    ├── evaluation.routes.js
    └── grade.routes.js
```

Sprint 6: Rankings y Reportes
```
src/
├── controllers/
│   ├── RankingController.js
│   └── ReportController.js
├── services/
│   ├── RankingService.js
│   └── ReportService.js
├── repositories/
│   ├── RankingRepository.js
│   └── ReportRepository.js
└── routes/
    ├── ranking.routes.js
    └── report.routes.js
```

Sprint 7: Dashboards
```
src/
├── controllers/
│   └── DashboardController.js
├── services/
│   └── DashboardService.js
└── routes/
    └── dashboard.routes.js
```

---


src/config/
```
config/
├── database.js          # Configuración MySQL
├── jwt.js               # Configuración JWT
├── constants.js         # Constantes del sistema
└── logger.js            # Configuración de logs
```

src/utils/
```
utils/
├── dateHelper.js        # Formateo de fechas
├── validators.js        # Validaciones personalizadas
├── formatters.js        # Formateo de datos
└── errorHandler.js      # Manejo de errores
```
---

### **4. Ejecutar la aplicación**
```bash
# Desarrollo con hot reload
npm run dev

# Producción
npm start

# Tests
npm test

# Tests con coverage
npm run test:coverage
```

## 🧪 **Testing**

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage
```


