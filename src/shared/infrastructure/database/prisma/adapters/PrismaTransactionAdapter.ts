import type { Prisma } from '@generated/prisma/client';

import type { IChangeRecorderPort } from '@shared/application/ports/audit/IChangeRecorderPort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IEventOutboxPort } from '@shared/application/ports/events/IEventOutboxPort';

export class PrismaTransactionAdapter implements ITransactionPort {
  constructor(
    private readonly client: Prisma.TransactionClient,
    public readonly changes: IChangeRecorderPort,
    public readonly events: IEventOutboxPort,
  ) {}

  getClient(): Prisma.TransactionClient {
    return this.client;
  }
}
