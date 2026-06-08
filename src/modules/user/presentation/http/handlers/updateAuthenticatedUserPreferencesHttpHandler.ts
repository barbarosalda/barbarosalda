import type { RequestHandler } from 'express';

import { UpdateAuthenticatedUserPreferencesCommand } from '../../../application/contracts/UpdateAuthenticatedUserPreferencesContract.ts';
import type { UpdateAuthenticatedUserPreferencesUseCase } from '../../../application/use-cases/UpdateAuthenticatedUserPreferencesUseCase.ts';
import { getAuthenticatedUser } from '../middleware/getAuthenticatedUser.ts';

export function updateAuthenticatedUserPreferencesHttpHandler(deps: {
  updateAuthenticatedUserPreferencesUseCase: UpdateAuthenticatedUserPreferencesUseCase;
}): RequestHandler {
  return async (request, response) => {
    const identity = getAuthenticatedUser(request);

    const command = UpdateAuthenticatedUserPreferencesCommand.parse({
      identity,
      preferences: request.body,
      correlationId: request.context.correlationId,
      requestId: request.context.requestId,
    });

    const result = await deps.updateAuthenticatedUserPreferencesUseCase.execute(command);

    response.status(200).json(result);
  };
}
