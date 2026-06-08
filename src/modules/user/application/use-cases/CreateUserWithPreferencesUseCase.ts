import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import { UserAuditActions, toUserAuditSnapshot } from '../../domain/user/User.ts';
import {
  UserPreferenceAuditActions,
  toUserPreferenceAuditSnapshot,
} from '../../domain/preference/UserPreference.ts';
import {
  CreateUserWithPreferencesCommand,
  CreateUserWithPreferencesResult,
} from '../contracts/CreateUserWithPreferencesContract.ts';
import type { IUserPreferenceRepository } from '../ports/IUserPreferenceRepository.ts';
import type { IUserRepository } from '../ports/IUserRepository.ts';

export class CreateUserWithPreferencesUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWorkPort,
    private readonly userRepository: IUserRepository,
    private readonly userPreferenceRepository: IUserPreferenceRepository,
  ) {}

  async execute(command: CreateUserWithPreferencesCommand): Promise<CreateUserWithPreferencesResult> {
    const parsed = CreateUserWithPreferencesCommand.parse(command);
    const hasActorUser = parsed.actorUserId !== null && parsed.actorUserId !== undefined;
    const auditCategory = hasActorUser ? 'USER_ACTION' : 'SYSTEM_ACTION';

    return this.unitOfWork.execute(
      {
        actor: {
          type: hasActorUser ? 'USER' : 'SYSTEM',
          id: parsed.actorUserId ?? 'user-bootstrap',
        },
        correlationId: parsed.correlationId,
        requestId: parsed.requestId,
        source: 'HTTP_API',
      },
      async (tx) => {
        const user = await this.userRepository.create(parsed.user, tx);
        const preferences = await this.userPreferenceRepository.create(
          { ...parsed.preferences, userId: user.id },
          tx,
        );

        tx.changes.record({
          action: UserAuditActions.UserCreated,
          target: { type: 'user', id: user.id },
          afterSnapshot: toUserAuditSnapshot(user),
          category: auditCategory,
          severity: 'INFO',
        });

        tx.changes.record({
          action: UserPreferenceAuditActions.UserPreferenceCreated,
          target: { type: 'user_preference', id: preferences.id },
          afterSnapshot: toUserPreferenceAuditSnapshot(preferences),
          category: auditCategory,
          severity: 'INFO',
        });

        tx.events.enqueue({
          type: 'user.created',
          category: 'USER',
          target: { type: 'user', id: user.id },
          orderingKey: user.id,
          payloadJson: {
            userId: user.id,
            userPreferenceId: preferences.id,
          },
        });

        return CreateUserWithPreferencesResult.parse({ user, preferences });
      },
    );
  }
}
