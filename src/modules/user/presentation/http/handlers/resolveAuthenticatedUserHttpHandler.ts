import type { RequestHandler } from 'express';

import { ResolveAuthenticatedUserCommand } from '@modules/user/application/contracts/ResolveAuthenticatedUserContract';
import type { ResolveAuthenticatedUserUseCase } from '@modules/user/application/use-cases/ResolveAuthenticatedUserUseCase';
import { getAuthenticatedUser } from '@shared/presentation/http/middleware/getAuthenticatedUser';

export function resolveAuthenticatedUserHttpHandler(deps: {
  resolveAuthenticatedUserUseCase: ResolveAuthenticatedUserUseCase;
}): RequestHandler {
  return async (request, response) => {
    const identity = getAuthenticatedUser(request);

    const command = ResolveAuthenticatedUserCommand.parse({
      identity,
      correlationId: request.context.correlationId,
      requestId: request.context.requestId,
    });

    const result = await deps.resolveAuthenticatedUserUseCase.execute(command);

    response.status(200).json(result);
  };
}
