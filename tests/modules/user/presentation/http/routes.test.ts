import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import type { IAuthProviderPort } from '@modules/user/application/ports/IAuthProviderPort';
import type { ResolveAuthenticatedUserUseCase } from '@modules/user/application/use-cases/ResolveAuthenticatedUserUseCase';
import type { UpdateAuthenticatedUserPreferencesUseCase } from '@modules/user/application/use-cases/UpdateAuthenticatedUserPreferencesUseCase';
import { devCognitoAccessTokenClaims } from '@modules/user/infrastructure/auth/dev/dev-auth.identity';
import { createUserModuleRoute } from '@modules/user/presentation/http/routes';
import { requestContextMiddleware } from '@shared/presentation/http/context/requestContext';

function makeIdentity() {
  return {
    userId: devCognitoAccessTokenClaims.sub,
    provider: 'dev' as const,
    tokenUse: 'access' as const,
    username: devCognitoAccessTokenClaims.username,
    email: devCognitoAccessTokenClaims.email,
    emailVerified: devCognitoAccessTokenClaims.email_verified,
    name: devCognitoAccessTokenClaims.name,
    groups: [],
    scopes: ['openid', 'email', 'profile'],
  };
}

describe('createUserModuleRoute', () => {
  it('returns 410 for removed POST /users local user creation', async () => {
    const resolveAuthenticatedUserUseCase = {
      execute: vi.fn(),
    } as unknown as ResolveAuthenticatedUserUseCase;
    const updateAuthenticatedUserPreferencesUseCase = {
      execute: vi.fn(),
    } as unknown as UpdateAuthenticatedUserPreferencesUseCase;
    const authProvider = {
      verifyToken: vi.fn(),
    } as unknown as IAuthProviderPort;
    const moduleRoute = createUserModuleRoute({
      resolveAuthenticatedUserUseCase,
      updateAuthenticatedUserPreferencesUseCase,
      authProvider,
    });

    const app = express();
    app.use(express.json());
    app.use(moduleRoute.path, moduleRoute.router);

    const response = await request(app).post('/users').send({ any: 'payload' });

    expect(response.status).toBe(410);
    expect(response.body).toEqual({
      error: 'LOCAL_USER_CREATION_REMOVED',
      message: 'Authenticate with Cognito and call GET /users/me to create preferences automatically.',
    });
    expect(resolveAuthenticatedUserUseCase.execute).not.toHaveBeenCalled();
    expect(updateAuthenticatedUserPreferencesUseCase.execute).not.toHaveBeenCalled();
    expect(authProvider.verifyToken).not.toHaveBeenCalled();
  });

  it('returns 401 on GET /users/me when Authorization header is missing', async () => {
    const resolveAuthenticatedUserUseCase = {
      execute: vi.fn(),
    } as unknown as ResolveAuthenticatedUserUseCase;
    const updateAuthenticatedUserPreferencesUseCase = {
      execute: vi.fn(),
    } as unknown as UpdateAuthenticatedUserPreferencesUseCase;
    const authProvider = {
      verifyToken: vi.fn(),
    } as unknown as IAuthProviderPort;
    const moduleRoute = createUserModuleRoute({
      resolveAuthenticatedUserUseCase,
      updateAuthenticatedUserPreferencesUseCase,
      authProvider,
    });

    const app = express();
    app.use(requestContextMiddleware);
    app.use(express.json());
    app.use(moduleRoute.path, moduleRoute.router);

    const response = await request(app).get('/users/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Missing Authorization header.' });
    expect(authProvider.verifyToken).not.toHaveBeenCalled();
    expect(resolveAuthenticatedUserUseCase.execute).not.toHaveBeenCalled();
  });

  it('wires GET /users/me through auth provider and resolve use case', async () => {
    const identity = makeIdentity();
    const expectedResult = {
      identity,
      created: false,
      preferences: {
        id: 'upr_1',
        userId: identity.userId,
        timezone: 'Europe/Lisbon',
        locale: 'en-US',
        metadataJson: {},
        createdAt: new Date('2026-05-09T16:00:00.000Z'),
        updatedAt: new Date('2026-05-09T16:00:00.000Z'),
      },
    };
    const resolveAuthenticatedUserUseCase = {
      execute: vi.fn().mockResolvedValue(expectedResult),
    } as unknown as ResolveAuthenticatedUserUseCase;
    const updateAuthenticatedUserPreferencesUseCase = {
      execute: vi.fn(),
    } as unknown as UpdateAuthenticatedUserPreferencesUseCase;
    const authProvider = {
      verifyToken: vi.fn().mockResolvedValue(identity),
    } as unknown as IAuthProviderPort;
    const moduleRoute = createUserModuleRoute({
      resolveAuthenticatedUserUseCase,
      updateAuthenticatedUserPreferencesUseCase,
      authProvider,
    });

    const app = express();
    app.use(requestContextMiddleware);
    app.use(express.json());
    app.use(moduleRoute.path, moduleRoute.router);

    const response = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer fake-token')
      .set('x-correlation-id', 'corr-http-1')
      .set('x-request-id', 'req-http-1');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      identity: {
        userId: identity.userId,
        provider: 'dev',
        tokenUse: 'access',
      },
      created: false,
      preferences: {
        id: 'upr_1',
        userId: identity.userId,
        timezone: 'Europe/Lisbon',
      },
    });
    expect(authProvider.verifyToken).toHaveBeenCalledWith('fake-token');
    expect(resolveAuthenticatedUserUseCase.execute).toHaveBeenCalledWith({
      identity,
      correlationId: 'corr-http-1',
      requestId: 'req-http-1',
    });
  });

  it('wires PATCH /users/me/preferences through auth provider and update use case', async () => {
    const identity = makeIdentity();
    const expectedResult = {
      preferences: {
        id: 'upr_1',
        userId: identity.userId,
        timezone: 'Europe/Lisbon',
        locale: 'pt-PT',
        metadataJson: null,
        createdAt: new Date('2026-05-09T16:00:00.000Z'),
        updatedAt: new Date('2026-05-09T16:10:00.000Z'),
      },
    };
    const resolveAuthenticatedUserUseCase = {
      execute: vi.fn(),
    } as unknown as ResolveAuthenticatedUserUseCase;
    const updateAuthenticatedUserPreferencesUseCase = {
      execute: vi.fn().mockResolvedValue(expectedResult),
    } as unknown as UpdateAuthenticatedUserPreferencesUseCase;
    const authProvider = {
      verifyToken: vi.fn().mockResolvedValue(identity),
    } as unknown as IAuthProviderPort;
    const moduleRoute = createUserModuleRoute({
      resolveAuthenticatedUserUseCase,
      updateAuthenticatedUserPreferencesUseCase,
      authProvider,
    });

    const app = express();
    app.use(requestContextMiddleware);
    app.use(express.json());
    app.use(moduleRoute.path, moduleRoute.router);

    const response = await request(app)
      .patch('/users/me/preferences')
      .set('Authorization', 'Bearer fake-token')
      .set('x-correlation-id', 'corr-http-2')
      .set('x-request-id', 'req-http-2')
      .send({ locale: 'pt-PT' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      preferences: {
        userId: identity.userId,
        locale: 'pt-PT',
      },
    });
    expect(updateAuthenticatedUserPreferencesUseCase.execute).toHaveBeenCalledWith({
      identity,
      preferences: { locale: 'pt-PT' },
      correlationId: 'corr-http-2',
      requestId: 'req-http-2',
    });
  });
});
