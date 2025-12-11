/**
 * Logging utility for build and deployment scripts
 * Provides consistent, production-grade output formatting
 */

class Logger {
  constructor(prefix) {
    this.prefix = prefix;
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.prefix}:${level}] ${message}`);
  }

  info(message) {
    this.log('INFO', message);
  }

  success(message) {
    this.log('SUCCESS', message);
  }

  warn(message) {
    this.log('WARN', message);
  }

  error(message) {
    this.log('ERROR', message);
  }

  debug(message) {
    if (process.env.DEBUG) {
      this.log('DEBUG', message);
    }
  }

  maskCredentials(url) {
    if (!url) {
      return 'NOT_SET';
    }
    return url.replace(/:[^:@]+@/, ':****@');
  }

  extractDbName(url) {
    if (!url) {
      return 'unknown';
    }
    const match = url.split('/').pop()?.split('?')[0];
    return match || 'unknown';
  }
}

module.exports = Logger;
