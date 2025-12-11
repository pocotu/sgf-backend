#!/usr/bin/env node

/**
 * Conditional database migration script for production deployments
 * Executes only when RUN_MIGRATIONS=true environment variable is set
 */

const { execSync } = require('child_process');
const Logger = require('./utils/logger');

const logger = new Logger('MIGRATE');
const shouldRun = process.env.RUN_MIGRATIONS === 'true';
const env = process.env.NODE_ENV || 'development';
const dbUrl = logger.maskCredentials(process.env.DATABASE_URL);

logger.info(`Environment: ${env}`);
logger.info(`RUN_MIGRATIONS: ${process.env.RUN_MIGRATIONS || 'undefined'}`);
logger.info(`Database: ${dbUrl}`);

if (shouldRun) {
  logger.warn('Executing database migrations');
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }

    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    logger.success('Migrations completed successfully');
    
  } catch (error) {
    logger.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
} else {
  logger.info('Migrations skipped (RUN_MIGRATIONS not set to true)');
}
