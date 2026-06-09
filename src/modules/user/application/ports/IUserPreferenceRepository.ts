import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type {
  CreateUserPreferenceInput,
  UpdateUserPreferenceInput,
  UserPreference,
} from '@modules/user/domain/preference/UserPreference';

export interface IUserPreferenceRepository extends IRepositoryPort<UserPreference> {
  findByUserId(userId: string, tx?: ITransactionPort): Promise<UserPreference | null>;
  create(input: CreateUserPreferenceInput, tx?: ITransactionPort): Promise<UserPreference>;
  updateByUserId(
    input: { userId: string; data: UpdateUserPreferenceInput },
    tx?: ITransactionPort,
  ): Promise<UserPreference>;
}
