import type { Prisma, PrismaClient } from '@generated/prisma/client';

import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { createId } from '@shared/kernel/ids/createId';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import { PrismaTransactionAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaTransactionAdapter';
import type { IUserPreferenceRepository } from '@modules/user/application/ports/IUserPreferenceRepository';
import type {
  CreateUserPreferenceInput,
  UpdateUserPreferenceInput,
  UserPreference,
} from '@modules/user/domain/preference/UserPreference';
import {
  toDomainUserPreference,
  toPrismaUserPreferenceCreateData,
  toPrismaUserPreferenceUpdateData,
} from '@modules/user/infrastructure/persistence/prisma/mappers/UserPreferenceMapper';

const USER_PREFERENCE_ID_PREFIX = 'upr';

export class PrismaUserPreferenceRepositoryAdapter implements IUserPreferenceRepository {
  constructor(private readonly database: IDatabasePort) {}

  async findById(id: string, tx?: ITransactionPort): Promise<UserPreference | null> {
    const client = this.getClient(tx);
    const row = await client.userPreference.findUnique({ where: { id } });
    return row ? toDomainUserPreference(row) : null;
  }

  async findByUserId(userId: string, tx?: ITransactionPort): Promise<UserPreference | null> {
    const client = this.getClient(tx);
    const row = await client.userPreference.findUnique({ where: { user_id: userId } });
    return row ? toDomainUserPreference(row) : null;
  }

  async create(input: CreateUserPreferenceInput, tx?: ITransactionPort): Promise<UserPreference> {
    const client = this.getClient(tx);
    const row = await client.userPreference.create({
      data: toPrismaUserPreferenceCreateData(input, createId(USER_PREFERENCE_ID_PREFIX)),
    });
    return toDomainUserPreference(row);
  }

  async updateByUserId(
    input: { userId: string; data: UpdateUserPreferenceInput },
    tx?: ITransactionPort,
  ): Promise<UserPreference> {
    const client = this.getClient(tx);
    const row = await client.userPreference.update({
      where: { user_id: input.userId },
      data: toPrismaUserPreferenceUpdateData(input.data),
    });
    return toDomainUserPreference(row);
  }

  private getClient(tx?: ITransactionPort): PrismaClient | Prisma.TransactionClient {
    if (!tx) return this.database.getClient();
    if (tx instanceof PrismaTransactionAdapter) return tx.getClient();
    throw new Error(
      'PrismaUserPreferenceRepositoryAdapter only supports PrismaTransactionAdapter when a transaction is provided.',
    );
  }
}
