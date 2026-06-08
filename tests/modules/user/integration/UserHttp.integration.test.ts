import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import { devCognitoAccessTokenClaims } from '@modules/user/infrastructure/auth/dev/dev-auth.identity.ts';
import { UserModule } from '@modules/user/user.module.ts';
import type { ModuleSetupContext } from '@shared/application/ports/module/IModulePort.ts';
import { env } from '@shared/config/env.ts';
import { PrismaDatabaseAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaDatabaseAdapter.ts';
import { PrismaUnitOfWorkAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaUnitOfWorkAdapter.ts';
import { Logger } from '@shared/infrastructure/logging/Logger.ts';
import { Messenger } from '@shared/infrastructure/messaging/Messenger.ts';
import {
  createHttpApp,
  listModuleRoutes,
  resetModuleRoutes,
} from '@shared/presentation/http/server.ts';

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
const userModule = new UserModule();

const moduleContext: ModuleSetupContext = {
  database,
  unitOfWork,
  messenger: Messenger,
  logger: Logger,
  config: env,
};

async function cleanTables(): Promise<void> {
  const client = database.getClient();
  await client.auditLog.deleteMany();
  await client.event.deleteMany();
  await client.userPreference.deleteMany();
  await client.user.deleteMany();
}

describe('POST /users HTTP integration', () => {
  const unique = Date.now().toString(36);
  const validEmail = `unique-http-user+${unique}@example.com`;
  const validExternalAuthUserId = `unique-http-external-id-${unique}`;
  const invalidEmail = `invalid-http-user+${unique}`;
  let app = createHttpApp();

  beforeAll(async () => {
    await database.start();
    await cleanTables();
    resetModuleRoutes();
    await userModule.setup(moduleContext);
    app = createHttpApp({ moduleRoutes: listModuleRoutes() });
  });

  beforeEach(async () => {
    await cleanTables();
  });

  afterAll(async () => {
    await cleanTables();
    resetModuleRoutes();
    await database.stop();
  });

  it('creates a user and preferences through POST /users', async () => {
    const correlationId = 'corr_http_create_user';
    const response = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({
        actorUserId: null,
        correlationId,
        requestId: 'req_http_create_user',
        user: {
          email: validEmail,
          externalAuthProvider: 'http_test_provider',
          externalAuthUserId: validExternalAuthUserId,
          name: 'HTTP Integration User',
        },
        preferences: {
          timezone: 'Europe/Lisbon',
          locale: 'en-US',
          metadataJson: {
            source: 'http-integration-test',
          },
        },
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('preferences');
    expect(response.body.user.email).toBe(validEmail);
    expect(response.body.preferences.userId).toBe(response.body.user.id);

    const client = database.getClient();
    const userRow = await client.user.findUnique({ where: { id: response.body.user.id } });
    expect(userRow).not.toBeNull();
    expect(userRow?.email).toBe(validEmail);

    const userPreferenceRow = await client.userPreference.findUnique({
      where: { user_id: response.body.user.id },
    });
    expect(userPreferenceRow).not.toBeNull();
    expect(userPreferenceRow?.user_id).toBe(response.body.user.id);

    const auditRows = await client.auditLog.findMany({
      where: { correlation_id: correlationId },
    });
    expect(auditRows).toHaveLength(2);

    const eventRows = await client.event.findMany({
      where: { correlation_id: correlationId },
    });
    expect(eventRows).toHaveLength(1);
  });

  it('resolves GET /users/me from the dev auth fixture identity', async () => {
    const client = database.getClient();
    const seededUser = await client.user.create({
      data: {
        id: 'usr_dev_fixture_1',
        email: devCognitoAccessTokenClaims.email!,
        external_auth_provider: 'cognito',
        external_auth_user_id: devCognitoAccessTokenClaims.sub,
        name: devCognitoAccessTokenClaims.name,
        status: 'ACTIVE',
      },
    });
    await client.userPreference.create({
      data: {
        id: 'upr_dev_fixture_1',
        user_id: seededUser.id,
        timezone: 'UTC',
        locale: 'en-US',
        metadata_json: {},
      },
    });

    const response = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer ignored-by-dev-adapter')
      .set('x-correlation-id', 'corr_http_get_me')
      .set('x-request-id', 'req_http_get_me');

    expect(env.AUTH_PROVIDER).toBe('dev');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      created: false,
      user: {
        id: seededUser.id,
        email: devCognitoAccessTokenClaims.email,
        externalAuthProvider: 'cognito',
        externalAuthUserId: devCognitoAccessTokenClaims.sub,
        name: devCognitoAccessTokenClaims.name,
      },
      preferences: {
        userId: seededUser.id,
        timezone: 'UTC',
        locale: 'en-US',
        metadataJson: {},
      },
    });
  });

  it('returns 400 with safe validation error when payload is invalid', async () => {
    const response = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({
        actorUserId: null,
        correlationId: 'corr_http_invalid_user',
        requestId: 'req_http_invalid_user',
        user: {
          email: invalidEmail,
          externalAuthProvider: 'http_test_provider',
          externalAuthUserId: `bad-http-external-id-${unique}`,
          name: 'HTTP Invalid User',
        },
        preferences: {
          locale: 'en-US',
          metadataJson: {
            source: 'http-integration-test-invalid',
          },
        },
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Validation error',
    });
    expect(Array.isArray(response.body.details)).toBe(true);
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'user.email',
          message: expect.any(String),
          code: expect.any(String),
        }),
        expect.objectContaining({
          path: 'preferences.timezone',
          message: expect.any(String),
          code: expect.any(String),
        }),
      ]),
    );

    const client = database.getClient();
    const badUserRow = await client.user.findUnique({
      where: { email: invalidEmail },
    });
    expect(badUserRow).toBeNull();
  });
});
