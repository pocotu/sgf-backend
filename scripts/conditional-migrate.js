#!/usr/bin/env node

/**
 * Conditional database migration script for production deployments
 * Executes only when RUN_MIGRATIONS=true environment variable is set
 */

const { execSync } = require('child_process');
const Logger = require('./utils/logger');

const logger = new Logger('MIGRATE');
const shouldRunMigrations = process.env.RUN_MIGRATIONS === 'true';
const shouldRunSeed = process.env.RUN_SEED === 'true';
const env = process.env.NODE_ENV || 'development';
const dbUrl = logger.maskCredentials(process.env.DATABASE_URL);

logger.info(`Environment: ${env}`);
logger.info(`RUN_MIGRATIONS: ${process.env.RUN_MIGRATIONS || 'undefined'}`);
logger.info(`RUN_SEED: ${process.env.RUN_SEED || 'undefined'}`);
logger.info(`Database: ${dbUrl}`);

if (shouldRunMigrations) {
  logger.warn('Executing database migrations');

  const maxRetries = 3;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }

    // Add connection timeout and retry logic
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      attempt++;
      logger.info(`Migration attempt ${attempt}/${maxRetries}`);

      try {
        execSync('npx prisma migrate deploy', {
          stdio: 'inherit',
          timeout: 60000, // 60 seconds timeout
        });
        success = true;
        logger.success('Migrations completed successfully');
      } catch (error) {
        // eslint-disable-next-line max-depth
        if (attempt < maxRetries) {
          logger.warn(`Migration attempt ${attempt} failed, retrying in 5 seconds...`);
          execSync('sleep 5', { stdio: 'inherit' });
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    logger.error(`Migration failed after ${maxRetries} attempts: ${error.message}`);
    process.exit(1);
  }
} else {
  logger.info('Migrations skipped (RUN_MIGRATIONS not set to true)');
}

if (shouldRunSeed) {
  logger.warn('Executing database seed');

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }

    execSync('node prisma/seed.js', { stdio: 'inherit' });
    logger.success('Seed completed successfully');
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
} else {
  logger.info('Seed skipped (RUN_SEED not set to true)');
}
