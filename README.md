# � SGA-P Backend - Sistema de Gestión Integral para Academias Preuniversitarias

Backend del **Sistema de Gestión Integral para Academias Preuniversitarias (SGA-P)** desarrollado con arquitectura **MVC + Clean Architecture híbrida**, diseñado específicamente para academias de preparación preuniversitaria en Perú.

## 🎯 **Descripción del Proyecto**

Sistema integral diseñado para academias preuniversitarias peruanas que preparan estudiantes para exámenes de admisión de universidades como **UNMSM, UNI, PUCP**. Optimiza la gestión académica, administrativa, de tutorías personalizadas y comunicación con apoderados, mejorando los resultados de preparación universitaria.

## 🏗️ **Arquitectura**

### **Arquitectura MVC + Clean Architecture Híbrida**

Sistema diseñado específicamente para **academias preuniversitarias peruanas** con arquitectura escalable que soporta **3 roles académicos básicos** y módulos especializados en preparación universitaria.

#### **🏛️ Estructura de Directorios Actual**

```
sgf-backend/
├── package.json                     # Configuración NPM del proyecto
├── jest.config.js                   # Configuración Jest para testing
├── server.js                        # Punto de entrada del servidor
├── app.js                           # Configuración Express principal
├── README.md                        # Documentación del proyecto
│
├── src/                             # Código fuente principal
│   ├── controllers/                 # 🎮 MVC Controllers (HTTP layer)
│   │   ├── auth/                    # Autenticación y autorización básica
│   │   │   ├── LoginController.js   # Login con roles académicos
│   │   │   ├── RegisterController.js # Registro por tipos de usuario
│   │   │   └── AuthMiddleware.js    # Middleware autenticación JWT
│   │   ├── users/                   # Gestión usuarios académicos
│   │   │   ├── AdminController.js   # Gestión administradores
│   │   │   ├── DocenteController.js # Gestión docentes
│   │   │   └── EstudianteController.js # Gestión estudiantes
│   │   ├── academic/                # Módulo académico preuniversitario
│   │   │   ├── CursoController.js   # Cursos por carrera universitaria
│   │   │   ├── CicloController.js   # Ciclos académicos (Verano, Anual)
│   │   │   ├── HorarioController.js # Horarios de clases
│   │   │   ├── AsistenciaController.js # Control asistencia
│   │   │   ├── CalificacionController.js # Notas y evaluaciones
│   │   │   └── SimulacroController.js # Simulacros de exámenes
│   │   ├── admissions/              # Proceso de admisiones
│   │   │   ├── PostulanteController.js # Postulantes a la academia
│   │   │   ├── InscripcionController.js # Inscripciones
│   │   │   ├── ExamenIngresoController.js # Exámenes de ingreso
│   │   │   └── MatriculaController.js # Proceso matrícula
│   │   ├── financial/               # Gestión financiera académica
│   │   │   ├── PagoController.js    # Pagos mensuales/por ciclo
│   │   │   ├── BecaController.js    # Sistema de becas
│   │   │   ├── MorosidadController.js # Control morosidad
│   │   │   └── ReporteFinancieroController.js # Reportes financieros
│   │   └── communications/          # Comunicaciones académicas
│   │       ├── NotificacionController.js # Notificaciones push
│   │       ├── EmailController.js   # Emails a padres/estudiantes
│   │       ├── SMSController.js     # SMS para recordatorios
│   │       └── ReporteController.js # Reportes académicos
│   │
│   ├── use-cases/                   # 💼 Clean Architecture Use Cases
│   │   ├── auth/                    # Casos uso autenticación
│   │   │   ├── LoginUseCase.js      # Lógica login multi-rol
│   │   │   ├── RegisterUseCase.js   # Registro usuarios académicos
│   │   │   ├── RefreshTokenUseCase.js # Renovación tokens JWT
│   │   │   └── LogoutUseCase.js     # Cierre sesión
│   │   ├── users/                   # Casos uso gestión usuarios
│   │   │   ├── CreateUserUseCase.js # Crear usuario por rol
│   │   │   ├── UpdateUserUseCase.js # Actualizar perfil usuario
│   │   │   ├── DeleteUserUseCase.js # Eliminar usuario
│   │   │   └── GetUsersByRoleUseCase.js # Obtener usuarios por rol
│   │   ├── academic/                # Casos uso módulo académico
│   │   │   ├── CreateCursoUseCase.js # Crear curso especializado
│   │   │   ├── AssignDocenteUseCase.js # Asignar docente a curso
│   │   │   ├── RegisterAsistenciaUseCase.js # Registrar asistencia
│   │   │   ├── CalculateNotasUseCase.js # Calcular promedios
│   │   │   └── GenerateReporteUseCase.js # Generar reportes académicos
│   │   ├── admissions/              # Casos uso admisiones
│   │   │   ├── RegisterPostulanteUseCase.js # Registrar postulante
│   │   │   ├── ProcessInscripcionUseCase.js # Procesar inscripción
│   │   │   ├── EvaluateExamenUseCase.js # Evaluar examen ingreso
│   │   │   └── CompleteMatriculaUseCase.js # Completar matrícula
│   │   ├── financial/               # Casos uso financieros
│   │   │   ├── ProcessPagoUseCase.js # Procesar pagos
│   │   │   ├── AssignBecaUseCase.js # Asignar becas
│   │   │   ├── CalculateMorosidadUseCase.js # Calcular morosidad
│   │   │   └── GenerateFacturaUseCase.js # Generar facturas
│   │   └── communications/          # Casos uso comunicaciones
│   │       ├── SendNotificationUseCase.js # Enviar notificaciones
│   │       ├── SendEmailUseCase.js  # Envío emails masivos
│   │       ├── SendSMSUseCase.js    # Envío SMS recordatorios
│   │       └── GenerateReporteUseCase.js # Generar reportes
│   │
│   ├── domain/                      # 🏢 Domain Logic (Entities + Rules)
│   │   ├── entities/                # Entidades dominio académico
│   │   │   ├── User.js              # Usuario base sistema
│   │   │   ├── Estudiante.js        # Estudiante academia
│   │   │   ├── Docente.js           # Docente especializado
│   │   │   ├── Curso.js             # Curso preuniversitario
│   │   │   ├── Ciclo.js             # Ciclo académico
│   │   │   ├── Asistencia.js        # Asistencia estudiante
│   │   │   ├── Calificacion.js      # Calificación/nota
│   │   │   ├── Pago.js              # Pago mensualidad
│   │   │   ├── Beca.js              # Beca académica
│   │   │   └── Simulacro.js         # Simulacro examen
│   │   └── services/                # Servicios dominio
│   │       ├── AcademicService.js   # Lógica académica
│   │       ├── PaymentService.js    # Lógica pagos
│   │       ├── NotificationService.js # Lógica notificaciones
│   │       └── ReportingService.js  # Lógica reportes
│   │
│   ├── repositories/                # 💾 Data Access (Repository pattern)
│   │   └── implementations/         # Implementaciones concretas
│   │       ├── UserRepository.js    # Repositorio usuarios
│   │       ├── EstudianteRepository.js # Repositorio estudiantes
│   │       ├── DocenteRepository.js # Repositorio docentes
│   │       ├── CursoRepository.js   # Repositorio cursos
│   │       ├── AsistenciaRepository.js # Repositorio asistencias
│   │       ├── CalificacionRepository.js # Repositorio calificaciones
│   │       ├── PagoRepository.js    # Repositorio pagos
│   │       └── NotificacionRepository.js # Repositorio notificaciones
│   │
│   ├── interfaces/                  # 🔌 Contracts/Ports for dependencies
│   │   ├── repositories/            # Interfaces repositorios
│   │   │   ├── IUserRepository.js   # Interface usuario
│   │   │   ├── ICursoRepository.js  # Interface curso
│   │   │   ├── IPagoRepository.js   # Interface pago
│   │   │   └── INotificationRepository.js # Interface notificación
│   │   └── services/                # Interfaces servicios
│   │       ├── IEmailService.js     # Interface email
│   │       ├── ISMSService.js       # Interface SMS
│   │       ├── IPaymentService.js   # Interface pagos
│   │       └── IReportService.js    # Interface reportes
│   │
│   ├── infrastructure/              # ⚙️ External services (DB, Email, etc.)
│   │   ├── database/                # Configuración base datos
│   │   │   ├── mysql.js             # Conexión MySQL
│   │   │   ├── migrations/          # Migraciones BD
│   │   │   └── seeders/             # Datos iniciales
│   │   ├── email/                   # Servicios email
│   │   │   ├── EmailProvider.js     # Proveedor email (SendGrid/SES)
│   │   │   └── EmailTemplates.js    # Templates académicos
│   │   ├── external-services/       # APIs externas
│   │   │   ├── SMSProvider.js       # Proveedor SMS
│   │   │   ├── PaymentGateway.js    # Gateway pagos (Culqi/PayU)
│   │   │   └── ReportGenerator.js   # Generador reportes PDF
│   │   ├── logging/                 # Sistema logging
│   │   │   ├── Logger.js            # Configuración Winston
│   │   │   └── AuditLog.js          # Log auditoría académica
│   │   └── storage/                 # Almacenamiento archivos
│   │       ├── FileUpload.js        # Carga archivos
│   │       └── DocumentStorage.js   # Almacén documentos
│   │
│   ├── middleware/                  # Middleware Express
│   │   ├── AuthMiddleware.js        # Autenticación JWT
│   │   ├── RoleMiddleware.js        # Autorización por roles
│   │   ├── ValidationMiddleware.js  # Validación Joi
│   │   ├── ErrorMiddleware.js       # Manejo errores
│   │   ├── LoggingMiddleware.js     # Log requests
│   │   └── RateLimitMiddleware.js   # Rate limiting
│   │
│   ├── routes/                      # Definición rutas REST API
│   │   ├── authRoutes.js            # Rutas autenticación
│   │   ├── userRoutes.js            # Rutas usuarios
│   │   ├── academicRoutes.js        # Rutas módulo académico
│   │   ├── admissionRoutes.js       # Rutas admisiones
│   │   ├── financialRoutes.js       # Rutas financieras
│   │   ├── communicationRoutes.js   # Rutas comunicaciones
│   │   └── index.js                 # Router principal
│   │
│   ├── validators/                  # Esquemas validación Joi
│   │   ├── authValidators.js        # Validaciones autenticación
│   │   ├── userValidators.js        # Validaciones usuarios
│   │   ├── academicValidators.js    # Validaciones académicas
│   │   ├── admissionValidators.js   # Validaciones admisiones
│   │   ├── financialValidators.js   # Validaciones financieras
│   │   └── communicationValidators.js # Validaciones comunicaciones
│   │
│   └── utils/                       # Utilidades y helpers
│       ├── DateHelper.js            # Utilidades fechas
│       ├── EncryptionHelper.js      # Utilidades encriptación
│       ├── ValidationHelper.js      # Utilidades validación
│       ├── FormatHelper.js          # Utilidades formato
│       └── Constants.js             # Constantes sistema
│
├── tests/                           # Suite de pruebas
│   ├── setup.js                     # Configuración testing
│   ├── unit/                        # Pruebas unitarias
│   ├── integration/                 # Pruebas integración
│   └── e2e/                         # Pruebas end-to-end
│
├── logs/                            # Archivos log sistema
│   ├── app.log                      # Log aplicación
│   ├── error.log                    # Log errores
│   └── audit.log                    # Log auditoría
│
└── uploads/                         # Archivos cargados
    ├── documents/                   # Documentos académicos
    ├── images/                      # Imágenes perfiles
    └── reports/                     # Reportes generados
```

#### **🎯 Características Específicas SGA-P**

- **3 Roles Académicos:** Administrador, Docente, Estudiante
- **Módulos Especializados:** Académico, Admisiones, Financiero, Comunicaciones
- **Clean Architecture + MVC:** Separación clara de responsabilidades
- **Sistema de Roles:** Control acceso basado en 3 roles académicos básicos

## 🚀 **Stack Tecnológico SGA-P**

### **Backend Core**
- **Runtime:** Node.js 16+ (LTS)
- **Framework:** Express.js 4.18+
- **Base de Datos:** MySQL 8.0+ (Optimizada para consultas académicas)
- **ORM/Query Builder:** mysql2 (raw queries + repository pattern)

### **Seguridad y Autenticación**
- **Autenticación:** JWT (jsonwebtoken + bcryptjs)
- **Autorización:** Sistema de roles básico - 3 roles académicos
- **Seguridad:** Helmet + CORS + Rate Limiting
- **Encriptación:** bcryptjs para passwords, crypto para datos sensibles

### **Validación y Testing**
- **Validación:** Joi (esquemas específicos para contexto académico)
- **Testing:** Jest + Supertest (cobertura mínima 80%)
- **Logging:** Winston (logs auditables para academia)

### **Servicios Externos Integrados**
- **Email:** SendGrid/AWS SES (notificaciones padres/estudiantes)
- **SMS:** Twilio (recordatorios y alertas académicas)
- **Pagos:** Culqi/PayU Latam (procesamiento pagos Perú)
- **Storage:** AWS S3/Local (documentos y reportes académicos)
- **PDF:** PDFKit (generación reportes y certificados)

## 🛠️ **Patrones de Diseño Implementados**

### **Clean Architecture Patterns**
- ✅ **Repository Pattern** - Acceso a datos independiente de BD
- ✅ **Use Case Pattern** - Lógica de negocio pura y testeable
- ✅ **Dependency Inversion** - Desacoplamiento total entre capas
- ✅ **Interface Segregation** - Contratos específicos por funcionalidad

### **MVC & Enterprise Patterns**
- ✅ **MVC Pattern** - Separación responsabilidades HTTP layer
- ✅ **Clean Architecture** - Independencia de frameworks y tecnologías
- ✅ **Domain-Driven Design** - Modelado orientado al dominio académico
- ✅ **CQRS Light** - Separación comandos y consultas complejas

### **Academic Domain Patterns**
- ✅ **Sistema de Roles Simplificado** - 3 roles específicos academia
- ✅ **Academic Calendar Pattern** - Gestión ciclos y periodos académicos
- ✅ **Grade Book Pattern** - Sistema calificaciones y promedios
- ✅ **Enrollment Pattern** - Proceso matrícula y admisiones

## 📋 **Funcionalidades Principales SGA-P**

### 🔐 **Autenticación y Autorización Académica**
- Sistema JWT con refresh tokens específico para roles académicos
- **3 Roles:** Administrador, Docente, Estudiante
- Middleware autorización por endpoints y funcionalidades académicas
- Sesiones administrativas para gestión completa del sistema

### 👥 **Gestión de Usuarios Académicos**
- CRUD completo usuarios con roles específicos de academia
- Gestión perfiles académicos diferenciados por rol básico
- Cambio contraseñas seguro con políticas institucionales
- Gestión relaciones académicas básicas

### 📚 **Módulo Académico Preuniversitario**
- **Gestión Cursos:** CRUD cursos especializados por carrera universitaria (Medicina, Ingeniería, Ciencias, Letras)
- **Ciclos Académicos:** Verano Intensivo, Anual Regular, Semi-anual
- **Horarios:** Gestión horarios con aulas y docentes asignados
- **Asistencia:** Marcado digital con reportes automatizados
- **Calificaciones:** Sistema notas con promedios ponderados
- **Simulacros:** Exámenes simulacro estilo universidades peruanas

### 🎓 **Sistema de Admisiones**
- **Postulantes:** Registro y gestión aspirantes a academia
- **Inscripciones:** Proceso inscripción con documentación requerida
- **Exámenes Ingreso:** Evaluación ingreso con resultados automáticos
- **Matrículas:** Proceso matrícula con asignación ciclos y cursos

### 💰 **Gestión Financiera Académica**
- **Pagos:** Procesamiento mensualidades y ciclos completos
- **Becas:** Sistema becas académicas y socioeconómicas
- **Morosidad:** Control y alertas morosidad estudiantes
- **Facturas:** Generación automática comprobantes de pago
- **Reportes:** Dashboards financieros por periodo

### � **Sistema Comunicaciones**
- **Notificaciones Push:** Alertas asistencia, calificaciones, pagos
- **Emails:** Comunicaciones masivas padres/estudiantes
- **SMS:** Recordatorios clases y fechas importantes
- **Reportes:** Reportes académicos individuales y grupales

## ⚙️ **Instalación y Configuración**

### **1. Prerrequisitos**
- Node.js 16+ 
- MySQL 8.0+
- npm o yarn

### **2. Instalación**
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sgf-backend.git
cd sgf-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### **3. Configuración Base de Datos MySQL**
```bash
# Crear base de datos MySQL para SGA-P
mysql -u root -p
CREATE DATABASE sga_p_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sga_p_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON sga_p_database.* TO 'sga_p_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Las tablas académicas se crearán automáticamente con las migraciones
```

### **4. Variables de Entorno (.env)**
```env
# Configuración Servidor
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sga_p_database
DB_USER=sga_p_user
DB_PASSWORD=tu_password_seguro

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro_para_academia
JWT_REFRESH_SECRET=tu_refresh_secret_academia
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Servicios Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=tu_sendgrid_api_key
FROM_EMAIL=noreply@tuacademia.pe

# Servicios SMS
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
TWILIO_PHONE_NUMBER=+51987654321

# Gateway Pagos Perú
PAYMENT_GATEWAY=culqi
CULQI_PUBLIC_KEY=tu_culqi_public_key
CULQI_PRIVATE_KEY=tu_culqi_private_key

# Storage Configuration
STORAGE_PROVIDER=local
AWS_ACCESS_KEY_ID=tu_aws_access_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET=sga-p-storage
```

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

## 🌐 **Endpoints API SGA-P**

### **🔐 Autenticación (Base: `/api/v1/auth`)**
- `POST /login` - Iniciar sesión multi-rol académico
- `POST /register` - Registrar usuario por rol específico
- `POST /refresh` - Renovar token JWT
- `POST /logout` - Cerrar sesión
- `POST /forgot-password` - Recuperar contraseña
- `POST /reset-password` - Resetear contraseña
- `GET /verify-email/:token` - Verificar email usuario

### **👥 Usuarios Académicos (Base: `/api/v1/users`)**
- `GET /` - Listar usuarios con filtros por rol
- `POST /` - Crear usuario académico
- `GET /:id` - Obtener perfil usuario
- `PUT /:id` - Actualizar perfil usuario
- `DELETE /:id` - Eliminar usuario (soft delete)
- `GET /by-role/:role` - Obtener usuarios por rol (admin/docente/estudiante)
- `PUT /:id/change-password` - Cambiar contraseña
- `PUT /:id/toggle-status` - Activar/desactivar usuario

### **📚 Módulo Académico (Base: `/api/v1/academic`)**
- `GET /cursos` - Listar cursos preuniversitarios
- `POST /cursos` - Crear curso especializado
- `GET /cursos/:id` - Obtener curso específico
- `PUT /cursos/:id` - Actualizar curso
- `DELETE /cursos/:id` - Eliminar curso
- `GET /ciclos` - Listar ciclos académicos
- `POST /ciclos` - Crear ciclo académico
- `GET /horarios` - Obtener horarios por curso/docente
- `POST /asistencia` - Registrar asistencia estudiante
- `GET /asistencia/:estudianteId` - Historial asistencia
- `POST /calificaciones` - Registrar calificación
- `GET /calificaciones/:estudianteId` - Notas estudiante
- `GET /simulacros` - Listar simulacros disponibles
- `POST /simulacros/:id/inscribir` - Inscribir estudiante simulacro

### **🎓 Admisiones (Base: `/api/v1/admissions`)**
- `POST /postulantes` - Registrar postulante
- `GET /postulantes` - Listar postulantes con filtros
- `GET /postulantes/:id` - Perfil postulante
- `PUT /postulantes/:id` - Actualizar datos postulante
- `POST /inscripciones` - Procesar inscripción
- `GET /inscripciones/:id/status` - Estado inscripción
- `POST /examenes/programar` - Programar examen ingreso
- `POST /examenes/:id/evaluar` - Evaluar examen
- `POST /matriculas` - Completar matrícula
- `GET /matriculas/:estudianteId` - Estado matrícula

### **💰 Financiero (Base: `/api/v1/financial`)**
- `GET /pagos` - Listar pagos con filtros
- `POST /pagos` - Procesar pago
- `GET /pagos/:id` - Detalle pago específico
- `PUT /pagos/:id/confirmar` - Confirmar pago
- `GET /becas` - Listar becas disponibles
- `POST /becas/asignar` - Asignar beca estudiante
- `GET /morosidad` - Reporte morosidad general
- `GET /morosidad/:estudianteId` - Estado morosidad estudiante
- `GET /reportes/financieros` - Dashboards financieros
- `GET /facturas/:pagoId` - Generar factura PDF

### **📢 Comunicaciones (Base: `/api/v1/communications`)**
- `POST /notifications` - Enviar notificación push
- `GET /notifications/:userId` - Notificaciones usuario
- `PUT /notifications/:id/read` - Marcar notificación leída
- `POST /emails/send` - Enviar email individual
- `POST /emails/send-bulk` - Envío masivo emails
- `POST /sms/send` - Enviar SMS recordatorio
- `GET /reports/:tipo` - Generar reporte específico
- `GET /reports/academic/:estudianteId` - Reporte académico individual

## 🧪 **Testing**

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📚 **Documentación de la Arquitectura SGA-P**

### **🏗️ Flujo de Datos Clean Architecture**
1. **HTTP Request** → Controllers (validación inicial + autenticación)
2. **Controllers** → Use Cases (lógica de negocio académica)
3. **Use Cases** → Domain Services (reglas de dominio educativo)
4. **Use Cases** → Repositories (acceso a datos)
5. **Repositories** → Infrastructure (MySQL + servicios externos)

### **🔄 Flujo Académico Simplificado**
```
Estudiante marca asistencia → 
AuthController (JWT validation) → 
AsistenciaController (HTTP layer) → 
RegisterAsistenciaUseCase (business logic) → 
AcademicService (domain rules) → 
AsistenciaRepository (data access) → 
MySQL Database → 
NotificationService (alert system)
```

### **🎯 Principios de Diseño Aplicados**

#### **Single Responsibility Principle (SRP)**
- Cada controlador maneja un módulo específico
- Use cases enfocados en una funcionalidad
- Repositories por entidad de dominio

#### **Open/Closed Principle (OCP)**
- Interfaces permiten agregar nuevos providers
- Domain services extensibles para nuevas reglas
- Controllers pueden agregar endpoints sin modificar existentes

#### **Dependency Inversion Principle (DIP)**
- Controllers dependen de interfaces, no implementaciones
- Use cases reciben repositories por interfaz
- Infrastructure implementa interfaces de dominio

### **🔐 Modelo de Seguridad Simplificado**

#### **Matriz de Permisos Simplificada (3 Roles)**
```
Funcionalidad                    | Admin | Docente | Estudiante
---------------------------------|-------|---------|------------
Gestionar Usuarios               |   ✅   |    ❌    |     ❌
Crear/Editar Cursos              |   ✅   |    ❌    |     ❌
Registrar Asistencia             |   ✅   |    ✅    |     ❌
Ver Asistencia Propia            |   ✅   |    ✅    |     ✅
Registrar Calificaciones         |   ✅   |    ✅    |     ❌
Ver Calificaciones Propias       |   ✅   |    ✅    |     ✅
Procesar Pagos                   |   ✅   |    ❌    |     ❌
Ver Estado Financiero Propio     |   ✅   |    ❌    |     ✅
Gestionar Admisiones             |   ✅   |    ❌    |     ❌
Generar Reportes                 |   ✅   |    ✅    |     ❌
Enviar Comunicaciones            |   ✅   |    ✅    |     ❌
```

## 🔧 **Scripts Disponibles**

### **🚀 Desarrollo y Ejecución**
- `npm start` - Ejecutar en producción (server.js)
- `npm run dev` - Desarrollo con nodemon y hot reload
- `npm run start:prod` - Producción con PM2
- `npm run build` - Build para producción (si aplica transpilación)

### **🧪 Testing y Calidad**
- `npm test` - Ejecutar suite de pruebas completa
- `npm run test:unit` - Pruebas unitarias únicamente
- `npm run test:integration` - Pruebas integración
- `npm run test:e2e` - Pruebas end-to-end
- `npm run test:watch` - Tests en modo watch
- `npm run test:coverage` - Reporte cobertura (mínimo 80%)

### **🔍 Análisis y Linting**
- `npm run lint` - Ejecutar ESLint
- `npm run lint:fix` - Corregir errores ESLint automáticamente
- `npm run format` - Formatear código con Prettier
- `npm run security:audit` - Auditoría de seguridad npm
- `npm run deps:check` - Verificar dependencias desactualizadas

### **💾 Base de Datos**
- `npm run db:migrate` - Ejecutar migraciones pendientes
- `npm run db:rollback` - Rollback última migración
- `npm run db:seed` - Poblar BD con datos iniciales
- `npm run db:reset` - Reset completo BD (desarrollo únicamente)

### **📊 Monitoreo y Logs**
- `npm run logs:view` - Ver logs en tiempo real
- `npm run logs:error` - Ver únicamente logs de errores
- `npm run health:check` - Verificar salud de servicios
- `npm run monitor` - Dashboard de monitoreo



