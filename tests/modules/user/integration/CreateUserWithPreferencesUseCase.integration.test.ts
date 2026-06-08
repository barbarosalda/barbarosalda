import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';

import { CreateUserWithPreferencesUseCase } from '@modules/user/application/use-cases/CreateUserWithPreferencesUseCase.ts';
import { PrismaUserPreferenceRepositoryAdapter } from '@modules/user/infrastructure/persistence/prisma/repository/PrismaUserPreferenceRepositoryAdapter.ts';
import { PrismaUserRepositoryAdapter } from '@modules/user/infrastructure/persistence/prisma/repository/PrismaUserRepositoryAdapter.ts';
import { PrismaDatabaseAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaDatabaseAdapter.ts';
import { PrismaUnitOfWorkAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaUnitOfWorkAdapter.ts';

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for integration tests.');
}

if (!databaseUrl.includes('traderlock_test') && !databaseUrl.includes(':5433')) {
  throw new Error(
    `Unsafe DATABASE_URL for integration tests: ${databaseUrl}. Expected URL to include "traderlock_test" or ":5433".`,
  );
}

const database = new PrismaDatabaseAdapter();
const unitOfWork = new PrismaUnitOfWorkAdapter(database);
const userRepository = new PrismaUserRepositoryAdapter(database);
const userPreferenceRepository = new PrismaUserPreferenceRepositoryAdapter(database);
const useCase = new CreateUserWithPreferencesUseCase(unitOfWork, userRepository, userPreferenceRepository);

async function cleanTables(): Promise<void> {
  const client = database.getClient();
  await client.auditLog.deleteMany();
  await client.event.deleteMany();
  await client.userPreference.deleteMany();
  await client.user.deleteMany();
}

describe('CreateUserWithPreferencesUseCase integration', () => {
  beforeAll(async () => {
    await database.start();
    await cleanTables();
  });

  beforeEach(async () => {
    await cleanTables();
  });

  afterAll(async () => {
    await cleanTables();
    await database.stop();
  });

  it('execute(command) creates durable DB rows atomically', async () => {
    const unique = Date.now().toString(36);
    const correlationId = 'corr_integration_create_user';
    const requestId = 'req_integration_create_user';

    const result = await useCase.execute({
      actorUserId: null,
      correlationId,
      requestId,
      user: {
        email: `integration+${unique}@traderlock.dev`,
        externalAuthProvider: 'test_provider',
        externalAuthUserId: `test_provider_user_${unique}`,
        name: 'Integration User',
        status: 'ACTIVE',
      },
      preferences: {
        timezone: 'Europe/Lisbon',
        locale: 'en-US',
        metadataJson: { source: 'integration-test' },
      },
    });

    expect(result.user.email).toBe(`integration+${unique}@traderlock.dev`);
    expect(result.preferences.userId).toBe(result.user.id);

    const client = database.getClient();
    const userRow = await client.user.findUnique({ where: { id: result.user.id } });
    expect(userRow).not.toBeNull();
    expect(userRow?.email).toBe(result.user.email);

    const userPreferenceRow = await client.userPreference.findUnique({ where: { user_id: result.user.id } });
    expect(userPreferenceRow).not.toBeNull();
    expect(userPreferenceRow?.user_id).toBe(result.user.id);

    const auditRows = await client.auditLog.findMany({
      where: { correlation_id: correlationId },
      orderBy: { action: 'asc' },
    });

    expect(auditRows).toHaveLength(2);
    expect(auditRows.map((row) => row.action)).toEqual(['USER_CREATED', 'USER_PREFERENCE_CREATED']);
    expect(auditRows.every((row) => row.actor_type === 'SYSTEM')).toBe(true);
    expect(auditRows.every((row) => row.source === 'HTTP_API')).toBe(true);

    const eventRows = await client.event.findMany({
      where: { correlation_id: correlationId },
    });

    expect(eventRows).toHaveLength(1);
    expect(eventRows[0]).toMatchObject({
      type: 'user.created',
      category: 'USER',
      target_type: 'user',
      target_id: result.user.id,
    });
    expect(eventRows[0].payload_json).toMatchObject({
      userId: result.user.id,
      userPreferenceId: result.preferences.id,
    });
  });
});
