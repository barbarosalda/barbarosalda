import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';

export interface IRepositoryPort<TEntity> {
  findById(id: string, tx?: ITransactionPort): Promise<TEntity | null>;
}
