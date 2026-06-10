import type { ITradingAccountRepository } from '@src/modules/account/application/ports/ITradingAccountRepository';
import type {
  CreateTradingAccountInput,
  TradingAccount,
  UpdateTradingAccountInput,
} from '@modules/account/domain/TradingAccount/TradingAccount';
import {
  toDomainTradingAccount,
  toPrismaTradingAccountCreateData,
  toPrismaTradingAccountUpdateData,
} from '@modules/account/infrastructure/repository/AccountPrismaMapper';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { getPrismaClient } from '@shared/infrastructure/database/prisma/getPrismaClient';
import { createId } from '@shared/kernel/ids/createId';

const TRADING_ACCOUNT_ID_PREFIX = 'tac';

/**
 * Adapter for the trading account repository.
 */
export class TradingAccountPrismaRepositoryAdapter implements ITradingAccountRepository {
  /**
   * Constructor for the trading account repository adapter.
   * @param database - The database to use.
   */
  constructor(private readonly database: IDatabasePort) {}

  /**
   * Finds a trading account by its ID.
   * @param id - The ID of the trading account.
   * @param tx - The transaction to use.
   * @returns The trading account.
   */
  async findById(id: string, tx?: ITransactionPort): Promise<TradingAccount | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.tradingAccount.findUnique({ where: { id } });
    return row ? toDomainTradingAccount(row) : null;
  }

  /**
   * Finds a trading account by its user ID.
   * @param userId - The ID of the user.
   * @param tx - The transaction to use.
   * @returns The trading account.
   */
  async findByUserId(userId: string, tx?: ITransactionPort): Promise<TradingAccount | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.tradingAccount.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return row ? toDomainTradingAccount(row) : null;
  }

  /**
   * Creates a new trading account.
   * @param input - The input to create the trading account.
   * @param tx - The transaction to use.
   * @returns The created trading account.
   */
  async create(input: CreateTradingAccountInput, tx?: ITransactionPort): Promise<TradingAccount> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.tradingAccount.create({
      data: toPrismaTradingAccountCreateData(input, createId(TRADING_ACCOUNT_ID_PREFIX)),
    });
    return toDomainTradingAccount(row);
  }

  /**
   * Updates a trading account by its ID.
   * @param id - The ID of the trading account.
   * @param input - The input to update the trading account.
   * @param tx - The transaction to use.
   * @returns The updated trading account.
   */
  async updateById(
    id: string,
    input: UpdateTradingAccountInput,
    tx?: ITransactionPort,
  ): Promise<TradingAccount> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.tradingAccount.update({
      where: { id },
      data: toPrismaTradingAccountUpdateData(input),
    });
    return toDomainTradingAccount(row);
  }
}
