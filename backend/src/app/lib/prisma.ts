import { PrismaClient } from '@prisma/client';
import { config } from '../../config';

const prisma = new PrismaClient({
  log: config.isProduction ? ['error'] : ['error', 'warn'],
});

// Neon sits in another region behind a pooler, so a handful of round trips can blow past
// Prisma's 5 second interactive transaction default and fail with P2028.
export const transactionOptions = { maxWait: 15000, timeout: 30000 };

export default prisma;
