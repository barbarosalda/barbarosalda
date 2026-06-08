import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { createUserWithPreferencesHttpHandler } from '@modules/user/presentation/http/handlers/createUserWithPreferencesHttpHandler';
import type { CreateUserWithPreferencesUseCase } from '@modules/user/application/use-cases/CreateUserWithPreferencesUseCase';

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

function makeMockResponse(): Response {
  const response = {
    locals: {},
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  vi.mocked(response.status).mockReturnValue(response);

  return response;
}

describe('createUserWithPreferencesHttpHandler', () => {
  it('returns 201 when request is valid', async () => {
    const expectedResult = {
      user: { id: 'usr_1', email: 'user@example.com' },
      preferences: { id: 'upr_1', userId: 'usr_1', timezone: 'Europe/Lisbon' },
    };
    const execute = vi.fn().mockResolvedValue(expectedResult);
    const useCase = { execute } as unknown as CreateUserWithPreferencesUseCase;
    const handler = createUserWithPreferencesHttpHandler({
      createUserWithPreferencesUseCase: useCase,
    });
    const request = { body: makeValidBody() } as Request;
    const response = makeMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await handler(request, response, next);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(expectedResult);
    expect(next).not.toHaveBeenCalled();
  });
});
