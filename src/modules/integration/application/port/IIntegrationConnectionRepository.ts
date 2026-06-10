import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type {
  IntegrationConnection,
  UpdateIntegrationConnectionInput,
  CreateIntegrationConnectionInput,
} from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';

export interface IIntegrationConnectionRepository extends IRepositoryPort<IntegrationConnection> {
  findByProviderId(providerId: string, tx?: ITransactionPort): Promise<IntegrationConnection | null>;
  findByUserId(userId: string, tx?: ITransactionPort): Promise<IntegrationConnection | null>;
  create(input: CreateIntegrationConnectionInput, tx?: ITransactionPort): Promise<IntegrationConnection>;
  updateById(id: string, input: UpdateIntegrationConnectionInput, tx?: ITransactionPort): Promise<IntegrationConnection>;
}
