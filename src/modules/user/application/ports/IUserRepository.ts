import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type { CreateUserInput, UpdateUserInput, User } from '../../domain/user/User.ts';

export interface IUserRepository extends IRepositoryPort<User> {
  findByExternalIdentity(
    input: { externalAuthProvider: string; externalAuthUserId: string },
    tx?: ITransactionPort,
  ): Promise<User | null>;
  create(input: CreateUserInput, tx?: ITransactionPort): Promise<User>;
  updateProfile(input: { id: string; data: UpdateUserInput }, tx?: ITransactionPort): Promise<User>;
}
