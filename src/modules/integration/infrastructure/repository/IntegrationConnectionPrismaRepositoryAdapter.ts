import type { IIntegrationConnectionRepository } from '@src/modules/integration/application/port/repository/IIntegrationConnectionRepository';
import type {
  CreateIntegrationConnectionInput,
  IntegrationConnection,
  UpdateIntegrationConnectionInput,
} from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';
import {
  toDomainIntegrationConnection,
  toPrismaIntegrationConnectionCreateData,
  toPrismaIntegrationConnectionUpdateData,
} from '@modules/integration/infrastructure/repository/IntegrationPrismaMapper';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { getPrismaClient } from '@shared/infrastructure/database/prisma/getPrismaClient';
import { createId } from '@shared/kernel/ids/createId';

const INTEGRATION_CONNECTION_ID_PREFIX = 'icn';

export class IntegrationConnectionPrismaRepositoryAdapter
  implements IIntegrationConnectionRepository
{
  constructor(private readonly database: IDatabasePort) {}

  async findById(id: string, tx?: ITransactionPort): Promise<IntegrationConnection | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationConnection.findUnique({ where: { id } });
    return row ? toDomainIntegrationConnection(row) : null;
  }

  async findByProviderId(
    providerId: string,
    tx?: ITransactionPort,
  ): Promise<IntegrationConnection | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationConnection.findFirst({
      where: { provider_id: providerId },
      orderBy: { created_at: 'desc' },
    });
    return row ? toDomainIntegrationConnection(row) : null;
  }

  async findByUserIdAndProviderId(
    userId: string,
    providerId: string,
    tx?: ITransactionPort,
  ): Promise<IntegrationConnection | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationConnection.findUnique({
      where: {
        user_id_provider_id: {
          user_id: userId,
          provider_id: providerId,
        },
      },
    });
    return row ? toDomainIntegrationConnection(row) : null;
  }

  async findByUserId(
    userId: string,
    tx?: ITransactionPort,
  ): Promise<IntegrationConnection | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationConnection.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return row ? toDomainIntegrationConnection(row) : null;
  }

  async create(
    input: CreateIntegrationConnectionInput,
    tx?: ITransactionPort,
  ): Promise<IntegrationConnection> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationConnection.create({
      data: toPrismaIntegrationConnectionCreateData(
        input,
        createId(INTEGRATION_CONNECTION_ID_PREFIX),
      ),
    });
    return toDomainIntegrationConnection(row);
  }

  async updateById(
    id: string,
    input: UpdateIntegrationConnectionInput,
    tx?: ITransactionPort,
  ): Promise<IntegrationConnection> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationConnection.update({
      where: { id },
      data: toPrismaIntegrationConnectionUpdateData(input),
    });
    return toDomainIntegrationConnection(row);
  }
}
