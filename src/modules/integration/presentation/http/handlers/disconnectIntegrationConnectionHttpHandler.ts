import type { RequestHandler } from 'express';

import { DisconnectIntegrationConnectionCommand } from '@src/modules/integration/application/contracts/DisconnectIntegrationConnectionContract';
import type { DisconnectIntegrationConnectionUseCase } from '@modules/integration/application/use-cases/DisconnectIntegrationConnectionUseCase';
import { getAuthenticatedUser } from '@shared/presentation/http/middleware/getAuthenticatedUser';

/**
 * Handler for disconnecting an integration connection.
 * @param deps - The dependencies.
 * @returns The handler.
 */
export function disconnectIntegrationConnectionHttpHandler(deps: {
  disconnectIntegrationConnectionUseCase: DisconnectIntegrationConnectionUseCase;
}): RequestHandler {
  /**
   * Handler for disconnecting an integration connection.
   * @param request - The request.
   * @param response - The response.
   * @returns The result.
   */
  return async (request, response) => {
    const identity = getAuthenticatedUser(request);

    const command = DisconnectIntegrationConnectionCommand.parse({
      identity,
      connectionId: request.params.connectionId,
      correlationId: request.context.correlationId,
      requestId: request.context.requestId,
    });

    const result = await deps.disconnectIntegrationConnectionUseCase.execute(command);

    response.status(200).json(result);
  };
}
