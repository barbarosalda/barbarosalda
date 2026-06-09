import type { OperationContext } from '@src/shared/domain/Operation/schemas/OperationContext';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';

export interface IUnitOfWorkPort {
  execute<T>(context: OperationContext, work: (tx: ITransactionPort) => Promise<T>): Promise<T>;
}
