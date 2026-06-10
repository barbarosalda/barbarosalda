import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import {
  UserPreferenceAuditActions,
  toUserPreferenceAuditSnapshot,
} from '@modules/user/domain/preference/UserPreference';
import {
  ResolveAuthenticatedUserCommand,
  ResolveAuthenticatedUserResult,
} from '@src/modules/user/application/contracts/ResolveAuthenticatedUserContract';
import type { IUserPreferenceRepository } from '@modules/user/application/ports/IUserPreferenceRepository';

export class ResolveAuthenticatedUserUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWorkPort,
    private readonly userPreferenceRepository: IUserPreferenceRepository,
  ) {}

  async execute(command: ResolveAuthenticatedUserCommand): Promise<ResolveAuthenticatedUserResult> {
    const parsed = ResolveAuthenticatedUserCommand.parse(command);
    const userId = parsed.identity.userId;

    return this.unitOfWork.execute(
      {
        actor: { type: 'USER', id: userId },
        correlationId: parsed.correlationId,
        requestId: parsed.requestId,
        source: 'HTTP_API',
        metadataJson: {
          authProvider: parsed.identity.provider,
          tokenUse: parsed.identity.tokenUse,
        },
      },
      async (tx) => {
        const existingPreferences = await this.userPreferenceRepository.findByUserId(userId, tx);

        if (existingPreferences) {
          return ResolveAuthenticatedUserResult.parse({
            identity: parsed.identity,
            preferences: existingPreferences,
            created: false,
          });
        }

        const createdPreferences = await this.userPreferenceRepository.create(
          {
            userId,
            timezone: 'Europe/Lisbon',
            locale: 'en-US',
            metadataJson: {
              source: 'auth_resolution',
              authProvider: parsed.identity.provider,
            },
          },
          tx,
        );

        tx.changes.record({
          action: UserPreferenceAuditActions.UserPreferenceCreated,
          target: { type: 'user_preference', id: createdPreferences.id },
          afterSnapshot: toUserPreferenceAuditSnapshot(createdPreferences),
          category: 'USER_ACTION',
          severity: 'INFO',
        });

        tx.events.enqueue({
          type: 'user.preferences_created',
          category: 'USER',
          target: { type: 'user_preference', id: createdPreferences.id },
          orderingKey: userId,
          payloadJson: {
            userId,
            userPreferenceId: createdPreferences.id,
            source: 'auth_resolution',
          },
        });

        return ResolveAuthenticatedUserResult.parse({
          identity: parsed.identity,
          preferences: createdPreferences,
          created: true,
        });
      },
    );
  }
}
