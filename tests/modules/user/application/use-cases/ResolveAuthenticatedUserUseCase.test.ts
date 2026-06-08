import { describe, expect, it } from 'vitest';

import type { ResolveAuthenticatedUserCommand } from '@modules/user/application/contracts/ResolveAuthenticatedUserContract.ts';
import { UserAccessBlockedError } from '@modules/user/domain/user/errors/UserAccessBlockedError.ts';
import { devCognitoAccessTokenClaims } from '@modules/user/infrastructure/auth/dev/dev-auth.identity.ts';
import type { IUserPreferenceRepository } from '@modules/user/application/ports/IUserPreferenceRepository.ts';
import type { IUserRepository } from '@modules/user/application/ports/IUserRepository.ts';
import { ResolveAuthenticatedUserUseCase } from '@modules/user/application/use-cases/ResolveAuthenticatedUserUseCase.ts';
import type { CreateUserInput, UpdateUserInput, User } from '@modules/user/domain/user/User.ts';
import type {
  CreateUserPreferenceInput,
  UpdateUserPreferenceInput,
  UserPreference,
} from '@modules/user/domain/preference/UserPreference.ts';
import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort.ts';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort.ts';
import type { OperationContext } from '@shared/domain/operation/schemas/OperationContext.ts';
import { ChangeRecorder } from '@shared/infrastructure/database/recorders/ChangeRecorder.ts';
import { EventOutboxRecorder } from '@shared/infrastructure/database/recorders/EventOutboxRecorder.ts';

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

class FakeUserRepository implements IUserRepository {
  public users: User[] = [];
  public createCalls = 0;

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByExternalIdentity(input: {
    externalAuthProvider: string;
    externalAuthUserId: string;
  }): Promise<User | null> {
    return (
      this.users.find(
        (user) =>
          user.externalAuthProvider === input.externalAuthProvider &&
          user.externalAuthUserId === input.externalAuthUserId,
      ) ?? null
    );
  }

  async create(input: CreateUserInput): Promise<User> {
    this.createCalls += 1;
    const now = new Date('2026-05-09T16:00:00.000Z');
    const user: User = {
      id: `usr_created_${this.createCalls}`,
      email: input.email,
      externalAuthProvider: input.externalAuthProvider,
      externalAuthUserId: input.externalAuthUserId,
      name: input.name ?? null,
      status: input.status ?? 'ACTIVE',
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    return user;
  }

  async updateProfile(_input: { id: string; data: UpdateUserInput }): Promise<User> {
    throw new Error('Not implemented in test');
  }
}

class FakeUserPreferenceRepository implements IUserPreferenceRepository {
  public preferencesByUserId = new Map<string, UserPreference>();
  public createCalls = 0;

  async findById(id: string): Promise<UserPreference | null> {
    for (const preference of this.preferencesByUserId.values()) {
      if (preference.id === id) {
        return preference;
      }
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

  async updateByUserId(_input: { userId: string; data: UpdateUserPreferenceInput }): Promise<UserPreference> {
    throw new Error('Not implemented in test');
  }
}

function makeCommand(overrides?: Partial<ResolveAuthenticatedUserCommand>): ResolveAuthenticatedUserCommand {
  return {
    identity: {
      provider: 'cognito',
      providerUserId: devCognitoAccessTokenClaims.sub,
      email: devCognitoAccessTokenClaims.email,
      name: devCognitoAccessTokenClaims.name,
      emailVerified: devCognitoAccessTokenClaims.email_verified,
    },
    correlationId: 'corr-auth-1',
    requestId: 'req-auth-1',
    ...overrides,
  };
}

function makeExistingUser(overrides?: Partial<User>): User {
  const now = new Date('2026-05-09T16:01:00.000Z');
  return {
    id: 'usr_existing_1',
    email: devCognitoAccessTokenClaims.email!,
    externalAuthProvider: 'cognito',
    externalAuthUserId: devCognitoAccessTokenClaims.sub,
    name: devCognitoAccessTokenClaims.name ?? null,
    status: 'ACTIVE',
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeExistingPreferences(overrides?: Partial<UserPreference>): UserPreference {
  const now = new Date('2026-05-09T16:02:00.000Z');
  return {
    id: 'upr_existing_1',
    userId: 'usr_existing_1',
    timezone: 'America/New_York',
    locale: 'en-US',
    metadataJson: { theme: 'dark' },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('ResolveAuthenticatedUserUseCase', () => {
  it('creates user + default preferences, records audits, enqueues user.created, and returns created=true', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const userRepository = new FakeUserRepository();
    const preferenceRepository = new FakeUserPreferenceRepository();
    const useCase = new ResolveAuthenticatedUserUseCase(unitOfWork, userRepository, preferenceRepository);

    const result = await useCase.execute(makeCommand());

    expect(result.created).toBe(true);
    expect(result.user.id).toBe('usr_created_1');
    expect(result.preferences).toMatchObject({
      userId: 'usr_created_1',
      timezone: 'UTC',
      locale: 'en-US',
      metadataJson: {},
    });
    expect(unitOfWork.lastContext).toEqual({
      actor: { type: 'USER', id: devCognitoAccessTokenClaims.sub },
      correlationId: 'corr-auth-1',
      requestId: 'req-auth-1',
      source: 'HTTP_API',
      metadataJson: { authProvider: 'cognito', providerUserId: devCognitoAccessTokenClaims.sub },
    });

    const changes = unitOfWork.lastChanges.list();
    expect(changes).toHaveLength(2);
    expect(changes[0]).toMatchObject({
      action: 'USER_CREATED',
      target: { type: 'user', id: 'usr_created_1' },
      category: 'USER_ACTION',
      severity: 'INFO',
    });
    expect(changes[1]).toMatchObject({
      action: 'USER_PREFERENCE_CREATED',
      target: { type: 'user_preference', id: 'upr_created_1' },
      category: 'USER_ACTION',
      severity: 'INFO',
    });

    const events = unitOfWork.lastEvents.list();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'user.created',
      category: 'USER',
      target: { type: 'user', id: 'usr_created_1' },
      orderingKey: 'usr_created_1',
      payloadJson: {
        userId: 'usr_created_1',
        userPreferenceId: 'upr_created_1',
        source: 'auth_resolution',
      },
    });
  });

  it('returns existing active user with existing preferences without creating, auditing, or events', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const userRepository = new FakeUserRepository();
    const preferenceRepository = new FakeUserPreferenceRepository();
    userRepository.users.push(makeExistingUser());
    preferenceRepository.preferencesByUserId.set('usr_existing_1', makeExistingPreferences());
    const useCase = new ResolveAuthenticatedUserUseCase(unitOfWork, userRepository, preferenceRepository);

    const result = await useCase.execute(makeCommand());

    expect(result.created).toBe(false);
    expect(result.user.id).toBe('usr_existing_1');
    expect(result.preferences.id).toBe('upr_existing_1');
    expect(userRepository.createCalls).toBe(0);
    expect(preferenceRepository.createCalls).toBe(0);
    expect(unitOfWork.lastChanges.list()).toHaveLength(0);
    expect(unitOfWork.lastEvents.list()).toHaveLength(0);
  });

  it('repairs missing preferences for existing active user and enqueues user.preferences_created', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const userRepository = new FakeUserRepository();
    const preferenceRepository = new FakeUserPreferenceRepository();
    userRepository.users.push(makeExistingUser());
    const useCase = new ResolveAuthenticatedUserUseCase(unitOfWork, userRepository, preferenceRepository);

    const result = await useCase.execute(makeCommand());

    expect(result.created).toBe(false);
    expect(result.user.id).toBe('usr_existing_1');
    expect(result.preferences).toMatchObject({
      userId: 'usr_existing_1',
      timezone: 'UTC',
      locale: 'en-US',
      metadataJson: {},
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
      target: { type: 'user', id: 'usr_existing_1' },
      orderingKey: 'usr_existing_1',
      payloadJson: {
        userId: 'usr_existing_1',
        userPreferenceId: 'upr_created_1',
        source: 'auth_resolution_repair',
      },
    });
  });

  it('throws UserAccessBlockedError with USER_DISABLED for disabled users', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const userRepository = new FakeUserRepository();
    const preferenceRepository = new FakeUserPreferenceRepository();
    userRepository.users.push(makeExistingUser({ status: 'DISABLED' }));
    const useCase = new ResolveAuthenticatedUserUseCase(unitOfWork, userRepository, preferenceRepository);

    await expect(useCase.execute(makeCommand())).rejects.toMatchObject({
      name: 'UserAccessBlockedError',
      reason: 'USER_DISABLED',
    });
    await expect(useCase.execute(makeCommand())).rejects.toBeInstanceOf(UserAccessBlockedError);
  });

  it('throws UserAccessBlockedError with USER_DELETED for deleted users', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const userRepository = new FakeUserRepository();
    const preferenceRepository = new FakeUserPreferenceRepository();
    userRepository.users.push(makeExistingUser({ status: 'DELETED', deletedAt: new Date('2026-05-09T16:03:00.000Z') }));
    const useCase = new ResolveAuthenticatedUserUseCase(unitOfWork, userRepository, preferenceRepository);

    await expect(useCase.execute(makeCommand())).rejects.toMatchObject({
      name: 'UserAccessBlockedError',
      reason: 'USER_DELETED',
    });
    await expect(useCase.execute(makeCommand())).rejects.toBeInstanceOf(UserAccessBlockedError);
  });

  it('throws when email is missing for first-time local user creation and does not create user', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const userRepository = new FakeUserRepository();
    const preferenceRepository = new FakeUserPreferenceRepository();
    const useCase = new ResolveAuthenticatedUserUseCase(unitOfWork, userRepository, preferenceRepository);

    await expect(
      useCase.execute(
        makeCommand({
          identity: {
            provider: 'cognito',
            providerUserId: devCognitoAccessTokenClaims.sub,
            name: 'No Email User',
          },
        }),
      ),
    ).rejects.toThrow('Verified auth identity email is required to create a user.');

    expect(userRepository.createCalls).toBe(0);
    expect(preferenceRepository.createCalls).toBe(0);
    expect(unitOfWork.lastChanges.list()).toHaveLength(0);
    expect(unitOfWork.lastEvents.list()).toHaveLength(0);
  });
});
