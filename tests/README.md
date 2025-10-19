# Testing Guide

## Configuracion de Base de Datos de Test

### Primera vez (Setup inicial)

```bash
# 1. Copiar el archivo de ejemplo y configurar tu password de MySQL
cp .env.test.example .env.test

# 2. Editar .env.test y cambiar 'your_password' por tu password de MySQL
# DATABASE_URL=mysql://root:tu_password@localhost:3306/academias_db_test

# 3. Configurar la BD de test (Prisma la crea automaticamente)
npm run test:setup
```

**IMPORTANTE:** 
- El archivo `.env.test` contiene credenciales sensibles y NO debe subirse a Git
- Solo se sube `.env.test.example` como plantilla
- El script `check-test-env.js` verifica automaticamente la configuracion antes de cada test

**Prisma se encarga de:**
- Crear la base de datos `academias_db_test` si no existe
- Aplicar todas las migraciones
- Generar Prisma Client
- Poblar datos iniciales (seed)

### Comandos disponibles

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Resetear BD de test (limpia y recrea todo)
npm run test:reset

# Reconfigurar BD de test
npm run test:setup
```

## Estructura de Tests

```
tests/
├── setup.js              # Configuración global de Jest
├── fixtures/             # Datos de prueba
├── unit/                 # Tests unitarios
│   ├── entities/
│   ├── use-cases/
│   └── app.test.js
└── integration/          # Tests de integración
    ├── auth/
    ├── users/
    ├── academic/
    ├── admissions/
    └── financial/
```

## Variables de Entorno

El archivo `.env.test` contiene la configuración para testing:

- `DATABASE_URL`: Base de datos separada (`academias_db_test`)
- `NODE_ENV=test`: Modo de testing
- `BCRYPT_SALT_ROUNDS=10`: Menor para tests más rápidos
- `LOG_LEVEL=error`: Solo errores en logs

## Buenas Practicas

1. **Nunca usar la BD de desarrollo para tests**
   - Desarrollo: `academias_db`
   - Testing: `academias_db_test`

2. **Limpiar datos entre tests**
   ```javascript
   beforeEach(async () => {
     await prisma.usuario.deleteMany();
   });
   ```

3. **Usar transacciones para tests de integracion**
   ```javascript
   const prisma = new PrismaClient();
   await prisma.$transaction(async (tx) => {
     // Test code
   });
   ```