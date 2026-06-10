import type { RequestHandler } from 'express';

import { ConnectIntegrationConnectionCommand } from '@modules/integration/application/contracts/ConnectIntegrationConnectionContract';
import type { ConnectIntegrationConnectionUseCase } from '@modules/integration/application/use-cases/ConnectIntegrationConnectionUseCase';
import { getAuthenticatedUser } from '@shared/presentation/http/middleware/getAuthenticatedUser';

/**
 * Handler for connecting an integration connection.
 * @param deps - The dependencies.
 * @returns The handler.
 */
export function connectIntegrationConnectionHttpHandler(deps: {
  connectIntegrationConnectionUseCase: ConnectIntegrationConnectionUseCase;
}): RequestHandler {
  /**
   * Handler for connecting an integration connection.
   * @param request - The request.
   * @param response - The response.
   * @returns The result.
   */
  return async (request, response) => {
    const identity = getAuthenticatedUser(request);

    const command = ConnectIntegrationConnectionCommand.parse({
      identity,
      providerCode: request.body.providerCode,
      payloadJson: request.body.payloadJson,
      correlationId: request.context.correlationId,
      requestId: request.context.requestId,
    });

    const result = await deps.connectIntegrationConnectionUseCase.execute(command);

    response.status(202).json(result);
  };
}
