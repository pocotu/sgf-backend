/**
 * Prisma Client Singleton
 *
 * Este archivo exporta una única instancia de PrismaClient
 * para evitar múltiples conexiones a la base de datos.
 *
 * En desarrollo, usa globalThis para mantener la instancia
 * entre hot reloads de nodemon.
 */

const { PrismaClient } = require('@prisma/client');

const prismaClientSingleton = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Declarar tipo global para TypeScript (si se migra a TS)
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
