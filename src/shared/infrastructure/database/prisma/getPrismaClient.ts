import type { Prisma, PrismaClient } from '@generated/prisma/client';

import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { PrismaTransactionAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaTransactionAdapter';

export type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

export function getPrismaClient(
  database: IDatabasePort,
  tx?: ITransactionPort,
): PrismaClientLike {
  if (!tx) return database.getClient();
  if (tx instanceof PrismaTransactionAdapter) return tx.getClient();

  throw new Error('Only PrismaTransactionAdapter is supported for Prisma repositories.');
}