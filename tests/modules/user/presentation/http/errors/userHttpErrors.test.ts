import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import {
  UserUnauthorizedHttpError,
  userHttpErrorHandler,
} from '@modules/user/presentation/http/errors/userHttpErrors';

function makeMockResponse(): Response {
  const response = {
    locals: {},
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  vi.mocked(response.status).mockReturnValue(response);

  return response;
}

describe('userHttpErrorHandler', () => {
  it('returns 400 with safe details for Zod errors', () => {
    const response = makeMockResponse();
    const error = new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: 'Invalid body payload.',
        path: ['body'],
      },
    ]);

    userHttpErrorHandler(error, {} as Request, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation error',
        details: [
          {
            path: 'body',
            message: 'Invalid body payload.',
            code: z.ZodIssueCode.custom,
          },
        ],
      }),
    );
  });

  it('returns 401 for unauthorized HTTP errors', () => {
    const response = makeMockResponse();
    userHttpErrorHandler(
      new UserUnauthorizedHttpError('Missing Authorization header.'),
      {} as Request,
      response,
      vi.fn(),
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: 'Missing Authorization header.' });
  });

  it('returns 500 for unexpected errors', () => {
    const response = makeMockResponse();
    userHttpErrorHandler(new Error('db unavailable'), {} as Request, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
