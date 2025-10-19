module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/infrastructure/database/migrations/**',
    '!src/infrastructure/database/seeders/**',
    '!src/config/**',
  ],
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
