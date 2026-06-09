import type { RequestHandler } from 'express';

import { ResolveAuthenticatedUserCommand } from '../../../application/contracts/ResolveAuthenticatedUserContract.ts';
import type { ResolveAuthenticatedUserUseCase } from '../../../application/use-cases/ResolveAuthenticatedUserUseCase.ts';
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
