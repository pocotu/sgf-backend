# 🚀 Quick Start - Protección del Repositorio

Guía rápida para configurar la protección del repositorio en 5 minutos.

## 🎯 ¿Qué obtienes?

- ✅ Lint automático en cada PR (ESLint + Prettier)
- ✅ Tests automáticos en cada PR (Jest + MySQL)
- ✅ Branch protection (requiere aprobación para merge)
- ✅ No se puede mergear código con errores
- ✅ Code review obligatorio

## 📋 Configuración (5 minutos)

### Paso 1: Configurar Branch Protection en GitHub

```bash
1. Ir a tu repositorio en GitHub
2. Settings → Branches → Add rule
3. Branch name pattern: main
4. Marcar:
   ✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Require status checks to pass before merging
   ✅ Status checks that are required:
      - lint
      - test
   ✅ Include administrators
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
# Verificar que se ejecuten automáticamente:
# 1. Backend Lint ✅
# 2. Backend Tests ✅
```

**✅ Listo!** Ahora tienes protección del repositorio funcionando.

## 🔄 Flujo de Trabajo

### 1. Desarrollador crea feature branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/BE-XXX-descripcion
```

### 2. Desarrolla código

```bash
# Hacer cambios
npm run lint        # Verificar estilo
npm test            # Ejecutar tests

git add .
git commit -m "feat: descripción del cambio"
git push origin feature/BE-XXX-descripcion
```

### 3. Crear Pull Request

```bash
# En GitHub:
1. Ir a Pull Requests → New Pull Request
2. Base: develop ← Compare: feature/BE-XXX-descripcion
3. Crear PR

# GitHub Actions ejecutará automáticamente:
✅ Lint Workflow (1-2 min)
✅ Test Workflow (3-5 min)
```

### 4. Code Review

```bash
# Otro desarrollador revisa el código
# Si hay cambios solicitados:
- Hacer los cambios
- git push (los workflows se ejecutan de nuevo)

# Si todo está bien:
- Reviewer aprueba el PR
```

### 5. Merge

```bash
# Una vez aprobado y con checks pasando:
- Click en "Merge pull request"
- El código se integra a develop
```

## 🚫 Qué NO se puede hacer

Con la protección activada:

- ❌ Push directo a `main` o `develop`
- ❌ Merge sin aprobación de reviewer
- ❌ Merge con tests fallando
- ❌ Merge con errores de linting
- ❌ Bypass de protección (ni siquiera admins)

## ✅ Verificación

Para verificar que la protección está activa:

```bash
# Intentar push directo a develop (debería fallar)
git checkout develop
echo "test" >> README.md
git add README.md
git commit -m "test"
git push origin develop

# Resultado esperado:
# ❌ Error: protected branch hook declined
```

## 📊 Workflows Disponibles

### 1. Lint Workflow

**Archivo:** `.github/workflows/lint.yml`

**Se ejecuta en:**

- Pull Request a `main` o `develop`
- Push a `main` o `develop`

**Acciones:**

1. Checkout código
2. Setup Node.js 22
3. Instalar dependencias (`npm ci`)
4. Ejecutar ESLint (`npm run lint`)
5. Verificar formato Prettier (`npm run format:check`)
6. Comentar en PR si falla

**Tiempo:** 1-2 minutos

### 2. Test Workflow

**Archivo:** `.github/workflows/test.yml`

**Se ejecuta en:**

- Pull Request a `main` o `develop`
- Push a `main` o `develop`

**Acciones:**

1. Checkout código
2. Setup Node.js 22
3. Levantar MySQL 8.0 en contenedor Docker
4. Instalar dependencias (`npm ci`)
5. Ejecutar migraciones (`npm run migrate`)
6. Ejecutar tests con coverage (`npm test -- --coverage`)
7. Subir coverage a Codecov (opcional)
8. Comentar coverage en PR

**Tiempo:** 3-5 minutos

## 🆘 Troubleshooting

### "Workflow not found"

- Verificar que los archivos estén en `.github/workflows/`
- Verificar que tengan extensión `.yml`
- Hacer push de los archivos al repositorio

### "Status check not found"

- Esperar a que los workflows se ejecuten al menos una vez
- Luego aparecerán en la lista de status checks

### "Tests failed"

- Ejecutar tests localmente: `npm test`
- Verificar que todas las dependencias estén instaladas
- Revisar los logs en GitHub Actions

### "Linting failed"

- Ejecutar linting localmente: `npm run lint`
- Arreglar errores: `npm run lint:fix`
- Verificar formato: `npm run format:check`
- Arreglar formato: `npm run format`

## 📚 Comandos Útiles

```bash
# Verificar código localmente antes de push
npm run lint              # Verificar estilo
npm run lint:fix          # Arreglar automáticamente
npm run format            # Formatear código
npm run format:check      # Verificar formato
npm test                  # Ejecutar tests
npm run test:coverage     # Tests con coverage

# Git workflow
git checkout develop                    # Ir a develop
git pull origin develop                 # Actualizar
git checkout -b feature/BE-XXX          # Crear feature
# ... hacer cambios ...
git add .                               # Agregar cambios
git commit -m "feat: descripción"       # Commit
git push origin feature/BE-XXX          # Push
# ... crear PR en GitHub ...
```

## 🎯 Resumen

**Configuración:**

- ⏱️ Tiempo: 5 minutos
- 📝 Pasos: 2 (Branch protection + Verificación)
- 💰 Costo: $0 (GitHub Actions gratis)

**Beneficios:**

- ✅ Código siempre revisado
- ✅ Tests siempre pasando
- ✅ Estilo de código consistente
- ✅ Menos bugs en producción
- ✅ Mejor calidad de código

**Resultado:**

- 🔒 Repositorio protegido
- 🚫 No se puede mergear código malo
- ✅ Code review obligatorio
- 📊 Coverage tracking automático

---

**¡Listo para empezar! 🚀**
