import type { RequestHandler } from 'express';

import type { ListIntegrationProvidersUseCase } from '@modules/integration/application/use-cases/ListIntegrationProvidersUseCase';

/**
 * Handler for listing integration providers.
 * @param deps - The dependencies.
 * @returns The handler.
 */
export function listIntegrationProvidersHttpHandler(deps: {
  listIntegrationProvidersUseCase: ListIntegrationProvidersUseCase;
}): RequestHandler {
  /**
   * Handler for listing integration providers.
   * @param request - The request.
   * @param response - The response.
   * @returns The result.
   */
  return async (_request, response) => {
    const result = await deps.listIntegrationProvidersUseCase.execute();

    response.status(200).json(result);
  };
}
