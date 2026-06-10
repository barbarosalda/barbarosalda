import type { IIntegrationProviderRepository } from '@src/modules/integration/application/port/repository/IIntegrationProviderRepository';
import type {
  CreateIntegrationProviderInput,
  IntegrationProvider,
  UpdateIntegrationProviderInput,
} from '@modules/integration/domain/IntegrationProvider/IntegrationProvider';
import {
  toDomainIntegrationProvider,
  toPrismaIntegrationProviderCreateData,
  toPrismaIntegrationProviderUpdateData,
} from '@modules/integration/infrastructure/repository/IntegrationPrismaMapper';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { getPrismaClient } from '@shared/infrastructure/database/prisma/getPrismaClient';
import { createId } from '@shared/kernel/ids/createId';

const INTEGRATION_PROVIDER_ID_PREFIX = 'ipr';

export class IntegrationProviderPrismaRepositoryAdapter
  implements IIntegrationProviderRepository
{
  constructor(private readonly database: IDatabasePort) {}

  async findById(id: string, tx?: ITransactionPort): Promise<IntegrationProvider | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationProvider.findUnique({ where: { id } });
    return row ? toDomainIntegrationProvider(row) : null;
  }

  async findByCode(code: string, tx?: ITransactionPort): Promise<IntegrationProvider | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationProvider.findUnique({ where: { code } });
    return row ? toDomainIntegrationProvider(row) : null;
  }

  async getAll(tx?: ITransactionPort): Promise<IntegrationProvider[]> {
    const client = getPrismaClient(this.database, tx);
    const rows = await client.integrationProvider.findMany({ orderBy: { name: 'asc' } });
    return rows.map(toDomainIntegrationProvider);
  }

  async create(
    input: CreateIntegrationProviderInput,
    tx?: ITransactionPort,
  ): Promise<IntegrationProvider> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationProvider.create({
      data: toPrismaIntegrationProviderCreateData(
        input,
        createId(INTEGRATION_PROVIDER_ID_PREFIX),
      ),
    });
    return toDomainIntegrationProvider(row);
  }

  async updateById(
    id: string,
    input: UpdateIntegrationProviderInput,
    tx?: ITransactionPort,
  ): Promise<IntegrationProvider> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.integrationProvider.update({
      where: { id },
      data: toPrismaIntegrationProviderUpdateData(input),
    });
    return toDomainIntegrationProvider(row);
  }
}
