import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ResolveAuthenticatedUserUseCase } from '@modules/user/application/use-cases/ResolveAuthenticatedUserUseCase';
import { PrismaUserPreferenceRepositoryAdapter } from '@modules/user/infrastructure/persistence/prisma/repository/UserPreferencePrismaRepositoryAdapter';
import { PrismaDatabaseAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaDatabaseAdapter';
import { PrismaUnitOfWorkAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaUnitOfWorkAdapter';
import { devCognitoAccessTokenClaims } from '@shared/infrastructure/auth/dev/dev-auth.identity';

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
const preferenceRepository = new PrismaUserPreferenceRepositoryAdapter(database);
const useCase = new ResolveAuthenticatedUserUseCase(unitOfWork, preferenceRepository);

async function cleanTables(): Promise<void> {
  const client = database.getClient();
  await client.auditLog.deleteMany();
  await client.event.deleteMany();
  await client.userPreference.deleteMany();
}

describe('ResolveAuthenticatedUserUseCase integration', () => {
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

  it('creates preferences for the Cognito sub without creating a local user', async () => {
    const result = await useCase.execute({
      identity: {
        userId: devCognitoAccessTokenClaims.sub,
        provider: 'dev',
        tokenUse: 'access',
        username: devCognitoAccessTokenClaims.username,
        email: devCognitoAccessTokenClaims.email,
        emailVerified: devCognitoAccessTokenClaims.email_verified,
        name: devCognitoAccessTokenClaims.name,
        groups: [],
        scopes: ['openid', 'email', 'profile'],
      },
      correlationId: 'corr_integration_auth_resolution',
      requestId: 'req_integration_auth_resolution',
    });

    expect(result.created).toBe(true);
    expect(result.identity.userId).toBe(devCognitoAccessTokenClaims.sub);
    expect(result.preferences.userId).toBe(devCognitoAccessTokenClaims.sub);
    expect(result.preferences.timezone).toBe('Europe/Lisbon');

    const client = database.getClient();
    const preferenceRow = await client.userPreference.findUnique({
      where: { user_id: devCognitoAccessTokenClaims.sub },
    });
    expect(preferenceRow).not.toBeNull();
    expect(preferenceRow?.user_id).toBe(devCognitoAccessTokenClaims.sub);

    const auditRows = await client.auditLog.findMany({
      where: { correlation_id: 'corr_integration_auth_resolution' },
    });
    expect(auditRows).toHaveLength(1);

    const eventRows = await client.event.findMany({
      where: { correlation_id: 'corr_integration_auth_resolution' },
    });
    expect(eventRows).toHaveLength(1);
  });

  it('returns existing preferences on the second call', async () => {
    await useCase.execute({
      identity: {
        userId: devCognitoAccessTokenClaims.sub,
        provider: 'dev',
        tokenUse: 'access',
        username: devCognitoAccessTokenClaims.username,
        email: devCognitoAccessTokenClaims.email,
        emailVerified: devCognitoAccessTokenClaims.email_verified,
        name: devCognitoAccessTokenClaims.name,
        groups: [],
        scopes: ['openid', 'email', 'profile'],
      },
      correlationId: 'corr_first_call',
      requestId: 'req_first_call',
    });

    const result = await useCase.execute({
      identity: {
        userId: devCognitoAccessTokenClaims.sub,
        provider: 'dev',
        tokenUse: 'access',
        username: devCognitoAccessTokenClaims.username,
        email: devCognitoAccessTokenClaims.email,
        emailVerified: devCognitoAccessTokenClaims.email_verified,
        name: devCognitoAccessTokenClaims.name,
        groups: [],
        scopes: ['openid', 'email', 'profile'],
      },
      correlationId: 'corr_second_call',
      requestId: 'req_second_call',
    });

    expect(result.created).toBe(false);
    expect(result.preferences.userId).toBe(devCognitoAccessTokenClaims.sub);

    const client = database.getClient();
    const secondCallEvents = await client.event.findMany({
      where: { correlation_id: 'corr_second_call' },
    });
    expect(secondCallEvents).toHaveLength(0);
  });
});
