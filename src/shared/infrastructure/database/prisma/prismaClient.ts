import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@generated/prisma/client';
import { env } from '@shared/config/env';

/**
 * Process-wide Prisma client used by infrastructure adapters.
 */
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prismaClient = new PrismaClient({ adapter });
