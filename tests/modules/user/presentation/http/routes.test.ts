import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import type { IAuthProviderPort } from '@modules/user/application/ports/IAuthProviderPort';
import type { CreateUserWithPreferencesUseCase } from '@modules/user/application/use-cases/CreateUserWithPreferencesUseCase';
import type { ResolveAuthenticatedUserUseCase } from '@modules/user/application/use-cases/ResolveAuthenticatedUserUseCase';
import { createUserModuleRoute } from '@modules/user/presentation/http/routes';

function makeValidBody() {
  return {
    actorUserId: null,
    correlationId: 'corr-http-1',
    requestId: 'req-http-1',
    user: {
      email: 'user@example.com',
      externalAuthProvider: 'manual_test',
      externalAuthUserId: 'external-user-id',
      name: 'User Name',
    },
    preferences: {
      timezone: 'Europe/Lisbon',
      locale: 'en-US',
      metadataJson: {},
    },
  };
}

describe('createUserModuleRoute', () => {
  it('wires POST /users to the endpoint handler', async () => {
    const expectedResult = {
      user: { id: 'usr_1', email: 'user@example.com' },
      preferences: { id: 'upr_1', userId: 'usr_1', timezone: 'Europe/Lisbon' },
    };
    const execute = vi.fn().mockResolvedValue(expectedResult);
    const useCase = { execute } as unknown as CreateUserWithPreferencesUseCase;
    const resolveAuthenticatedUserUseCase = {
      execute: vi.fn(),
    } as unknown as ResolveAuthenticatedUserUseCase;
    const authProvider = {
      verifyToken: vi.fn(),
    } as unknown as IAuthProviderPort;
    const moduleRoute = createUserModuleRoute({
      createUserWithPreferencesUseCase: useCase,
      resolveAuthenticatedUserUseCase,
      authProvider,
    });

    expect(moduleRoute.path).toBe('/users');

    const app = express();
    app.use(express.json());
    app.use(moduleRoute.path, moduleRoute.router);

    const response = await request(app).post('/users').send(makeValidBody());

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expectedResult);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('returns 401 on GET /users/me when Authorization header is missing', async () => {
    const createUserWithPreferencesUseCase = {
      execute: vi.fn(),
    } as unknown as CreateUserWithPreferencesUseCase;
    const resolveAuthenticatedUserUseCase = {
      execute: vi.fn(),
    } as unknown as ResolveAuthenticatedUserUseCase;
    const authProvider = {
      verifyToken: vi.fn(),
    } as unknown as IAuthProviderPort;
    const moduleRoute = createUserModuleRoute({
      createUserWithPreferencesUseCase,
      resolveAuthenticatedUserUseCase,
      authProvider,
    });

    const app = express();
    app.use(express.json());
    app.use(moduleRoute.path, moduleRoute.router);

    const response = await request(app).get('/users/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Missing Authorization header.' });
    expect(authProvider.verifyToken).not.toHaveBeenCalled();
    expect(resolveAuthenticatedUserUseCase.execute).not.toHaveBeenCalled();
  });
});
