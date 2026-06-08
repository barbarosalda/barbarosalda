import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { localUserCreationRemovedHttpHandler } from '@modules/user/presentation/http/handlers/localUserCreationRemovedHttpHandler';

function makeMockResponse(): Response {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  vi.mocked(response.status).mockReturnValue(response);

  return response;
}

describe('localUserCreationRemovedHttpHandler', () => {
  it('returns 410 for the old local user creation endpoint', () => {
    const response = makeMockResponse();
    const handler = localUserCreationRemovedHttpHandler();

    handler({} as never, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(410);
    expect(response.json).toHaveBeenCalledWith({
      error: 'LOCAL_USER_CREATION_REMOVED',
      message: 'Authenticate with Cognito and call GET /users/me to create preferences automatically.',
    });
  });
});
