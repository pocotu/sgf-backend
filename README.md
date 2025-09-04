# 🏗️ SGF Backend - Sistema de Gestión para Espacios Formativos

Backend del Sistema Web de Gestión para Espacios Formativos desarrollado con arquitectura **MVC + Clean Architecture híbrida**.

## 🎯 **Descripción del Proyecto**

Sistema integral para la gestión de clases, horarios, asistencia y pagos en academias, centros educativos y espacios de formación técnica. Optimiza procesos administrativos y mejora la experiencia de estudiantes y docentes.

## 🏗️ **Arquitectura**

### **Arquitectura MVC + Clean Architecture Híbrida**

```
src/
├── controllers/         # 🎮 MVC Controllers (HTTP layer)
│   ├── auth/           # Autenticación y autorización
│   ├── users/          # Gestión de usuarios
│   ├── classes/        # Gestión de clases
│   ├── bookings/       # Sistema de reservas
│   ├── attendance/     # Control de asistencia
│   └── payments/       # Sistema de pagos
├── use-cases/          # 💼 Clean Architecture Use Cases
│   ├── auth/           # Casos de uso de autenticación
│   ├── users/          # Casos de uso de usuarios
│   ├── bookings/       # Casos de uso de reservas
│   ├── classes/        # Casos de uso de clases
│   ├── attendance/     # Casos de uso de asistencia
│   └── payments/       # Casos de uso de pagos
├── domain/             # 🏢 Domain Logic (Entities + Rules)
│   ├── entities/       # Domain entities
│   └── services/       # Domain services
├── repositories/       # 💾 Data Access (Repository pattern)
│   └── implementations/# Implementaciones concretas
├── interfaces/         # 🔌 Contracts/Ports for dependencies
│   ├── repositories/   # Repository interfaces
│   └── services/       # Service interfaces
├── infrastructure/     # ⚙️ External services (DB, Email, etc.)
│   ├── database/       # Configuración de base de datos
│   ├── email/          # Servicios de email
│   ├── external-services/ # APIs externas
│   └── logging/        # Sistema de logging
├── middleware/         # Middleware de Express
├── routes/             # Definición de rutas REST
├── validators/         # Esquemas de validación Joi
└── utils/              # Utilidades y helpers
```

## 🚀 **Stack Tecnológico**

- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Base de Datos:** MySQL
- **ORM/Query Builder:** mysql2 (raw queries + repository pattern)
- **Autenticación:** JWT (jsonwebtoken + bcryptjs)
- **Validación:** Joi
- **Logging:** Winston
- **Testing:** Jest + Supertest
- **Seguridad:** Helmet + CORS + Rate Limiting

## 🛠️ **Patrones de Diseño Implementados**

- ✅ **Repository Pattern** - Acceso a datos independiente de BD
- ✅ **Use Case Pattern** - Lógica de negocio pura y testeable
- ✅ **Dependency Inversion** - Desacoplamiento total entre capas
- ✅ **Interface Segregation** - Contratos específicos por funcionalidad
- ✅ **MVC Pattern** - Separación de responsabilidades
- ✅ **Clean Architecture** - Independencia de frameworks y tecnologías

## 📋 **Funcionalidades Principales**

### 🔐 **Autenticación y Autorización**
- Sistema JWT con refresh tokens
- Roles: Admin, Instructor, Estudiante
- Middleware de autorización por endpoints

### 👥 **Gestión de Usuarios**
- CRUD completo de usuarios
- Gestión de perfiles y roles
- Cambio de contraseñas seguro

### 📚 **Gestión de Clases**
- CRUD de clases con horarios
- Asignación de instructores
- Gestión de capacidades y precios

### 📅 **Sistema de Reservas**
- Reservas en tiempo real
- Lista de espera automática
- Políticas de cancelación

### ✅ **Control de Asistencia**
- Marcar asistencia digital
- Reportes de asistencia
- Historial por estudiante

### 💳 **Sistema de Pagos**
- Procesamiento de pagos
- Historial de transacciones
- Métodos de pago múltiples

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

### **3. Configuración Base de Datos**
```bash
# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE sgf_database;

# Las tablas se crearán automáticamente al ejecutar la aplicación
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

## 🌐 **Endpoints API**

### **Autenticación**
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### **Usuarios**
- `GET /api/v1/users` - Listar usuarios
- `POST /api/v1/users` - Crear usuario
- `GET /api/v1/users/:id` - Obtener usuario
- `PUT /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario

### **Clases**
- `GET /api/v1/classes` - Listar clases
- `POST /api/v1/classes` - Crear clase
- `GET /api/v1/classes/:id` - Obtener clase
- `PUT /api/v1/classes/:id` - Actualizar clase
- `DELETE /api/v1/classes/:id` - Eliminar clase

### **Reservas**
- `GET /api/v1/bookings` - Listar reservas
- `POST /api/v1/bookings` - Crear reserva
- `GET /api/v1/bookings/:id` - Obtener reserva
- `PUT /api/v1/bookings/:id/cancel` - Cancelar reserva

## 🧪 **Testing**

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📚 **Documentación de la Arquitectura**

### **Flujo de Datos**
1. **HTTP Request** → Controllers (validación inicial)
2. **Controllers** → Use Cases (lógica de negocio)
3. **Use Cases** → Domain Services (reglas de dominio)
4. **Use Cases** → Repositories (acceso a datos)
5. **Repositories** → Infrastructure (base de datos)

## 🔧 **Scripts Disponibles**

- `npm start` - Ejecutar en producción
- `npm run dev` - Desarrollo con nodemon
- `npm test` - Ejecutar tests
- `npm run test:watch` - Tests en modo watch
- `npm run test:coverage` - Reporte de cobertura


