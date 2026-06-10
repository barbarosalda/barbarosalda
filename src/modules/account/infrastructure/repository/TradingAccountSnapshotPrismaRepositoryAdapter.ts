import type { ITradingAccountSnapshotRepository } from '@src/modules/account/application/ports/ITradingAccountSnapshotRepository';
import type {
  CreateTradingAccountSnapshotInput,
  TradingAccountSnapshot,
} from '@modules/account/domain/TradingAccountSnapshot/TradingAccountSnapshot';
import {
  toDomainTradingAccountSnapshot,
  toPrismaTradingAccountSnapshotCreateData,
} from '@modules/account/infrastructure/repository/AccountPrismaMapper';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { getPrismaClient } from '@shared/infrastructure/database/prisma/getPrismaClient';
import { createId } from '@shared/kernel/ids/createId';

const TRADING_ACCOUNT_SNAPSHOT_ID_PREFIX = 'tas';

/**
 * Adapter for the trading account snapshot repository.
 */
export class TradingAccountSnapshotPrismaRepositoryAdapter implements ITradingAccountSnapshotRepository {
  /**
   * Constructor for the trading account snapshot repository adapter.
   * @param database - The database to use.
   */
  constructor(private readonly database: IDatabasePort) {}

  /**
   * Finds a trading account snapshot by its ID.
   * @param id - The ID of the trading account snapshot.
   * @param tx - The transaction to use.
   * @returns The trading account snapshot.
   */
  async findById(id: string, tx?: ITransactionPort): Promise<TradingAccountSnapshot | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.tradingAccountSnapshot.findUnique({ where: { id } });
    return row ? toDomainTradingAccountSnapshot(row) : null;
  }

  /**
   * Finds the latest trading account snapshot by its trading account ID.
   * @param tradingAccountId - The ID of the trading account.
   * @param tx - The transaction to use.
   * @returns The latest trading account snapshot.
   */
  async findLatestByTradingAccountId(
    tradingAccountId: string,
    tx?: ITransactionPort,
  ): Promise<TradingAccountSnapshot | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.tradingAccountSnapshot.findFirst({
      where: { trading_account_id: tradingAccountId },
      orderBy: [{ recorded_at: 'desc' }, { created_at: 'desc' }],
    });
    return row ? toDomainTradingAccountSnapshot(row) : null;
  }

  /**
   * Creates a new trading account snapshot.
   * @param input - The input to create the trading account snapshot.
   * @param tx - The transaction to use.
   * @returns The created trading account snapshot.
   */
  async create(
    input: CreateTradingAccountSnapshotInput,
    tx?: ITransactionPort,
  ): Promise<TradingAccountSnapshot> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.tradingAccountSnapshot.create({
      data: toPrismaTradingAccountSnapshotCreateData(
        input,
        createId(TRADING_ACCOUNT_SNAPSHOT_ID_PREFIX),
      ),
    });
    return toDomainTradingAccountSnapshot(row);
  }
}
