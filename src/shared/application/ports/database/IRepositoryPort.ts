import type { ITransactionPort } from './ITransactionPort.ts';

export interface IRepositoryPort<TEntity> {
  findById(id: string, tx?: ITransactionPort): Promise<TEntity | null>;
}
