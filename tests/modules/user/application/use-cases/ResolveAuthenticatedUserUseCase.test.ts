import { describe, expect, it } from 'vitest';

import type { ResolveAuthenticatedUserCommand } from '@modules/user/application/contracts/ResolveAuthenticatedUserContract';
import type { IUserPreferenceRepository } from '@modules/user/application/ports/IUserPreferenceRepository';
import { ResolveAuthenticatedUserUseCase } from '@modules/user/application/use-cases/ResolveAuthenticatedUserUseCase';
import type {
  CreateUserPreferenceInput,
  UpdateUserPreferenceInput,
  UserPreference,
} from '@modules/user/domain/preference/UserPreference';
import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { OperationContext } from '@shared/domain/Operation/schemas/OperationContext';
import { devCognitoAccessTokenClaims } from '@shared/infrastructure/auth/dev/dev-auth.identity';
import { ChangeRecorder } from '@shared/infrastructure/database/recorders/ChangeRecorder';
import { EventOutboxRecorder } from '@shared/infrastructure/database/recorders/EventOutboxRecorder';

class FakeUnitOfWork implements IUnitOfWorkPort {
  public lastContext?: OperationContext;
  public lastChanges = new ChangeRecorder();
  public lastEvents = new EventOutboxRecorder();

  async execute<T>(context: OperationContext, work: (tx: ITransactionPort) => Promise<T>): Promise<T> {
    this.lastContext = context;
    this.lastChanges = new ChangeRecorder();
    this.lastEvents = new EventOutboxRecorder();

    const tx: ITransactionPort = {
      changes: this.lastChanges,
      events: this.lastEvents,
    };

    return work(tx);
  }
}

class FakeUserPreferenceRepository implements IUserPreferenceRepository {
  public preferencesByUserId = new Map<string, UserPreference>();
  public createCalls = 0;

  async findById(id: string): Promise<UserPreference | null> {
    for (const preference of this.preferencesByUserId.values()) {
      if (preference.id === id) return preference;
    }
    return null;
  }

  async findByUserId(userId: string): Promise<UserPreference | null> {
    return this.preferencesByUserId.get(userId) ?? null;
  }

  async create(input: CreateUserPreferenceInput): Promise<UserPreference> {
    this.createCalls += 1;
    const now = new Date('2026-05-09T16:00:05.000Z');
    const preference: UserPreference = {
      id: `upr_created_${this.createCalls}`,
      userId: input.userId,
      timezone: input.timezone,
      locale: input.locale ?? null,
      metadataJson: input.metadataJson ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.preferencesByUserId.set(input.userId, preference);
    return preference;
  }

  async updateByUserId(input: { userId: string; data: UpdateUserPreferenceInput }): Promise<UserPreference> {
    const existing = this.preferencesByUserId.get(input.userId);
    if (!existing) throw new Error('Preference not found.');

    const updated: UserPreference = {
      ...existing,
      timezone: input.data.timezone ?? existing.timezone,
      locale: input.data.locale ?? existing.locale,
      metadataJson: input.data.metadataJson ?? existing.metadataJson,
      updatedAt: new Date('2026-05-09T16:10:05.000Z'),
    };

    this.preferencesByUserId.set(input.userId, updated);
    return updated;
  }
}

function makeCommand(overrides?: Partial<ResolveAuthenticatedUserCommand>): ResolveAuthenticatedUserCommand {
  return {
    identity: {
      userId: devCognitoAccessTokenClaims.sub,
      provider: 'dev',
      tokenUse: 'access',
      username: devCognitoAccessTokenClaims.username,
      email: devCognitoAccessTokenClaims.email,
      name: devCognitoAccessTokenClaims.name,
      emailVerified: devCognitoAccessTokenClaims.email_verified,
      groups: [],
      scopes: ['openid', 'email', 'profile'],
    },
    correlationId: 'corr-auth-1',
    requestId: 'req-auth-1',
    ...overrides,
  };
}

function makeExistingPreferences(overrides?: Partial<UserPreference>): UserPreference {
  const now = new Date('2026-05-09T16:02:00.000Z');
  return {
    id: 'upr_existing_1',
    userId: devCognitoAccessTokenClaims.sub,
    timezone: 'America/New_York',
    locale: 'en-US',
    metadataJson: { theme: 'dark' },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('ResolveAuthenticatedUserUseCase', () => {
  it('creates default preferences for the Cognito sub and returns created=true', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const preferenceRepository = new FakeUserPreferenceRepository();
    const useCase = new ResolveAuthenticatedUserUseCase(unitOfWork, preferenceRepository);

    const result = await useCase.execute(makeCommand());

    expect(result.created).toBe(true);
    expect(result.identity.userId).toBe(devCognitoAccessTokenClaims.sub);
    expect(result.preferences).toMatchObject({
      userId: devCognitoAccessTokenClaims.sub,
      timezone: 'Europe/Lisbon',
      locale: 'en-US',
      metadataJson: {
        source: 'auth_resolution',
        authProvider: 'dev',
      },
    });

    expect(unitOfWork.lastContext).toEqual({
      actor: { type: 'USER', id: devCognitoAccessTokenClaims.sub },
      correlationId: 'corr-auth-1',
      requestId: 'req-auth-1',
      source: 'HTTP_API',
      metadataJson: {
        authProvider: 'dev',
        tokenUse: 'access',
      },
    });

    const changes = unitOfWork.lastChanges.list();
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      action: 'USER_PREFERENCE_CREATED',
      target: { type: 'user_preference', id: 'upr_created_1' },
      category: 'USER_ACTION',
      severity: 'INFO',
    });

    const events = unitOfWork.lastEvents.list();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'user.preferences_created',
      category: 'USER',
      target: { type: 'user_preference', id: 'upr_created_1' },
      orderingKey: devCognitoAccessTokenClaims.sub,
      payloadJson: {
        userId: devCognitoAccessTokenClaims.sub,
        userPreferenceId: 'upr_created_1',
        source: 'auth_resolution',
      },
    });
  });

  it('returns existing preferences without creating audits or events', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const preferenceRepository = new FakeUserPreferenceRepository();
    preferenceRepository.preferencesByUserId.set(
      devCognitoAccessTokenClaims.sub,
      makeExistingPreferences(),
    );
    const useCase = new ResolveAuthenticatedUserUseCase(unitOfWork, preferenceRepository);

    const result = await useCase.execute(makeCommand());

    expect(result.created).toBe(false);
    expect(result.identity.userId).toBe(devCognitoAccessTokenClaims.sub);
    expect(result.preferences.id).toBe('upr_existing_1');
    expect(preferenceRepository.createCalls).toBe(0);
    expect(unitOfWork.lastChanges.list()).toHaveLength(0);
    expect(unitOfWork.lastEvents.list()).toHaveLength(0);
  });

  it('rejects the old providerUserId command shape', async () => {
    const useCase = new ResolveAuthenticatedUserUseCase(
      new FakeUnitOfWork(),
      new FakeUserPreferenceRepository(),
    );

    await expect(
      useCase.execute({
        identity: {
          provider: 'cognito',
          providerUserId: devCognitoAccessTokenClaims.sub,
        },
        correlationId: 'corr-auth-1',
        requestId: 'req-auth-1',
      } as unknown as ResolveAuthenticatedUserCommand),
    ).rejects.toThrow();
  });
});
