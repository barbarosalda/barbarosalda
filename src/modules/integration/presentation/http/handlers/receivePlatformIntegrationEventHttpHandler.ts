import type { RequestHandler } from 'express';

import { ReceivePlatformIntegrationEventCommand } from '@src/modules/integration/application/contracts/ReceivePlatformIntegrationEventContract';
import type { ReceivePlatformIntegrationEventUseCase } from '@modules/integration/application/use-cases/ReceivePlatformIntegrationEventUseCase';
import { getAuthenticatedUser } from '@shared/presentation/http/middleware/getAuthenticatedUser';

/**
 * Handler for receiving a platform integration event.
 * @param deps - The dependencies.
 * @returns The handler.
 */
export function receivePlatformIntegrationEventHttpHandler(deps: {
  receivePlatformIntegrationEventUseCase: ReceivePlatformIntegrationEventUseCase;
}): RequestHandler {
  /**
   * Handler for receiving a platform integration event.
   * @param request - The request.
   * @param response - The response.
   * @returns The result.
   */
  return async (request, response) => {
    const identity = getAuthenticatedUser(request);

    const command = ReceivePlatformIntegrationEventCommand.parse({
      identity,
      connectionId: request.params.connectionId,
      eventType: request.body.eventType,
      payloadJson: request.body.payloadJson,
      rawPayloadJson: request.body.rawPayloadJson,
      correlationId: request.context.correlationId,
      requestId: request.context.requestId,
    });

    const result = await deps.receivePlatformIntegrationEventUseCase.execute(command);

    response.status(202).json(result);
  };
}
