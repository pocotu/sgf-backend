# Quick Start - Proteccion del Repositorio

Guia rapida para configurar la proteccion del repositorio en 5 minutos.

## Que obtienes?

- Lint automatico en cada PR (ESLint + Prettier)
- Tests automaticos en cada PR (Jest + MySQL)
- Branch protection (requiere aprobacion para merge)
- No se puede mergear codigo con errores
- Code review obligatorio

## Configuracion (5 minutos)

### Paso 1: Configurar Branch Protection en GitHub

```bash
1. Ir a tu repositorio en GitHub
2. Settings -> Branches -> Add rule
3. Branch name pattern: main
4. Marcar:
   [x] Require a pull request before merging
   [x] Require approvals: 1
   [x] Require status checks to pass before merging
   [x] Status checks that are required:
      - lint
      - test
   [x] Include administrators
5. Save changes
6. Repetir para branch: develop
```

### Paso 2: Verificar que funciona

```bash
# Crear una rama de prueba
git checkout -b test/ci-cd
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "test: verificar CI/CD"
git push origin test/ci-cd

# Ir a GitHub y crear un Pull Request hacia develop
# Verificar que se ejecuten automaticamente:
# 1. Backend Lint [PASS]
# 2. Backend Tests [PASS]
```

**Listo!** Ahora tienes proteccion del repositorio funcionando.

## Flujo de Trabajo

### 1. Desarrollador crea feature branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/BE-XXX-descripcion
```

### 2. Desarrolla codigo

```bash
# Hacer cambios
npm run lint        # Verificar estilo
npm test            # Ejecutar tests

git add .
git commit -m "feat: descripcion del cambio"
git push origin feature/BE-XXX-descripcion
```

### 3. Crear Pull Request

```bash
# En GitHub:
1. Ir a Pull Requests -> New Pull Request
2. Base: develop <- Compare: feature/BE-XXX-descripcion
3. Crear PR

# GitHub Actions ejecutara automaticamente:
[RUNNING] Lint Workflow (1-2 min)
[RUNNING] Test Workflow (3-5 min)
```

### 4. Code Review

```bash
# Otro desarrollador revisa el codigo
# Si hay cambios solicitados:
- Hacer los cambios
- git push (los workflows se ejecutan de nuevo)

# Si todo esta bien:
- Reviewer aprueba el PR
```

### 5. Merge

```bash
# Una vez aprobado y con checks pasando:
- Click en "Merge pull request"
- El codigo se integra a develop
```

## Que NO se puede hacer

Con la proteccion activada:

- [x] Push directo a `main` o `develop`
- [x] Merge sin aprobacion de reviewer
- [x] Merge con tests fallando
- [x] Merge con errores de linting
- [x] Bypass de proteccion (ni siquiera admins)

## Verificacion

Para verificar que la proteccion esta activa:

```bash
# Intentar push directo a develop (deberia fallar)
git checkout develop
echo "test" >> README.md
git add README.md
git commit -m "test"
git push origin develop

# Resultado esperado:
# [FAIL] Error: protected branch hook declined
```

## Workflows Disponibles

### 1. Lint Workflow

**Archivo:** `.github/workflows/lint.yml`

**Se ejecuta en:**

- Pull Request a `main` o `develop`
- Push a `main` o `develop`

**Acciones:**

1. Checkout codigo
2. Setup Node.js 22
3. Instalar dependencias (`npm ci`)
4. Ejecutar ESLint (`npm run lint`)
5. Verificar formato Prettier (`npm run format:check`)
6. Comentar en PR si falla (texto ASCII puro)

**Tiempo:** 1-2 minutos

**Mensaje de error en PR:**
```
Linting failed. Please fix the issues and push again.
```

### 2. Test Workflow

**Archivo:** `.github/workflows/test.yml`

**Se ejecuta en:**

- Pull Request a `main` o `develop`
- Push a `main` o `develop`

**Acciones:**

1. Checkout codigo
2. Setup Node.js 22
3. Levantar MySQL 8.0 en contenedor Docker
4. Instalar dependencias (`npm ci`)
5. Esperar a que MySQL este listo (health check)
6. Ejecutar migraciones (`npm run migrate`)
7. Ejecutar tests con coverage (`npm test -- --coverage --verbose`)
8. Subir coverage a Codecov (opcional)
9. Comentar coverage en PR (formato tabla ASCII)

**Tiempo:** 3-5 minutos

**Configuracion de Jest:**
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,    // Cobertura de ramas
    functions: 80,   // Cobertura de funciones
    lines: 80,       // Cobertura de lineas
    statements: 80,  // Cobertura de sentencias
  }
}

// Archivos excluidos del coverage:
- src/server.js (bootstrapping)
- src/app.js (configuracion de middleware)
- src/config/** (configuracion estatica)
- src/infrastructure/database/migrations/** (scripts de BD)
- src/infrastructure/database/seeders/** (scripts de BD)
```

**Mensaje de coverage en PR:**
```
## Test Coverage Report

| Metric | Coverage |
|--------|----------|
| Statements | XX.XX% |
| Branches | XX.XX% |
| Functions | XX.XX% |
| Lines | XX.XX% |

[PASS/WARN] Coverage meets/below 80% threshold
```

## Troubleshooting

### "Workflow not found"

- Verificar que los archivos esten en `.github/workflows/`
- Verificar que tengan extension `.yml`
- Hacer push de los archivos al repositorio

### "Status check not found"

- Esperar a que los workflows se ejecuten al menos una vez
- Luego apareceran en la lista de status checks

### "Tests failed"

- Ejecutar tests localmente: `npm test`
- Verificar que todas las dependencias esten instaladas
- Revisar los logs en GitHub Actions
- Verificar que MySQL este corriendo (el workflow usa MySQL 8.0)

### "Linting failed"

- Ejecutar linting localmente: `npm run lint`
- Arreglar errores: `npm run lint:fix`
- Verificar formato: `npm run format:check`
- Arreglar formato: `npm run format`

### "Coverage below threshold"

- Ejecutar tests con coverage: `npm test -- --coverage`
- Revisar archivos sin cobertura en `coverage/lcov-report/index.html`
- Agregar tests para alcanzar los thresholds:
  - Branches: 70%
  - Functions: 80%
  - Lines: 80%
  - Statements: 80%

## Comandos Utiles

```bash
# Verificar codigo localmente antes de push
npm run lint              # Verificar estilo
npm run lint:fix          # Arreglar automaticamente
npm run format            # Formatear codigo
npm run format:check      # Verificar formato
npm test                  # Ejecutar tests
npm test -- --coverage    # Tests con coverage

# Git workflow
git checkout develop                    # Ir a develop
git pull origin develop                 # Actualizar
git checkout -b feature/BE-XXX          # Crear feature
# ... hacer cambios ...
git add .                               # Agregar cambios
git commit -m "feat: descripcion"       # Commit
git push origin feature/BE-XXX          # Push
# ... crear PR en GitHub ...
```

## Resumen

**Configuracion:**

- Tiempo: 5 minutos
- Pasos: 2 (Branch protection + Verificacion)
- Costo: $0 (GitHub Actions gratis para repos publicos)

**Beneficios:**

- Codigo siempre revisado
- Tests siempre pasando
- Estilo de codigo consistente
- Menos bugs en produccion
- Mejor calidad de codigo

**Resultado:**

- Repositorio protegido
- No se puede mergear codigo malo
- Code review obligatorio
- Coverage tracking automatico

**Thresholds de Coverage:**

- Branches: 70% (estandar industria)
- Functions: 80% (cada funcion debe estar testeada)
- Lines: 80% (cobertura alta)
- Statements: 80% (cobertura alta)

**Archivos excluidos del coverage:**

- server.js - Solo bootstrapping
- app.js - Solo configuracion de middleware
- config/** - Configuracion estatica
- migrations/** y seeders/** - Scripts de BD

---

**Listo para empezar!**
