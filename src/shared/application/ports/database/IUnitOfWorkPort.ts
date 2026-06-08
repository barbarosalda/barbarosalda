import type { OperationContext } from '@shared/domain/operation/schemas/OperationContext';
import type { ITransactionPort } from './ITransactionPort.ts';

export interface IUnitOfWorkPort {
  execute<T>(context: OperationContext, work: (tx: ITransactionPort) => Promise<T>): Promise<T>;
}
