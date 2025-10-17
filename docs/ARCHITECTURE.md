# 🏗️ Arquitectura CI/CD - Backend SGA-P

## 🎯 Protección del Repositorio

Este sistema implementa protección automática del código mediante GitHub Actions.

**No incluye deploy automático** - Solo protección de calidad del código.

---

## 📊 Diagrama del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DESARROLLADOR LOCAL                                │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Código     │  │  npm run     │  │  npm test    │  │  git push    │   │
│  │  Desarrollo  │→ │    lint      │→ │              │→ │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │
                                         │ Push to GitHub
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GITHUB REPOSITORY                               │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         BRANCHES                                      │  │
│  │                                                                       │  │
│  │  feature/BE-XXX  →  develop  →  main                                │  │
│  │                                                                       │  │
│  │  🔒 Protected: develop, main                                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      GITHUB ACTIONS WORKFLOWS                         │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐           │  │
│  │  │   Lint Workflow         │  │   Test Workflow         │           │  │
│  │  │                         │  │                         │           │  │
│  │  │ • ESLint                │  │ • Jest                  │           │  │
│  │  │ • Prettier              │  │ • MySQL 8.0 (Docker)    │           │  │
│  │  │ • Comment PR            │  │ • Coverage              │           │  │
│  │  │                         │  │ • Comment PR            │           │  │
│  │  └─────────────────────────┘  └─────────────────────────┘           │  │
│  │           ↓                              ↓                           │  │
│  │        1-2 min                        3-5 min                        │  │
│  │                                                                       │  │
│  │  ✅ Ambos deben pasar para permitir merge                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      BRANCH PROTECTION                                │  │
│  │                                                                       │  │
│  │  • Require PR before merging                                         │  │
│  │  • Require 1 approval                                                │  │
│  │  • Require status checks: lint, test                                 │  │
│  │  • Include administrators                                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Trabajo Detallado

### 1. Desarrollo Local

```
Desarrollador
    │
    ├─→ Escribe código
    │
    ├─→ npm run lint (ESLint + Prettier)
    │   └─→ Verifica estilo de código
    │
    ├─→ npm test (Jest)
    │   └─→ Ejecuta tests unitarios
    │
    └─→ git push origin feature/BE-XXX
```

### 2. Pull Request a `develop`

```
GitHub Actions (Automático)
    │
    ├─→ Lint Workflow (1-2 min)
    │   ├─→ Checkout código
    │   ├─→ Setup Node.js 22
    │   ├─→ npm ci
    │   ├─→ npm run lint
    │   ├─→ npm run format:check
    │   └─→ Comentar en PR si falla
    │
    ├─→ Test Workflow (3-5 min)
    │   ├─→ Checkout código
    │   ├─→ Setup Node.js 22
    │   ├─→ Levantar MySQL 8.0 (Docker)
    │   ├─→ npm ci
    │   ├─→ npm run migrate
    │   ├─→ npm test -- --coverage
    │   ├─→ Subir coverage a Codecov (opcional)
    │   └─→ Comentar coverage en PR
    │
    └─→ Reviewer aprueba PR
        └─→ Merge permitido solo si:
            ✅ Lint pasó
            ✅ Tests pasaron
            ✅ 1 aprobación recibida
```

### 3. Merge a `develop` o `main`

```
Merge exitoso
    │
    └─→ Código integrado
        └─→ Workflows se ejecutan de nuevo
            └─→ Verificación final
```

## 🏗️ Arquitectura de Aplicación (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend React)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      src/server.js                           │
│  • Inicia servidor Express                                   │
│  • Escucha en puerto 3000                                    │
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

## 📊 Métricas y Tiempos

### Tiempos de Ejecución

| Workflow | Tiempo Promedio | Acciones |
| -------- | --------------- | -------- |
| **Lint** | 1-2 minutos     | ESLint + Prettier + Comment PR |
| **Test** | 3-5 minutos     | Jest + MySQL + Coverage + Comment |

### Recursos Utilizados

| Servicio           | Plan          | Límites   | Costo |
| ------------------ | ------------- | --------- | ----- |
| **GitHub Actions** | Free/Pro      | 2000 min/mes (Free) | $0    |
| **GitHub Actions** | Education Pro | Ilimitado | $0    |

## 🔒 Branch Protection Rules

### Configuración Recomendada

**Para `main` y `develop`:**

```yaml
Branch Protection Rules:
  ✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale pull request approvals when new commits are pushed
  ✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ Status checks that are required:
      - lint
      - test
  ✅ Require conversation resolution before merging
  ✅ Include administrators
  ✅ Restrict who can push to matching branches (opcional)
```

### Resultado

- 🚫 No se puede hacer push directo a `main` o `develop`
- 🚫 No se puede mergear sin aprobación
- 🚫 No se puede mergear con tests fallando
- 🚫 No se puede mergear con errores de linting
- ✅ Todo el código pasa por code review
- ✅ Todo el código tiene tests pasando
- ✅ Todo el código cumple estándares de estilo

## 📈 Beneficios

### Calidad de Código

- ✅ Estilo consistente (ESLint + Prettier)
- ✅ Tests automáticos en cada cambio
- ✅ Coverage tracking
- ✅ Code review obligatorio

### Prevención de Errores

- ✅ No se puede mergear código con errores
- ✅ Tests deben pasar antes de merge
- ✅ Linting debe pasar antes de merge
- ✅ Aprobación humana requerida

### Colaboración

- ✅ Proceso estandarizado para todo el equipo
- ✅ Feedback automático en PRs
- ✅ Historial claro de cambios
- ✅ Revisión de código facilitada

## 🚀 Comandos Útiles

### Desarrollo Local

```bash
# Verificar código antes de push
npm run lint              # Verificar estilo
npm run lint:fix          # Arreglar automáticamente
npm run format            # Formatear código
npm run format:check      # Verificar formato
npm test                  # Ejecutar tests
npm run test:coverage     # Tests con coverage
```

### Git Workflow

```bash
# Crear feature branch
git checkout develop
git pull origin develop
git checkout -b feature/BE-XXX-descripcion

# Desarrollar
# ... hacer cambios ...
npm run lint
npm test

# Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/BE-XXX-descripcion

# Crear PR en GitHub
# Esperar aprobación y checks
# Merge
```

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

**Última actualización:** Enero 2025  
**Versión:** 1.0.0  
**Tipo:** Protección del Repositorio (Sin Deploy)
