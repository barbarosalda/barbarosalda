import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import {
  UserPreferenceAuditActions,
  toUserPreferenceAuditSnapshot,
} from '@modules/user/domain/preference/UserPreference';
import {
  UpdateAuthenticatedUserPreferencesCommand,
  UpdateAuthenticatedUserPreferencesResult,
} from '@src/modules/user/application/contracts/UpdateAuthenticatedUserPreferencesContract';
import type { IUserPreferenceRepository } from '@modules/user/application/ports/IUserPreferenceRepository';

export class UpdateAuthenticatedUserPreferencesUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWorkPort,
    private readonly userPreferenceRepository: IUserPreferenceRepository,
  ) {}

  async execute(
    command: UpdateAuthenticatedUserPreferencesCommand,
  ): Promise<UpdateAuthenticatedUserPreferencesResult> {
    const parsed = UpdateAuthenticatedUserPreferencesCommand.parse(command);
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
        const beforePreferences = await this.userPreferenceRepository.findByUserId(userId, tx);

        if (!beforePreferences) {
          const createdPreferences = await this.userPreferenceRepository.create(
            {
              userId,
              timezone: parsed.preferences.timezone ?? 'Europe/Lisbon',
              locale: parsed.preferences.locale ?? 'en-US',
              metadataJson: parsed.preferences.metadataJson ?? {
                source: 'preferences_update_repair',
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

          return UpdateAuthenticatedUserPreferencesResult.parse({ preferences: createdPreferences });
        }

        const updatedPreferences = await this.userPreferenceRepository.updateByUserId(
          {
            userId,
            data: parsed.preferences,
          },
          tx,
        );

        tx.changes.record({
          action: UserPreferenceAuditActions.UserPreferenceUpdated,
          target: { type: 'user_preference', id: updatedPreferences.id },
          beforeSnapshot: toUserPreferenceAuditSnapshot(beforePreferences),
          afterSnapshot: toUserPreferenceAuditSnapshot(updatedPreferences),
          category: 'USER_ACTION',
          severity: 'INFO',
        });

        tx.events.enqueue({
          type: 'user.preferences_updated',
          category: 'USER',
          target: { type: 'user_preference', id: updatedPreferences.id },
          orderingKey: userId,
          payloadJson: {
            userId,
            userPreferenceId: updatedPreferences.id,
          },
        });

        return UpdateAuthenticatedUserPreferencesResult.parse({ preferences: updatedPreferences });
      },
    );
  }
}
