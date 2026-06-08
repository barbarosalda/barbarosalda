import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type {
  CreateUserPreferenceInput,
  UpdateUserPreferenceInput,
  UserPreference,
} from '../../domain/preference/UserPreference.ts';

export interface IUserPreferenceRepository extends IRepositoryPort<UserPreference> {
  findByUserId(userId: string, tx?: ITransactionPort): Promise<UserPreference | null>;
  create(input: CreateUserPreferenceInput, tx?: ITransactionPort): Promise<UserPreference>;
  updateByUserId(
    input: { userId: string; data: UpdateUserPreferenceInput },
    tx?: ITransactionPort,
  ): Promise<UserPreference>;
}
