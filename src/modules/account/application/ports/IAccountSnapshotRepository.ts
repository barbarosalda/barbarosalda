import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type {
    CreateTradingAccountSnapshotInput,
    TradingAccountSnapshot,
} from '../../domain/TradingAccountSnapshot/TradingAccountSnapshot.ts';

export interface IAccountSnapshotRepository extends IRepositoryPort<TradingAccountSnapshot> {
    findLatestByTradingAccountId(tradingAccountId: string, tx?: ITransactionPort): Promise<TradingAccountSnapshot | null>;
    create(input: CreateTradingAccountSnapshotInput, tx?: ITransactionPort): Promise<TradingAccountSnapshot>;
}
