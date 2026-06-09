import type { RequestHandler } from 'express';

import { UpdateAuthenticatedUserPreferencesCommand } from '@modules/user/application/contracts/UpdateAuthenticatedUserPreferencesContract';
import type { UpdateAuthenticatedUserPreferencesUseCase } from '@modules/user/application/use-cases/UpdateAuthenticatedUserPreferencesUseCase';
import { getAuthenticatedUser } from '@shared/presentation/http/middleware/getAuthenticatedUser';

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
