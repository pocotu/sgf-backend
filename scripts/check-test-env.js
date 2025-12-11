#!/usr/bin/env node

/**
 * Test environment configuration validator
 * Runs automatically before tests (pretest hook)
 */

const fs = require('fs');
const path = require('path');
const Logger = require('./utils/logger');

const logger = new Logger('CHECK');

// Skip in CI/CD environments
if (process.env.CI || process.env.GITHUB_ACTIONS) {
  logger.info('CI/CD environment detected, skipping local .env.test check');
  process.exit(0);
}

const envTestPath = path.join(__dirname, '..', '.env.test');

// Check file exists
if (!fs.existsSync(envTestPath)) {
  logger.error('.env.test file not found');
  console.error('\nSetup instructions:');
  console.error('  1. Copy example file: cp .env.test.example .env.test');
  console.error('  2. Configure DATABASE_URL with your MySQL password');
  console.error('  3. Run setup: npm run test:setup');
  process.exit(1);
}

const content = fs.readFileSync(envTestPath, 'utf-8');

// Check for placeholder
if (content.includes('your_password')) {
  logger.error('.env.test contains placeholder "your_password"');
  console.error('\nReplace with actual password in .env.test');
  process.exit(1);
}

// Check DATABASE_URL exists
if (!content.includes('DATABASE_URL=')) {
  logger.error('.env.test missing DATABASE_URL');
  process.exit(1);
}

// Warn if not pointing to test database
if (!content.includes('academias_db_test')) {
  logger.warn('DATABASE_URL does not point to "academias_db_test"');
  logger.warn('Recommended to use separate database for tests');
}

const dbMatch = content.match(/\/([^/?]+)(\?|$)/);
const dbName = dbMatch ? dbMatch[1] : 'unknown';

logger.success(`Test configuration validated (database: ${dbName})`);
