/* eslint-env node */
const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  prettierConfig,
  {
    files: [
      'src/**/*.js',
      'tests/**/*.js',
      'jest.config.js',
      'scripts/**/*.js',
      'eslint.config.js',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        global: 'readonly',
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        it: 'readonly',
      },
    },
    rules: {
      /*
       * ===== MANTENIBILIDAD (Complejidad y Legibilidad) =====
       * Limita la complejidad ciclomática (McCabe)
       */
      complexity: ['warn', { max: 10 }],
      'max-depth': ['warn', { max: 4 }], // Máximo 4 niveles de anidación
      'max-nested-callbacks': ['warn', { max: 3 }], // Máximo 3 callbacks anidados
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', { max: 4 }], // Máximo 4 parámetros por función
      'max-statements': ['warn', { max: 20 }, { ignoreTopLevelFunctions: false }],

      /*
       * ===== CORRECCIÓN (Prevención de Errores) =====
       * Variables y scope
       */
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-undef': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      'no-shadow': ['error', { builtinGlobals: false, hoist: 'functions' }],
      'no-shadow-restricted-names': 'error',
      'no-redeclare': 'error',

      // Errores comunes
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-constant-condition': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-duplicate-case': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-ex-assign': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-obj-calls': 'error',
      'no-promise-executor-return': 'error',
      'no-prototype-builtins': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'warn',
      'no-unexpected-multiline': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-private-class-members': 'warn',
      'use-isnan': 'error',
      'valid-typeof': 'error',

      /*
       * ===== SEGURIDAD =====
       * Prevención de inyección de código
       */
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // Prevención de vulnerabilidades
      'no-caller': 'error', // Previene uso de arguments.caller/callee
      'no-extend-native': 'error', // No modificar prototipos nativos
      'no-global-assign': 'error', // No reasignar variables globales
      'no-iterator': 'error', // No usar __iterator__
      'no-proto': 'error', // No usar __proto__
      'no-with': 'error', // No usar with statement

      // Validación de datos
      'no-regex-spaces': 'warn', // Espacios múltiples en regex pueden ser error
      'no-control-regex': 'warn', // Caracteres de control en regex

      // ===== CONFIABILIDAD (Manejo de Errores) =====
      'no-console': 'off', // Permitido para logging con Winston
      'no-debugger': 'warn',
      'no-alert': 'error', // No usar alert en backend
      'no-throw-literal': 'error', // Solo throw Error objects
      'prefer-promise-reject-errors': 'error', // Rechazar promesas con Error
      'no-return-await': 'error', // Innecesario return await
      'require-await': 'warn', // Funciones async deben tener await
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn', // Puede causar problemas de performance

      // ===== RENDIMIENTO =====
      'no-loop-func': 'warn', // No crear funciones dentro de loops
      'no-new-object': 'warn', // Usar {} en lugar de new Object()
      'no-new-wrappers': 'error', // No usar new String(), new Number(), etc.
      'no-array-constructor': 'warn', // Usar [] en lugar de new Array()

      /*
       * ===== ESTÁNDARES Y PROCEDIMIENTOS =====
       * Consistencia de código
       */
      'no-var': 'error', // Usar let/const
      'prefer-const': 'error', // Usar const cuando sea posible
      eqeqeq: ['error', 'always', { null: 'ignore' }], // Usar === siempre
      curly: ['error', 'all'], // Siempre usar llaves en bloques
      'dot-notation': ['warn', { allowKeywords: true }], // Usar notación de punto
      'no-else-return': ['warn', { allowElseIf: false }], // Simplificar if-else
      'no-lonely-if': 'warn', // Simplificar if anidados
      'no-unneeded-ternary': 'warn', // Simplificar ternarios
      'no-useless-return': 'warn', // Eliminar returns innecesarios
      'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
      'prefer-template': 'warn', // Usar template strings
      'object-shorthand': ['warn', 'always'], // Usar shorthand en objetos
      'quote-props': ['warn', 'as-needed'], // Solo quotes cuando sea necesario
      yoda: ['warn', 'never'], // No usar condiciones Yoda

      // Naming conventions
      camelcase: [
        'warn',
        {
          properties: 'never',
          ignoreDestructuring: false,
          ignoreImports: false,
          ignoreGlobals: false,
        },
      ],

      // Comentarios y documentación
      'spaced-comment': ['warn', 'always', { markers: ['/'] }],
      'multiline-comment-style': ['warn', 'starred-block'],

      // ===== CAPACIDAD DE PRUEBA =====
      'no-new': 'warn', // No usar new sin asignar (dificulta testing)
      'no-param-reassign': ['warn', { props: false }], // No modificar parámetros
      'consistent-return': 'warn', // Siempre retornar o nunca retornar

      /*
       * ===== PRINCIPIOS SOLID =====
       * Single Responsibility ya cubierto con max-lines-per-function
       * Dependency Inversion: forzar inyección de dependencias
       */
      'no-restricted-syntax': [
        'warn',
        {
          selector: "NewExpression[callee.name='PrismaClient']",
          message: 'No instanciar PrismaClient directamente. Usar inyección de dependencias.',
        },
      ],
    },
  },
  // Configuración específica para tests
  {
    files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-statements': 'off',
      'max-nested-callbacks': 'off', // Jest estructura con describe/it anidados
      'no-undef': 'off', // Jest globals
      'no-unused-expressions': 'off', // Para expect().toBe()
    },
  },
  // Configuración específica para archivos de configuración de BD
  {
    files: ['src/config/database.js', 'tests/**/database.test.js'],
    rules: {
      'no-restricted-syntax': 'off', // Permitir instanciar PrismaClient en singleton y tests
    },
  },
  // Configuración específica para archivos de configuración
  {
    files: ['*.config.js', 'scripts/**/*.js'],
    rules: {
      'no-console': 'off',
      'max-lines': 'off',
    },
  },
  // Configuración específica para servicios y repositorios (lógica de negocio compleja)
  {
    files: ['src/services/**/*.js', 'src/repositories/**/*.js', 'src/use-cases/**/*.js'],
    rules: {
      complexity: ['warn', { max: 25 }], // Permitir mayor complejidad en validaciones
      'max-statements': ['warn', { max: 40 }],
      'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
      'require-await': 'off', // Algunos métodos async no necesitan await
    },
  },
  // Configuración específica para middleware y validadores
  {
    files: ['src/middleware/**/*.js', 'src/validators/**/*.js'],
    rules: {
      complexity: ['warn', { max: 30 }],
      'max-statements': ['warn', { max: 40 }],
      'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
      'consistent-return': 'off', // Middleware puede no retornar siempre
    },
  },
  // Configuración específica para controladores
  {
    files: ['src/controllers/**/*.js'],
    rules: {
      'max-params': ['warn', { max: 5 }], // Controladores pueden tener más dependencias
      'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
    },
  },
  // Configuración específica para archivos de dependencias
  {
    files: ['src/config/dependencies.js', 'src/config/container.js'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-restricted-syntax': 'off', // Necesita instanciar PrismaClient
    },
  },
  // Configuración específica para archivos de documentación/ejemplos
  {
    files: ['docs/**/*.js', 'examples/**/*.js'],
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
    },
  },
  // Archivos a ignorar
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'migrations/**',
      'seeders/**',
      'prisma/**',
      '.env',
      '.env.*',
      'logs/**',
      'uploads/**',
    ],
  },
];
