// Test setup file for Jest
// Global test configurations and mocks

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '10';

// Global test timeout
jest.setTimeout(10000);

// Add any global mocks here
// jest.mock('../src/infrastructure/database/connection');

console.log('Test environment initialized');
