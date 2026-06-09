import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { UserModule } from '@modules/user/user.module';
import type { ModuleSetupContext } from '@shared/application/ports/module/IModulePort';
import { env } from '@shared/config/env';
import { PrismaDatabaseAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaDatabaseAdapter';
import { PrismaUnitOfWorkAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaUnitOfWorkAdapter';
import { Logger } from '@shared/infrastructure/logging/Logger';
import { Messenger } from '@shared/infrastructure/messaging/Messenger';
import { createHttpApp, resetModuleRoutes } from '@shared/presentation/http/server';

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
}

describe('User HTTP integration', () => {
  let app = createHttpApp();

  beforeAll(async () => {
    await database.start();
    await cleanTables();
    resetModuleRoutes();
    await userModule.setup(moduleContext);
    app = createHttpApp({ moduleRoutes: userModule.routes });
  });

  beforeEach(async () => {
    await cleanTables();
  });

  afterAll(async () => {
    await cleanTables();
    resetModuleRoutes();
    await database.stop();
  });

  it('returns 410 for removed POST /users local user creation', async () => {
    const response = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ any: 'payload' });

    expect(response.status).toBe(410);
    expect(response.body).toEqual({
      error: 'LOCAL_USER_CREATION_REMOVED',
      message: 'Authenticate with Cognito and call GET /users/me to create preferences automatically.',
    });
  });

  it('resolves GET /users/me from the dev auth fixture identity and creates preferences', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer ignored-by-dev-adapter')
      .set('x-correlation-id', 'corr_http_get_me')
      .set('x-request-id', 'req_http_get_me');

    expect(env.AUTH_PROVIDER).toBe('dev');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      created: true,
      identity: {
        userId: 'dev-cognito-user-001',
        provider: 'dev',
        tokenUse: 'access',
        email: 'dev@traderlock.local',
      },
      preferences: {
        userId: 'dev-cognito-user-001',
        timezone: 'Europe/Lisbon',
        locale: 'en-US',
      },
    });

    const client = database.getClient();
    const userPreferenceRow = await client.userPreference.findUnique({
      where: { user_id: 'dev-cognito-user-001' },
    });
    expect(userPreferenceRow).not.toBeNull();
    expect(userPreferenceRow?.user_id).toBe('dev-cognito-user-001');

    const auditRows = await client.auditLog.findMany({
      where: { correlation_id: 'corr_http_get_me' },
    });
    expect(auditRows).toHaveLength(1);

    const eventRows = await client.event.findMany({
      where: { correlation_id: 'corr_http_get_me' },
    });
    expect(eventRows).toHaveLength(1);
  });

  it('updates preferences through PATCH /users/me/preferences', async () => {
    await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer ignored-by-dev-adapter')
      .set('x-correlation-id', 'corr_http_seed_preferences')
      .set('x-request-id', 'req_http_seed_preferences');

    const response = await request(app)
      .patch('/users/me/preferences')
      .set('Authorization', 'Bearer ignored-by-dev-adapter')
      .set('x-correlation-id', 'corr_http_patch_preferences')
      .set('x-request-id', 'req_http_patch_preferences')
      .send({ locale: 'pt-PT' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      preferences: {
        userId: 'dev-cognito-user-001',
        locale: 'pt-PT',
      },
    });
  });
});
