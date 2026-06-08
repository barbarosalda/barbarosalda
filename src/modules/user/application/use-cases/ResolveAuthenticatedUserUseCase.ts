import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import { UserAuditActions } from '../../domain/user/User.ts';
import {
  UserPreferenceAuditActions,
  toUserPreferenceAuditSnapshot,
} from '../../domain/preference/UserPreference.ts';
import { toUserAuditSnapshot } from '../../domain/user/User.ts';
import { UserAccessBlockedError } from '../../domain/user/errors/UserAccessBlockedError.ts';
import {
  ResolveAuthenticatedUserCommand,
  ResolveAuthenticatedUserResult,
} from '../contracts/ResolveAuthenticatedUserContract.ts';
import type { IUserPreferenceRepository } from '../ports/IUserPreferenceRepository.ts';
import type { IUserRepository } from '../ports/IUserRepository.ts';

export class ResolveAuthenticatedUserUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWorkPort,
    private readonly userRepository: IUserRepository,
    private readonly userPreferenceRepository: IUserPreferenceRepository,
  ) {}

  async execute(command: ResolveAuthenticatedUserCommand): Promise<ResolveAuthenticatedUserResult> {
    const parsed = ResolveAuthenticatedUserCommand.parse(command);

    return this.unitOfWork.execute(
      {
        actor: { type: 'USER', id: parsed.identity.providerUserId },
        correlationId: parsed.correlationId,
        requestId: parsed.requestId,
        source: 'HTTP_API',
        metadataJson: {
          authProvider: parsed.identity.provider,
          providerUserId: parsed.identity.providerUserId,
        },
      },
      async (tx) => {
        const user = await this.userRepository.findByExternalIdentity(
          {
            externalAuthProvider: parsed.identity.provider,
            externalAuthUserId: parsed.identity.providerUserId,
          },
          tx,
        );

        if (!user) {
          if (!parsed.identity.email) {
            throw new Error('Verified auth identity email is required to create a user.');
          }

          const createdUser = await this.userRepository.create(
            {
              email: parsed.identity.email,
              externalAuthProvider: parsed.identity.provider,
              externalAuthUserId: parsed.identity.providerUserId,
              name: parsed.identity.name ?? null,
              status: 'ACTIVE',
            },
            tx,
          );

          const createdPreferences = await this.userPreferenceRepository.create(
            {
              userId: createdUser.id,
              timezone: 'UTC',
              locale: 'en-US',
              metadataJson: {},
            },
            tx,
          );

          tx.changes.record({
            action: UserAuditActions.UserCreated,
            target: { type: 'user', id: createdUser.id },
            afterSnapshot: toUserAuditSnapshot(createdUser),
            category: 'USER_ACTION',
            severity: 'INFO',
          });

          tx.changes.record({
            action: UserPreferenceAuditActions.UserPreferenceCreated,
            target: { type: 'user_preference', id: createdPreferences.id },
            afterSnapshot: toUserPreferenceAuditSnapshot(createdPreferences),
            category: 'USER_ACTION',
            severity: 'INFO',
          });

          tx.events.enqueue({
            type: 'user.created',
            category: 'USER',
            target: { type: 'user', id: createdUser.id },
            orderingKey: createdUser.id,
            payloadJson: {
              userId: createdUser.id,
              userPreferenceId: createdPreferences.id,
              source: 'auth_resolution',
            },
          });

          return ResolveAuthenticatedUserResult.parse({
            user: createdUser,
            preferences: createdPreferences,
            created: true,
          });
        }

        if (user.status === 'DISABLED') {
          throw new UserAccessBlockedError('USER_DISABLED');
        }
        if (user.status === 'DELETED') {
          throw new UserAccessBlockedError('USER_DELETED');
        }

        const preferences = await this.userPreferenceRepository.findByUserId(user.id, tx);
        if (preferences) {
          return ResolveAuthenticatedUserResult.parse({
            user,
            preferences,
            created: false,
          });
        }

        const repairedPreferences = await this.userPreferenceRepository.create(
          {
            userId: user.id,
            timezone: 'UTC',
            locale: 'en-US',
            metadataJson: {},
          },
          tx,
        );

        tx.changes.record({
          action: UserPreferenceAuditActions.UserPreferenceCreated,
          target: { type: 'user_preference', id: repairedPreferences.id },
          afterSnapshot: toUserPreferenceAuditSnapshot(repairedPreferences),
          category: 'USER_ACTION',
          severity: 'INFO',
        });

        tx.events.enqueue({
          type: 'user.preferences_created',
          category: 'USER',
          target: { type: 'user', id: user.id },
          orderingKey: user.id,
          payloadJson: {
            userId: user.id,
            userPreferenceId: repairedPreferences.id,
            source: 'auth_resolution_repair',
          },
        });

        return ResolveAuthenticatedUserResult.parse({
          user,
          preferences: repairedPreferences,
          created: false,
        });
      },
    );
  }
}
