import type { Prisma, PrismaClient } from '@generated/prisma/client';

import type { IUserRepository } from '@modules/user/application/ports/IUserRepository';
import type { CreateUserInput, UpdateUserInput, User } from '@modules/user/domain/user/User';
import { createId } from '@shared/kernel/ids/createId';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { PrismaDatabaseAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaDatabaseAdapter';
import { PrismaTransactionAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaTransactionAdapter';
import { toDomainUser, toPrismaUserCreateData, toPrismaUserUpdateData } from '../mappers/UserMapper.ts';

const USER_ID_PREFIX = 'usr';

export class PrismaUserRepositoryAdapter implements IUserRepository {
  constructor(private readonly database: PrismaDatabaseAdapter) {}

  async findById(id: string, tx?: ITransactionPort): Promise<User | null> {
    const client = this.getClient(tx);
    const row = await client.user.findUnique({ where: { id } });
    return row ? toDomainUser(row) : null;
  }

  async findByExternalIdentity(
    input: { externalAuthProvider: string; externalAuthUserId: string },
    tx?: ITransactionPort,
  ): Promise<User | null> {
    const client = this.getClient(tx);
    const row = await client.user.findFirst({
      where: {
        external_auth_provider: input.externalAuthProvider,
        external_auth_user_id: input.externalAuthUserId,
      },
    });
    return row ? toDomainUser(row) : null;
  }

  async create(input: CreateUserInput, tx?: ITransactionPort): Promise<User> {
    const client = this.getClient(tx);
    const row = await client.user.create({
      data: toPrismaUserCreateData(input, createId(USER_ID_PREFIX)),
    });
    return toDomainUser(row);
  }

  async updateProfile(input: { id: string; data: UpdateUserInput }, tx?: ITransactionPort): Promise<User> {
    const client = this.getClient(tx);
    const row = await client.user.update({
      where: { id: input.id },
      data: toPrismaUserUpdateData(input.data),
    });
    return toDomainUser(row);
  }

  private getClient(tx?: ITransactionPort): PrismaClient | Prisma.TransactionClient {
    if (!tx) return this.database.getClient();
    if (tx instanceof PrismaTransactionAdapter) return tx.getClient();
    throw new Error(
      'PrismaUserRepositoryAdapter only supports PrismaTransactionAdapter when a transaction is provided.',
    );
  }
}
