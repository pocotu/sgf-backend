/*
 * Test setup file for Jest
 * Global test configurations and mocks
 */

// Load test environment variables
require('dotenv').config({ path: '.env.test' });

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);

/*
 * Add any global mocks here
 * jest.mock('../src/infrastructure/database/connection');
 */

console.log('Test environment initialized');
console.log('Database:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
