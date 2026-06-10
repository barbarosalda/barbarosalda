import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type {
  CreateIntegrationProviderInput,
  IntegrationProvider,
  UpdateIntegrationProviderInput,
} from '../../domain/IntegrationProvider/IntegrationProvider.ts';

export interface IIntegrationProviderRepository extends IRepositoryPort<IntegrationProvider> {
  findById(id: string, tx?: ITransactionPort): Promise<IntegrationProvider | null>;
  getAll(tx?: ITransactionPort): Promise<IntegrationProvider[]>;
  create(input: CreateIntegrationProviderInput, tx?: ITransactionPort): Promise<IntegrationProvider>;
  updateById(id: string, input: UpdateIntegrationProviderInput, tx?: ITransactionPort): Promise<IntegrationProvider>;
}
