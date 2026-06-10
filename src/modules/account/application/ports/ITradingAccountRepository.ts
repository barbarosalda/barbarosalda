import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type {
  TradingAccount,
  UpdateTradingAccountInput,
  CreateTradingAccountInput,
} from '@modules/account/domain/TradingAccount/TradingAccount';

export interface ITradingAccountRepository extends IRepositoryPort<TradingAccount> {
  findByUserId(userId: string, tx?: ITransactionPort): Promise<TradingAccount | null>;
  create(input: CreateTradingAccountInput, tx?: ITransactionPort): Promise<TradingAccount>;
  updateById(id: string, input: UpdateTradingAccountInput, tx?: ITransactionPort): Promise<TradingAccount>;
}
