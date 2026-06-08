import { describe, expect, it } from 'vitest';

import type { CreateUserWithPreferencesCommand } from '@modules/user/application/contracts/CreateUserWithPreferencesContract.ts';
import {
  CreateUserWithPreferencesUseCase,
} from '@modules/user/application/use-cases/CreateUserWithPreferencesUseCase.ts';
import type { IUserPreferenceRepository } from '@modules/user/application/ports/IUserPreferenceRepository.ts';
import type { IUserRepository } from '@modules/user/application/ports/IUserRepository.ts';
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
  async findById(_id: string): Promise<User | null> {
    return null;
  }

  async findByExternalIdentity(_input: {
    externalAuthProvider: string;
    externalAuthUserId: string;
  }): Promise<User | null> {
    return null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const now = new Date('2026-05-09T15:00:00.000Z');
    return {
      id: 'usr_test_1',
      email: input.email,
      externalAuthProvider: input.externalAuthProvider,
      externalAuthUserId: input.externalAuthUserId,
      name: input.name ?? null,
      status: input.status ?? 'ACTIVE',
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateProfile(_input: { id: string; data: UpdateUserInput }): Promise<User> {
    throw new Error('Not implemented in test');
  }
}

class FakeUserPreferenceRepository implements IUserPreferenceRepository {
  async findById(_id: string): Promise<UserPreference | null> {
    return null;
  }

  async findByUserId(_userId: string): Promise<UserPreference | null> {
    return null;
  }

  async create(input: CreateUserPreferenceInput): Promise<UserPreference> {
    const now = new Date('2026-05-09T15:00:05.000Z');
    return {
      id: 'upr_test_1',
      userId: input.userId,
      timezone: input.timezone,
      locale: input.locale ?? null,
      metadataJson: input.metadataJson ?? null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateByUserId(_input: { userId: string; data: UpdateUserPreferenceInput }): Promise<UserPreference> {
    throw new Error('Not implemented in test');
  }
}

function makeValidCommand(): CreateUserWithPreferencesCommand {
  return {
    actorUserId: null,
    correlationId: 'corr-123',
    requestId: 'req-123',
    user: {
      email: 'trader@example.com',
      externalAuthProvider: 'auth0',
      externalAuthUserId: 'auth0|trader',
      name: 'Trader Lock',
      status: 'ACTIVE',
    },
    preferences: {
      timezone: 'UTC',
      locale: 'en-GB',
      metadataJson: { notifications: { email: true } },
    },
  };
}

describe('CreateUserWithPreferencesUseCase', () => {
  it('creates user and preferences, records audit changes, enqueues event, and returns both', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const userRepository = new FakeUserRepository();
    const userPreferenceRepository = new FakeUserPreferenceRepository();
    const useCase = new CreateUserWithPreferencesUseCase(unitOfWork, userRepository, userPreferenceRepository);

    const result = await useCase.execute(makeValidCommand());

    expect(result.user.id).toBe('usr_test_1');
    expect(result.preferences.id).toBe('upr_test_1');
    expect(result.preferences.userId).toBe(result.user.id);

    expect(unitOfWork.lastContext).toEqual({
      actor: { type: 'SYSTEM', id: 'user-bootstrap' },
      correlationId: 'corr-123',
      requestId: 'req-123',
      source: 'HTTP_API',
    });

    const changes = unitOfWork.lastChanges.list();
    expect(changes).toHaveLength(2);
    expect(changes[0]).toMatchObject({
      action: 'USER_CREATED',
      target: { type: 'user', id: 'usr_test_1' },
      category: 'SYSTEM_ACTION',
      severity: 'INFO',
    });
    expect(changes[1]).toMatchObject({
      action: 'USER_PREFERENCE_CREATED',
      target: { type: 'user_preference', id: 'upr_test_1' },
      category: 'SYSTEM_ACTION',
      severity: 'INFO',
    });

    const events = unitOfWork.lastEvents.list();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'user.created',
      category: 'USER',
      target: { type: 'user', id: 'usr_test_1' },
      orderingKey: 'usr_test_1',
      payloadJson: { userId: 'usr_test_1', userPreferenceId: 'upr_test_1' },
    });
  });

  it('uses USER actor and USER_ACTION category when actorUserId exists', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const useCase = new CreateUserWithPreferencesUseCase(
      unitOfWork,
      new FakeUserRepository(),
      new FakeUserPreferenceRepository(),
    );

    await useCase.execute({
      ...makeValidCommand(),
      actorUserId: 'usr_actor_1',
    });

    expect(unitOfWork.lastContext).toEqual({
      actor: { type: 'USER', id: 'usr_actor_1' },
      correlationId: 'corr-123',
      requestId: 'req-123',
      source: 'HTTP_API',
    });

    const categories = unitOfWork.lastChanges.list().map((change) => change.category);
    expect(categories).toEqual(['USER_ACTION', 'USER_ACTION']);
  });

  it('rejects invalid command when timezone is missing', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const useCase = new CreateUserWithPreferencesUseCase(
      unitOfWork,
      new FakeUserRepository(),
      new FakeUserPreferenceRepository(),
    );

    await expect(
      useCase.execute({
        ...makeValidCommand(),
        preferences: {
          locale: 'en-GB',
        },
      } as unknown as CreateUserWithPreferencesCommand),
    ).rejects.toThrow();
  });

  it('rejects invalid command when email is invalid', async () => {
    const unitOfWork = new FakeUnitOfWork();
    const useCase = new CreateUserWithPreferencesUseCase(
      unitOfWork,
      new FakeUserRepository(),
      new FakeUserPreferenceRepository(),
    );

    await expect(
      useCase.execute({
        ...makeValidCommand(),
        user: {
          ...makeValidCommand().user,
          email: 'invalid-email',
        },
      }),
    ).rejects.toThrow();
  });
});
