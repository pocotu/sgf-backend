#!/usr/bin/env node

/**
 * Test database setup script
 * Configures test database with migrations and seed data
 */

const { execSync } = require('child_process');
const path = require('path');
const Logger = require('./utils/logger');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

const logger = new Logger('SETUP');
const dbUrl = process.env.DATABASE_URL || '';
const dbName = logger.extractDbName(dbUrl);

logger.info(`Database: ${logger.maskCredentials(dbUrl)}`);
logger.info(`Database name: ${dbName}`);

// Security validation
if (!dbName.includes('test')) {
  logger.error(`Security check failed: database name must contain 'test'`);
  logger.error(`Current database: ${dbName}`);
  process.exit(1);
}

try {
  logger.info('Applying migrations...');
  execSync('npx prisma migrate dev --skip-seed', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });

  logger.info('Seeding test data...');
  execSync('node prisma/seed.js', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });

  logger.success('Test database configured successfully');
} catch (error) {
  logger.error(`Setup failed: ${error.message}`);
  console.error('\nTroubleshooting:');
  console.error('  1. Verify MySQL is running');
  console.error('  2. Check credentials in .env.test');
  console.error('  3. Ensure user has CREATE DATABASE permission');
  process.exit(1);
}
