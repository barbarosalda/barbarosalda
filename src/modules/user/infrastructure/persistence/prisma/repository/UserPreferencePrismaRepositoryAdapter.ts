import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { createId } from '@shared/kernel/ids/createId';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
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
import { getPrismaClient } from '@shared/infrastructure/database/prisma/getPrismaClient';

const USER_PREFERENCE_ID_PREFIX = 'upr';


/**
 * Prisma repository adapter for the user preference repository.
 * Implements the IUserPreferenceRepository interface.
 * 
 * @implements {IUserPreferenceRepository}
 * @param {IDatabasePort} database - The database port to use.
 */
export class PrismaUserPreferenceRepositoryAdapter implements IUserPreferenceRepository {
  constructor(private readonly database: IDatabasePort) {}

  /**
   * Finds a user preference by its ID.
   * @param id - The ID of the user preference.
   * @param tx - The transaction to use.
   * @returns The user preference.
   */
  async findById(id: string, tx?: ITransactionPort): Promise<UserPreference | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.userPreference.findUnique({ where: { id } });
    return row ? toDomainUserPreference(row) : null;
  }

  /**
   * Finds a user preference by its user ID.
   * @param userId - The ID of the user.
   * @param tx - The transaction to use.
   * @returns The user preference.
   */
  async findByUserId(userId: string, tx?: ITransactionPort): Promise<UserPreference | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.userPreference.findUnique({ where: { user_id: userId } });
    return row ? toDomainUserPreference(row) : null;
  }

  /**
   * Creates a new user preference.
   * @param input - The input to create the user preference.
   * @param tx - The transaction to use.
   * @returns The created user preference.
   */
  async create(input: CreateUserPreferenceInput, tx?: ITransactionPort): Promise<UserPreference> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.userPreference.create({
      data: toPrismaUserPreferenceCreateData(input, createId(USER_PREFERENCE_ID_PREFIX)),
    });
    return toDomainUserPreference(row);
  }

  /**
   * Updates a user preference by its user ID.
   * @param input - The input to update the user preference.
   * @param tx - The transaction to use.
   * @returns The updated user preference.
   */
  async updateByUserId(
    input: { userId: string; data: UpdateUserPreferenceInput },
    tx?: ITransactionPort,
  ): Promise<UserPreference> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.userPreference.update({
      where: { user_id: input.userId },
      data: toPrismaUserPreferenceUpdateData(input.data),
    });
    return toDomainUserPreference(row);
  }
}
